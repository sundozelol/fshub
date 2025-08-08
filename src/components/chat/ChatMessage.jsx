
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Bot, ChevronDown, ChevronUp, Calculator, ListTree, Heart, Info, Percent, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import OrderForm from "./OrderForm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";

const DownloadLinkCard = ({ linkData }) => {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-800 flex-1 pr-4">{linkData.text}</p>
      <a href={linkData.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
        <Button className="bg-[#313131] hover:bg-[#4a4a4a] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all">
          СКАЧАТЬ
        </Button>
      </a>
    </div>
  );
};

const MultiDownloadLinksCard = ({ data }) => {
  return (
    <div className="space-y-3">
      {data.items.map((item, index) => (
        <div key={index} className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-slate-200/50">
          <p className="text-sm text-slate-800 flex-1 pr-4">{item.text}</p>
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0">
            <Button className="bg-[#313131] hover:bg-[#4a4a4a] text-white font-bold py-2 px-6 rounded-lg shadow-md hover:shadow-lg transition-all">
              СКАЧАТЬ
            </Button>
          </a>
        </div>
      ))}
    </div>
  );
};

// Renamed to avoid conflicts
const InlineProductCalculator = ({ product }) => {
  const [area, setArea] = useState('');
  const [installationType, setInstallationType] = useState('straight');
  const [discount, setDiscount] = useState('');
  const [results, setResults] = useState({
    cleanArea: 0,
    areaWithReserve: 0,
    packagesNeeded: 0,
    baseCost: 0,
    totalCost: 0,
    myEarnings: 0
  });
  const [isOpen, setIsOpen] = useState(false); // State for collapsible
  const [timeLeft, setTimeLeft] = useState(120 * 60 * 60 * 1000); // 120 часов для таймера

  // Извлекаем данные из товара
  const areaPerPackage = product.params?.['Кол-во м2 в упаковке'] ? parseFloat(String(product.params['Кол-во м2 в упаковке']).replace(',', '.')) : null;
  const pricePerM2 = parseFloat(product.price) || 0; // Теперь цена за м²

  // Коэффициенты запаса
  const reserveCoefficients = {
    straight: 1.05,   // +5%
    diagonal: 1.10,   // +10%
    herringbone: 1.15 // +15%
  };

  useEffect(() => {
    calculateResults();
  }, [area, installationType, discount]);

  // Таймер для скидки
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1000) return 0;
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleNumberInput = (value, setter) => {
    // Разрешаем только цифры, точку и запятую
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    setter(sanitized);
  };
  
  const handleDiscountInput = (value) => {
    const sanitized = value.replace(/[^0-9.,]/g, '').replace(',', '.');
    // Ограничиваем скидку максимум 10%
    const numValue = parseFloat(sanitized) || 0;
    if (numValue > 10) {
      setDiscount("10");
    } else {
      setDiscount(sanitized);
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
        totalCost: 0,
        myEarnings: 0
      });
      return;
    }

    // Площадь с запасом
    const reserveCoeff = reserveCoefficients[installationType];
    const areaWithReserve = cleanArea * reserveCoeff;

    // Количество упаковок (округляем вверх)
    const packagesNeeded = Math.ceil(areaWithReserve / areaPerPackage);

    // Итоговая стоимость (цена за м²)
    const baseCost = areaWithReserve * pricePerM2;
    const earnings = baseCost * (userDiscount / 100);
    const totalCost = baseCost - earnings;

    setResults({
      cleanArea: Math.round(cleanArea * 100) / 100,
      areaWithReserve: Math.round(areaWithReserve * 100) / 100,
      packagesNeeded,
      baseCost: Math.round(baseCost * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      myEarnings: Math.round(earnings * 100) / 100
    });
  };

  const clearCalculation = () => {
    setArea("");
    setInstallationType("straight");
    setDiscount("");
    setResults({
      cleanArea: 0,
      areaWithReserve: 0,
      packagesNeeded: 0,
      baseCost: 0,
      totalCost: 0,
      myEarnings: 0
    });
  };

  const formatTime = (milliseconds) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!areaPerPackage || !pricePerM2) {
    return null; // Не показываем калькулятор если нет данных
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-left">
          <div className="flex items-center gap-3">
            <Calculator className="w-5 h-5 text-[#C31E2E]" />
            <span className="font-medium text-slate-900 text-base">Рассчитать количество</span>
          </div>
          <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pt-3">
        <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-200/50 space-y-3">
           <p className="text-base font-semibold text-slate-800">Введите данные</p>
          {/* Площадь помещения */}
          <div>
            <Label htmlFor="area-chat" className="text-sm font-medium text-slate-700">Площадь помещения, м²</Label>
            <Input
              id="area-chat"
              type="text"
              inputMode="decimal"
              value={area}
              onChange={(e) => handleNumberInput(e.target.value, setArea)}
              placeholder="Например, 40"
              className="focus:border-red-300 focus:ring-red-300/20 mt-1 text-sm"
            />
          </div>

          {/* Способ укладки */}
          <div>
             <div className="flex items-center gap-1.5 mb-1">
              <Label className="text-sm font-medium text-slate-700">Способ укладки</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-pointer" /></TooltipTrigger>
                  <TooltipContent><p>Запас материала зависит от способа укладки.</p></TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Select value={installationType} onValueChange={setInstallationType}>
              <SelectTrigger className="focus:border-red-300 focus:ring-red-300/20 text-sm">
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
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Label htmlFor="discount-chat" className="text-sm font-medium text-slate-700">Ваша скидка, % (макс. 10%)</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild><Info className="w-3 h-3 text-slate-400 cursor-pointer" /></TooltipTrigger>
                    <TooltipContent><p>Скидка применяется к базовой стоимости.</p></TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              {timeLeft > 0 && (
                <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded animate-pulse">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
              )}
            </div>
            <div className="relative">
              <Input
                id="discount-chat"
                type="text"
                inputMode="decimal"
                value={discount}
                onChange={(e) => handleDiscountInput(e.target.value)}
                placeholder="от 0 до 10"
                className="focus:border-red-300 focus:ring-red-300/20 mt-1 text-sm pr-7"
              />
              <Percent className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              onClick={calculateResults} 
              className="flex-1 bg-[#313131] hover:bg-[#4a4a4a] text-white font-medium py-2 px-4 rounded-lg text-sm"
            >
              Рассчитать
            </Button>
            <Button 
              variant="outline"
              onClick={clearCalculation}
              className="px-4 text-sm"
            >
              Очистить
            </Button>
          </div>
        </div>

        {results.cleanArea > 0 && (
          <div className="space-y-3 mt-3">
             <Card className="bg-white/80 border-slate-200">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-semibold text-slate-800">
                  Результаты расчета
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2 text-xs">
                <div className="flex justify-between"><span>Площадь с запасом:</span><span className="font-bold">{results.areaWithReserve} м²</span></div>
                <div className="flex justify-between"><span>Нужно упаковок:</span><span className="font-bold text-[#C31E2E]">{results.packagesNeeded} шт.</span></div>
                <Separator />
                <div className="flex justify-between"><span>Базовая стоимость:</span><span className="font-bold">{results.baseCost.toLocaleString('ru-RU')} ₽</span></div>
                {results.myEarnings > 0 && (
                  <div className="flex justify-between text-green-600"><span>Скидка:</span><span className="font-bold">− {results.myEarnings.toLocaleString('ru-RU')} ₽</span></div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Итого:</span>
                  <span className="font-bold text-lg text-[#C31E2E]">{results.totalCost.toLocaleString('ru-RU')} ₽</span>
                </div>
              </CardContent>
            </Card>

            {/* Карточка экономии */}
            {results.myEarnings > 0 && (
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-green-100 via-green-50 to-emerald-50 border-l-4 border-green-500">
                <div className="p-3 flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-green-700 fill-current" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-semibold text-sm">Я заработаю:</p>
                    <p className="text-green-700 font-bold text-xl">{results.myEarnings.toLocaleString('ru-RU')} ₽</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};


const ProductInfoCard = ({ product }) => {
  const [characteristicsOpen, setCharacteristicsOpen] = useState(false);
  const params = product.params || {};
  
  // Группируем и объединяем некоторые параметры
  const getGroupedParams = () => {
    const grouped = {};
    
    // Объединяем размеры и толщину
    const length = params['Длина'] || params['Длина, мм'];
    const width = params['Ширина'] || params['Ширина, мм'];  
    const thickness = params['Толщина'] || params['Толщина, мм'];
    
    if (length && width) {
      let sizeText = `${length}×${width} мм`;
      if (thickness) {
        sizeText += `, толщина ${thickness}`;
      }
      grouped['Размеры'] = sizeText;
    } else if (thickness) {
      grouped['Толщина'] = thickness;
    }
    
    // Объединяем цвет и породу дерева
    const color = params['Цвет'];
    const wood = params['Порода дерева'];
    if (color && wood) {
      grouped['Цвет и порода'] = `${color}, ${wood}`;
    } else if (color) {
      grouped['Цвет'] = color;
    } else if (wood) {
      grouped['Порода дерева'] = wood;
    }
    
    // Остальные параметры добавляем как есть, исключая те, что уже сгруппированы
    Object.keys(params).forEach(key => {
      if (!['Длина', 'Длина, мм', 'Ширина', 'Ширина, мм', 'Толщина', 'Толщина, мм', 'Цвет', 'Порода дерева', 'Кол-во м2 в упаковке', 'Остаток'].includes(key)) {
        grouped[key] = params[key];
      }
    });
    
    return grouped;
  };

  const groupedParams = getGroupedParams();
  const paramKeys = Object.keys(groupedParams);

  // Получаем остаток из параметров
  const stockAmount = parseInt(params?.['Остаток'], 10) || 0;

  return (
    <div className="bg-white min-h-full">
      {/* Изображение без отступов */}
      {product.picture && (
        <div className="w-full">
          <img 
            src={product.picture} 
            alt={product.name} 
            className="w-full h-48 md:h-64 object-cover block" 
          />
        </div>
      )}

      {/* Контент с отступами */}
      <div className="p-4 space-y-4">
        {/* Заголовок и описание */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900 leading-tight mb-2">
            {product.name}
          </h1>
          
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500 mb-3">
            <span>Артикул: {product.vendorCode}</span>
            {stockAmount > 0 && (
              <>
                <span className="text-slate-300">•</span>
                <span className="text-green-600 font-medium">В наличии: {stockAmount} уп.</span>
              </>
            )}
            {product.price && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{product.price} ₽/м²</span>
              </>
            )}
          </div>

          {product.description && (
            <p className="text-slate-600 text-sm leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Аккордеон Характеристики */}
        {paramKeys.length > 0 && (
          <Collapsible open={characteristicsOpen} onOpenChange={setCharacteristicsOpen}>
            <CollapsibleTrigger asChild>
              <button className="w-full flex items-center justify-between px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition text-left">
                <div className="flex items-center gap-3">
                  <ListTree className="w-5 h-5 text-slate-600" />
                  <span className="font-medium text-slate-900 text-base">Характеристики</span>
                </div>
                <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${characteristicsOpen ? 'rotate-180' : ''}`} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3">
              <div className="bg-slate-50/50 rounded-xl divide-y divide-slate-200/50 border border-slate-200/50">
                {paramKeys.map((key) => (
                  <div key={key} className="px-4 py-2 flex justify-between items-center text-sm">
                    <span className="text-slate-500">{key}</span>
                    <span className="font-medium text-slate-900 text-right">{groupedParams[key]}</span>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Аккордеон Калькулятор */}
        <InlineProductCalculator product={product} />
        
        {/* Кнопка Заказать */}
        <div className="pt-2">
          <OrderForm product={product} />
        </div>
      </div>
    </div>
  );
};

export default function ChatMessage({ message }) {
  let contentData;
  let isProductInfo = false;
  let isDownloadLink = false;
  let isMultiDownloadLinks = false;
  const isUser = message.role === "user";

  try {
    contentData = JSON.parse(message.content);
    if (contentData && contentData.type === 'product_info') {
      isProductInfo = true;
    }
    if (contentData && contentData.type === 'download_link') {
      isDownloadLink = true;
    }
    if (contentData && contentData.type === 'multi_download_links') {
      isMultiDownloadLinks = true;
    }
  } catch (e) {
    // Not a JSON object, treat as plain text
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Avatar */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-2 ${
        isUser 
          ? "bg-gradient-to-br from-[#C31E2E] to-[#940815]" 
          : "bg-gradient-to-br from-slate-200 to-slate-300"
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-white" />
        ) : (
          <Bot className="w-5 h-5 text-slate-600" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-3xl ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl shadow-sm ${
          isUser 
            ? "bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white ml-auto px-5 py-3"
            : isProductInfo 
              ? "bg-white/80 backdrop-blur-sm border border-white/20 mr-auto w-full overflow-hidden p-0" 
              : (isDownloadLink || isMultiDownloadLinks)
                ? "bg-slate-100/90 backdrop-blur-sm border border-slate-200/50 mr-auto w-full p-3"
                : "bg-white/80 backdrop-blur-sm border border-white/20 mr-auto px-5 py-3"
        }`}>
          {isProductInfo ? (
            <ProductInfoCard product={contentData.data} />
          ) : isDownloadLink ? (
            <DownloadLinkCard linkData={contentData.data} />
          ) : isMultiDownloadLinks ? (
            <MultiDownloadLinksCard data={contentData.data} />
          ) : isUser ? (
            <p className="whitespace-pre-wrap text-white">{message.content}</p>
          ) : (
            <div className={`prose prose-sm max-w-none prose-slate`}>
              <ReactMarkdown
                components={{
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-600 hover:text-red-800 underline"
                    >
                      {children}
                    </a>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className={`text-xs text-slate-500 mt-2 px-2 ${
          isUser ? "text-right" : "text-left"
        }`}>
          {format(new Date(message.timestamp), "HH:mm", { locale: ru })}
        </div>
      </div>
    </motion.div>
  );
}
