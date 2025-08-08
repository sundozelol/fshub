import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileDetails() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    city: '',
    retail_point: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      setFormData({
        full_name: currentUser.full_name || '',
        phone_number: currentUser.phone_number || '',
        city: currentUser.city || '',
        retail_point: currentUser.retail_point || ''
      });
    } catch (error) {
      console.error("Failed to load user", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await User.updateMyUserData(formData);
      toast({
        title: "Успех!",
        description: "Ваши данные были успешно обновлены.",
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось обновить данные. Попробуйте снова.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
      <CardHeader>
        <CardTitle>Личные данные</CardTitle>
        <CardDescription>Обновите вашу контактную информацию.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="full_name">Имя</Label>
              <Input id="full_name" value={formData.full_name} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="email">Email (логин)</Label>
              <Input id="email" value={user.email} disabled />
            </div>
            <div>
              <Label htmlFor="phone_number">Номер телефона</Label>
              <Input id="phone_number" value={formData.phone_number} onChange={handleChange} placeholder="+7 (999) 999-99-99" />
            </div>
            <div>
              <Label htmlFor="city">Город</Label>
              <Input id="city" value={formData.city} onChange={handleChange} />
            </div>
            <div>
              <Label htmlFor="retail_point">Торговая точка</Label>
              <Input id="retail_point" value={formData.retail_point} onChange={handleChange} />
            </div>
             <div>
              <Label htmlFor="personal_discount">Персональная скидка</Label>
              <Input id="personal_discount" value={`${user.personal_discount || 0}%`} disabled />
            </div>
          </div>
          
          <Button type="submit" disabled={saving}>
            {saving ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}