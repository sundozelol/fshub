
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calculator, Heart, Info, Percent, Clock, Download, Mail } from "lucide-react";
import OrderForm from "../chat/OrderForm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { User } from "@/api/entities";
import { SendEmail } from "@/api/integrations";

// Компонент таймера скидки
const DiscountTimer = () => {
  const [timeLeft, setTimeLeft] = useState(120 * 60 * 60 * 1000); // 120 часов в миллисекундах

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (timeLeft <= 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 px-2 py-1 rounded">
        <Clock className="w-3 h-3" />
        <span>Скидка истекла</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded animate-pulse">
      <Clock className="w-3 h-3" />
      <span>Скидка действует: {formatTime(timeLeft)}</span>
    </div>
  );
};

export default function ProductCalculator({ product }) {
  const [area, setArea] = useState("");
  const [installationType, setInstallationType] = useState("straight");
  const [discount, setDiscount] = useState("");
  const [results, setResults] = useState({
    cleanArea: 0,
    areaWithReserve: 0,
    packagesNeeded: 0,
    baseCost: 0,
    myEarnings: 0,
    totalCost: 0
  });

  // Извлекаем данные из товара
  const areaPerPackage = parseFloat(String(product.params['Кол-во м2 в упаковке']).replace(',', '.')) || 0;
  const pricePerM2 = parseFloat(product.price) || 0; // Теперь это цена за м²

  // Коэффициенты запаса
  const reserveCoefficients = {
    straight: 1.05,   // +5%
    diagonal: 1.10,   // +10%
    herringbone: 1.15 // +15%
  };

  useEffect(() => {
    calculateResults();
  }, [area, installationType, discount]);

  const handleNumberInput = (value, setter) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setter(sanitized);
  };
  
  const handleDiscountInput = (value) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Ограничиваем скидку максимум 10%
    const numValue = parseFloat(sanitized) || 0;
    if (numValue > 10) {
      setDiscount("10"); // Corrected from setter("10")
    } else {
      setDiscount(sanitized); // Corrected from setter(sanitized)
    }
  };

  const calculateResults = () => {
    if (!areaPerPackage || !pricePerM2) return;

    const cleanArea = parseFloat(area) || 0;
    const userDiscount = Math.min(Math.max(0, parseFloat(discount) || 0), 10);

    if (cleanArea <= 0) {
      setResults({
        cleanArea: 0,
        areaWithReserve: 0,
        packagesNeeded: 0,
        baseCost: 0,
        myEarnings: 0,
        totalCost: 0
      });
      return;
    }

    // Площадь с запасом
    const reserveCoeff = reserveCoefficients[installationType];
    const areaWithReserve = cleanArea * reserveCoeff;

    // Количество упаковок (округляем вверх)
    const packagesNeeded = Math.ceil(areaWithReserve / areaPerPackage);

    // Расчет стоимости (цена теперь за м²)
    const baseCost = areaWithReserve * pricePerM2;
    const myEarnings = baseCost * (userDiscount / 100);
    const totalCost = baseCost - myEarnings;

    setResults({
      cleanArea: Math.round(cleanArea * 100) / 100,
      areaWithReserve: Math.round(areaWithReserve * 100) / 100,
      packagesNeeded,
      baseCost: Math.round(baseCost * 100) / 100,
      myEarnings: Math.round(myEarnings * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    });
  };

  const clearCalculation = () => {
    setArea("");
    setInstallationType("straight");
    setDiscount("");
  };

  // Функция сохранения в PDF (теперь TXT)
  const saveToPDF = async () => {
    const calculationData = {
      productName: product.name,
      vendorCode: product.vendorCode,
      area: results.cleanArea,
      areaWithReserve: results.areaWithReserve,
      packagesNeeded: results.packagesNeeded,
      pricePerM2: pricePerM2,
      areaPerPackage: areaPerPackage,
      layoutName: installationType === 'straight' ? 'Прямая укладка (+5%)' : 
                  installationType === 'diagonal' ? 'Диагональная укладка (+10%)' : 
                  'Укладка "ёлочкой" (+15%)',
      discountPercent: parseFloat(discount) || 0,
      baseCost: results.baseCost,
      discountValue: results.myEarnings,
      totalCost: results.totalCost,
      date: new Date().toLocaleDateString('ru-RU')
    };

    try {
      const { generateQuotePDF } = await import('@/api/functions');
      const response = await generateQuotePDF(calculationData);
      
      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.status} ${response.statusText}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'raschet-napolnogo-pokrytiya.txt';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (error) {
      console.error('Ошибка сохранения файла:', error);
      alert('Ошибка при сохранении файла. Попробуйте позже.');
    }
  };

  // Функция отправки на почту
  const sendByEmail = async () => {
    try {
      const user = await User.me();
      if (!user || !user.email) {
        alert('Не удалось определить ваш email. Пожалуйста, убедитесь, что вы авторизованы.');
        return;
      }

      const calculationData = {
        productName: product.name,
        vendorCode: product.vendorCode,
        area: results.cleanArea,
        areaWithReserve: results.areaWithReserve,
        packagesNeeded: results.packagesNeeded,
        pricePerM2: pricePerM2,
        layoutName: installationType === 'straight' ? 'Прямая укладка (+5%)' : 
                    installationType === 'diagonal' ? 'Диагональная укладка (+10%)' : 
                    'Укладка "ёлочкой" (+15%)',
        discountPercent: parseFloat(discount) || 0,
        baseCost: results.baseCost,
        discountValue: results.myEarnings,
        totalCost: results.totalCost,
      };

      const issuedAt = new Date().toLocaleString('ru-RU');
      const emailText = `
Расчёт напольного покрытия
Floor Service Hub • ${issuedAt}

ИНФОРМАЦИЯ О КЛИЕНТЕ
Клиент: ${user.full_name || 'Не указано'}
Email: ${user.email}
Телефон: ${user.phone_number || 'Не указано'}
Город: ${user.city || 'Не указано'}

ПАРАМЕТРЫ РАСЧЁТА
Товар: ${calculationData.productName}
Артикул: ${calculationData.vendorCode}
Способ укладки: ${calculationData.layoutName}
Площадь помещения: ${calculationData.area} м²
Площадь с запасом: ${calculationData.areaWithReserve} м²

РАСЧЁТ СТОИМОСТИ
Необходимо упаковок: ${calculationData.packagesNeeded} шт
Цена за м²: ${calculationData.pricePerM2.toLocaleString('ru-RU')} ₽

Базовая стоимость: ${calculationData.baseCost.toLocaleString('ru-RU')} ₽
${calculationData.discountPercent > 0 ? `Скидка (${calculationData.discountPercent}%): −${calculationData.discountValue.toLocaleString('ru-RU')} ₽` : ''}
ИТОГОВАЯ СТОИМОСТЬ: ${calculationData.totalCost.toLocaleString('ru-RU')} ₽

${calculationData.discountValue > 0 ? `
ВАША ЭКОНОМИЯ: ${calculationData.discountValue.toLocaleString('ru-RU')} ₽
` : ''}

Расчёт сформирован автоматически • Floor Service Hub
`;

      await SendEmail({
          to: user.email,
          subject: `Ваш расчёт напольного покрытия - ${product.name}`,
          body: emailText
      });
      
      alert(`✅ Расчёт успешно отправлен на вашу почту ${user.email}`);
      
    } catch (e) {
      console.error('Критическая ошибка при отправке email:', e);
      alert('Не удалось выполнить запрос на отправку. Пожалуйста, проверьте соединение и попробуйте позже.');
    }
  };

  if (!areaPerPackage || !pricePerM2) {
    return (
      <div className="text-center py-8 text-slate-500">
        <Calculator className="w-12 h-12 mx-auto mb-2 text-slate-400" />
        <p>Недостаточно данных для расчета</p>
        <p className="text-sm">Требуется: площадь в упаковке и цена за м²</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="bg-slate-50/50 border-slate-200/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator className="w-5 h-5 text-[#C31E2E]" />
            Введите данные для расчета
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Площадь помещения */}
          <div>
            <Label htmlFor={`area-${product.id}`}>Площадь помещения, м²</Label>
            <Input
              id={`area-${product.id}`}
              type="text"
              inputMode="decimal"
              value={area}
              onChange={(e) => handleNumberInput(e.target.value, setArea)}
              placeholder="Например, 40"
              className="focus:border-red-300 focus:ring-red-300/20"
            />
          </div>

          {/* Способ укладки */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Label className="text-base font-medium">Способ укладки</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent>
                      <p>Запас материала зависит от способа укладки.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={installationType} onValueChange={setInstallationType}>
              <SelectTrigger className="focus:border-red-300 focus:ring-red-300/20">
                <SelectValue placeholder="Выберите способ укладки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="straight">Прямая укладка (+5%)</SelectItem>
                <SelectItem value="diagonal">Диагональная укладка (+10%)</SelectItem>
                <SelectItem value="herringbone">Укладка "ёлочкой" (+15%)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Скидка с таймером */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Label htmlFor={`discount-${product.id}`}>Ваша скидка, % (макс. 10%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="w-4 h-4 text-slate-400 cursor-pointer" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Скидка применяется к базовой стоимости товара.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <DiscountTimer />
            </div>
            <div className="relative">
              <Input
                id={`discount-${product.id}`}
                type="text"
                inputMode="decimal"
                value={discount}
                onChange={(e) => handleDiscountInput(e.target.value)}
                placeholder="от 0 до 10"
                className="focus:border-red-300 focus:ring-red-300/20 pr-8"
                max="10"
              />
              <Percent className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              onClick={calculateResults}
              className="flex-1 bg-[#313131] hover:bg-[#4a4a4a] text-white"
            >
              Рассчитать
            </Button>
            <Button
              variant="outline"
              onClick={clearCalculation}
            >
              Очистить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Результаты */}
      {results.cleanArea > 0 && (
        <div className="space-y-3">
          <Card className="bg-white/80 border-slate-200 shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-800">Результаты расчета</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
               <div className="flex justify-between">
                <span className="text-slate-600">Требуемая площадь с запасом:</span>
                <span className="font-semibold">{results.areaWithReserve} м²</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Необходимо упаковок:</span>
                <span className="font-semibold">{results.packagesNeeded} шт.</span>
              </div>
               <div className="flex justify-between">
                <span className="text-slate-600">Цена за упаковку:</span>
                <span className="font-semibold">{(areaPerPackage * pricePerM2).toLocaleString('ru-RU')} ₽</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Цена за 1 м²:</span>
                <span className="font-semibold">{pricePerM2.toLocaleString('ru-RU')} ₽</span>
              </div>
              
              <Separator />

              <div className="flex justify-between">
                <span className="text-slate-600">Базовая стоимость:</span>
                <span className="font-semibold">{results.baseCost.toLocaleString('ru-RU')} ₽</span>
              </div>

              {results.myEarnings > 0 && (
                <div className="flex justify-between text-green-600">
                  <span className="text-slate-600">Скидка ({discount}%):</span>
                  <span className="font-semibold">− {results.myEarnings.toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
              
              <Separator />
              
              <div className="flex justify-between items-center pt-2">
                <span className="text-lg font-semibold text-slate-800">Итоговая стоимость:</span>
                <span className="text-2xl font-bold text-[#C31E2E]">{results.totalCost.toLocaleString('ru-RU')} ₽</span>
              </div>
            </CardContent>
          </Card>

          {/* Карточка экономии */}
          {results.myEarnings > 0 && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-100 via-green-50 to-emerald-50 border border-green-200">
              <div className="flex items-center gap-4 p-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-200 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-green-600 fill-current" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-green-800 font-semibold text-base md:text-lg">
                    Я заработаю:
                  </p>
                  <p className="text-green-700 font-bold text-xl md:text-2xl">
                    {results.myEarnings.toLocaleString('ru-RU')} ₽
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Кнопки сохранения и отправки */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={saveToPDF}
              className="flex-1 border-slate-200 hover:bg-slate-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Сохранить PDF
            </Button>
            <Button
              variant="outline"
              onClick={sendByEmail}
              className="flex-1 border-slate-200 hover:bg-slate-50"
            >
              <Mail className="w-4 h-4 mr-2" />
              Отправить на почту
            </Button>
          </div>
          
          {/* Кнопка заказа */}
          <div className="pt-2">
            <OrderForm 
              product={{
                ...product,
                calculatedQuantity: results.packagesNeeded,
                calculatedCost: results.totalCost
              }} 
            />
          </div>
        </div>
      )}
    </div>
  );
}
