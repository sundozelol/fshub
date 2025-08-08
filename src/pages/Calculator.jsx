
import React, { useState, useEffect } from "react";
import { KnowledgeBase } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator as CalculatorIcon, Search, Package, Ruler } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ProductCalculator from "../components/calculator/ProductCalculator";

export default function CalculatorPage() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [searchQuery, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const knowledgeItems = await KnowledgeBase.filter({ type: 'xml_feed' });
      
      let allProducts = [];
      for (const item of knowledgeItems) {
        if (item.xml_data?.products) {
          // Фильтруем только товары с необходимыми данными для калькулятора
          const validProducts = item.xml_data.products.filter(product => {
            const hasAreaParam = product.params && product.params['Кол-во м2 в упаковке'];
            const hasPrice = product.price;
            return hasAreaParam && hasPrice;
          });
          allProducts = [...allProducts, ...validProducts];
        }
      }
      
      setProducts(allProducts);
    } catch (error) {
      console.error("Ошибка загрузки товаров:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(product =>
      product.name?.toLowerCase().includes(query) ||
      product.vendorCode?.toLowerCase().includes(query) ||
      product.vendor?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-4 md:p-8 mb-6 md:mb-8">
          <div className="text-center mb-6 md:mb-8">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <CalculatorIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#C31E2E] to-[#940815] bg-clip-text text-transparent mb-4">
              Калькулятор напольных покрытий
            </h1>
            <p className="text-slate-600 text-base md:text-lg">
              Рассчитайте необходимое количество материала и итоговую стоимость
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Поиск по названию, артикулу, производителю..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 md:py-4 text-base md:text-lg bg-white/80 border-slate-200 focus:border-red-300 focus:ring-red-300/20 rounded-xl"
            />
          </div>

          <div className="mt-4 md:mt-6 text-center">
            <Badge variant="outline" className="bg-white/50 border-slate-200">
              Найдено товаров с возможностью расчета: {filteredProducts.length}
            </Badge>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 card-grid">
            {filteredProducts.map((product, index) => (
              <Card key={`${product.id}-${index}`} className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg w-full">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold text-slate-900 mb-2 break-words">
                        {product.name}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                          Артикул: {product.vendorCode}
                        </Badge>
                        {product.vendor && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                            {product.vendor}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {product.picture && (
                      <img 
                        src={product.picture} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mt-3">
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4" />
                      <span>{product.params['Кол-во м2 в упаковке']} м²/уп.</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Ruler className="w-4 h-4" />
                      <span className="font-semibold text-[#C31E2E]">{product.price} ₽/м²</span>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="w-full">
                  <ProductCalculator product={product} />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 text-center p-8 md:p-12">
            <CardContent>
              <CalculatorIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">Товары не найдены</h3>
              <p className="text-slate-600">
                {searchQuery 
                  ? `По запросу "${searchQuery}" не найдено товаров с данными для расчета.`
                  : "Товары с возможностью расчета отсутствуют в базе данных."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
