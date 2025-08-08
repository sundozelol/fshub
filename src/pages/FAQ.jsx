
import React, { useState, useEffect } from "react";
import { FAQ as FAQEntity } from "@/api/entities";
import { FAQCategory } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown, ChevronRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function FAQPage() {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredFaqs, setFilteredFaqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterFaqs();
  }, [searchQuery, selectedCategory, faqs]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [faqData, categoryData] = await Promise.all([
        FAQEntity.filter({ is_published: true }, "order"),
        FAQCategory.filter({ is_active: true }, "order")
      ]);
      setFaqs(faqData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Ошибка загрузки FAQ:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFaqs = () => {
    let filtered = faqs;

    // Фильтр по категории
    if (selectedCategory !== "all") {
      filtered = filtered.filter(faq => 
        faq.categories && faq.categories.includes(selectedCategory)
      );
    }

    // Поиск по тексту
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query) ||
        (faq.keywords && faq.keywords.some(keyword => 
          keyword.toLowerCase().includes(query)
        ))
      );
    }

    setFilteredFaqs(filtered);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#C31E2E] to-[#940815] bg-clip-text text-transparent mb-4">
              Часто задаваемые вопросы
            </h1>
            <p className="text-slate-600 text-lg">
              Найдите ответы на самые популярные вопросы
            </p>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Поиск по вопросам и ответам..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/80 border-slate-200 focus:border-red-300 focus:ring-red-300/20 rounded-xl"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? 
                "bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]" : 
                "border-slate-200 hover:bg-slate-50"
              }
            >
              Все вопросы
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? 
                  "bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]" : 
                  "border-slate-200 hover:bg-slate-50"
                }
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-6 text-center">
            <Badge variant="outline" className="bg-white/50 border-slate-200">
              {filteredFaqs.length} вопрос{filteredFaqs.length === 1 ? '' : filteredFaqs.length < 5 ? 'а' : 'ов'}
            </Badge>
          </div>
        </div>

        {/* FAQ List */}
        <AnimatePresence>
          {filteredFaqs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem 
                      value={faq.id} 
                      className="bg-white/60 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-2 shadow-lg hover:bg-white/80 transition-all duration-300"
                    >
                      <AccordionTrigger className="hover:no-underline py-6">
                        <div className="text-left">
                          <h3 className="font-semibold text-slate-900 text-lg">
                            {faq.question}
                          </h3>
                          {faq.categories && faq.categories.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {faq.categories.map(catId => (
                                <Badge 
                                  key={catId} 
                                  variant="secondary" 
                                  className="text-xs bg-red-100 text-red-800"
                                >
                                  {getCategoryName(catId)}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="pb-6">
                        <div className="prose prose-slate max-w-none">
                          <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                            {faq.answer}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </motion.div>
          ) : (
            <Card className="bg-white/60 backdrop-blur-sm border-white/20 text-center p-12">
              <CardContent>
                <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-800 mb-2">Вопросы не найдены</h3>
                <p className="text-slate-600">
                  {searchQuery 
                    ? `По запросу "${searchQuery}" ничего не найдено. Попробуйте изменить поисковый запрос.`
                    : "В выбранной категории пока нет вопросов."
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
