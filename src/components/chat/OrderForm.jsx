
import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Order } from "@/api/entities";
import { LegalEntity } from "@/api/entities"; // Импорт сущности юр. лица
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Импорт Select
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";


const initialFormData = {
  user_name: "",
  user_email: "",
  phone_number: "",
  city: "",
  retail_point: "",
  legal_entity_id: "", // Заменено с legal_entity
  quantity: 1,
  comment: "",
};

export default function OrderForm({ product }) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [legalEntities, setLegalEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const loadAndSet = async () => {
        try {
          const [user, entities] = await Promise.all([
            User.me(),
            LegalEntity.list("created_date") // Сортируем по дате создания (самые старые первыми)
          ]);
          
          setLegalEntities(entities);
          // Выбираем первое созданное юр. лицо (самое старое)
          const defaultEntity = entities.length > 0 ? entities[0] : null;

          setFormData(prev => ({
            ...prev,
            user_name: user.full_name || "",
            user_email: user.email || "",
            phone_number: user.phone_number || "",
            city: user.city || "",
            retail_point: user.retail_point || "",
            legal_entity_id: defaultEntity ? defaultEntity.id : "",
            quantity: product.calculatedQuantity || 1, // Подставляем рассчитанное количество
          }));
        } catch (error) {
          console.error("Failed to load user data or legal entities", error);
           setFormData(prev => ({
            ...prev,
            quantity: product.calculatedQuantity || 1, // Подставляем рассчитанное количество даже при ошибке
          }));
        } finally {
            setLoading(false);
        }
      };
      loadAndSet();
    }
  }, [isOpen, product.calculatedQuantity]); // Добавляем calculatedQuantity в зависимости

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (value) => {
    setFormData(prev => ({ ...prev, legal_entity_id: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const selectedEntity = legalEntities.find(le => le.id === formData.legal_entity_id);
      
      const orderData = {
        order_number: `ORD-${Date.now()}`,
        article_code: product.vendorCode,
        product_name: product.name,
        user_name: formData.user_name,
        user_email: formData.user_email,
        phone_number: formData.phone_number,
        city: formData.city,
        retail_point: formData.retail_point,
        legal_entity_id: formData.legal_entity_id,
        legal_entity_name: selectedEntity ? selectedEntity.name : "Не указано",
        quantity: parseInt(formData.quantity, 10),
        total_cost: product.calculatedCost || 0,
        comment: formData.comment,
      };

      const userDataToCache = {
        full_name: formData.user_name,
        email: formData.user_email,
        phone_number: formData.phone_number,
        city: formData.city,
        retail_point: formData.retail_point,
      };

      await Promise.all([
        Order.create(orderData),
        User.updateMyUserData(userDataToCache)
      ]);

      toast({
        title: "Заказ успешно создан!",
        description: `Номер вашего заказа: ${orderData.order_number}`,
        variant: "success",
      });
      setIsOpen(false);
      setFormData(initialFormData); // Reset form completely

    } catch (error) {
      console.error("Failed to create order", error);
      toast({
        title: "Ошибка создания заказа",
        description: "Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const isSubmitDisabled = isSaving || (!formData.legal_entity_id && legalEntities.length > 0);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-gradient-to-r from-[#C31E2E] to-[#940815] hover:from-[#d12f3f] hover:to-[#a31b26] text-white shadow-lg hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]">Заказать</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Оформление заказа</DialogTitle>
          <DialogDescription>
            {product.name} (Артикул: {product.vendorCode})
            {product.calculatedQuantity && (
              <span className="block text-sm text-green-600 mt-1">
                Рассчитанное количество: {product.calculatedQuantity} упаковок
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="user_name">Имя</Label>
              <Input id="user_name" name="user_name" value={formData.user_name} onChange={handleChange} required className="focus:border-red-500 focus:ring-red-500" />
            </div>
            <div>
              <Label htmlFor="user_email">Email</Label>
              <Input id="user_email" name="user_email" type="email" value={formData.user_email} onChange={handleChange} required className="focus:border-red-500 focus:ring-red-500" />
            </div>
            <div>
              <Label htmlFor="phone_number">Номер телефона</Label>
              <Input id="phone_number" name="phone_number" value={formData.phone_number} onChange={handleChange} required className="focus:border-red-500 focus:ring-red-500" />
            </div>
            <div>
              <Label htmlFor="city">Город</Label>
              <Input id="city" name="city" value={formData.city} onChange={handleChange} required className="focus:border-red-500 focus:ring-red-500" />
            </div>
             <div className="md:col-span-2">
              <Label htmlFor="retail_point">Торговая точка</Label>
              <Input id="retail_point" name="retail_point" value={formData.retail_point} onChange={handleChange} required className="focus:border-red-500 focus:ring-red-500" />
            </div>
            
            {/* Поле выбора юр. лица */}
            <div className="md:col-span-2">
                <Label htmlFor="legal_entity_id">Юр. лицо</Label>
                {loading ? (
                    <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md"></div>
                ) : legalEntities.length > 0 ? (
                    <Select value={formData.legal_entity_id} onValueChange={handleSelectChange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Выберите юр. лицо..." />
                        </SelectTrigger>
                        <SelectContent>
                            {legalEntities.map(entity => (
                                <SelectItem key={entity.id} value={entity.id}>
                                    {entity.name} (ИНН: {entity.inn})
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ) : (
                    <Alert variant="default" className="bg-amber-50 border-amber-200">
                        <PlusCircle className="h-4 w-4 text-amber-700" />
                        <AlertDescription className="text-amber-800">
                            Юр. лица не найдены. Пожалуйста,{" "}
                            <Link to={createPageUrl("Profile")} className="font-bold underline hover:text-amber-900" onClick={() => setIsOpen(false)}>
                                добавьте их в профиле
                            </Link>
                            , чтобы продолжить.
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            <div>
              <Label htmlFor="quantity">Количество упаковок</Label>
              <Input 
                id="quantity" 
                name="quantity" 
                type="number" 
                min="1" 
                value={formData.quantity} 
                onChange={handleChange} 
                required 
                className="focus:border-red-500 focus:ring-red-500" 
                placeholder={product.calculatedQuantity ? `Рекомендуется: ${product.calculatedQuantity}` : "Введите количество"}
              />
              {product.calculatedQuantity && (
                <p className="text-xs text-slate-600 mt-1">
                  Автоматически рассчитано на основе калькулятора
                </p>
              )}
            </div>
          </div>
          <div>
            <Label htmlFor="comment">Комментарий для менеджера</Label>
            <Textarea id="comment" name="comment" value={formData.comment} onChange={handleChange} className="focus:border-red-500 focus:ring-red-500" />
          </div>
        
          <DialogFooter>
            <Button type="submit" disabled={isSubmitDisabled} className="w-full bg-gradient-to-r from-[#C31E2E] to-[#940815] hover:from-[#d12f3f] hover:to-[#a31b26] text-white shadow-lg hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]">
              {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Отправка...</> : 'Отправить заказ'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
