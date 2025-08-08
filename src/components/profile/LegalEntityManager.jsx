import React, { useState, useEffect } from 'react';
import { LegalEntity } from '@/api/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import LegalEntityForm from './LegalEntityForm';

export default function LegalEntityManager() {
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState(null);

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    setLoading(true);
    try {
      const data = await LegalEntity.list("-created_date");
      setEntities(data);
    } catch (error) {
      console.error("Failed to load legal entities", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (entity) => {
    setEditingEntity(entity);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Вы уверены, что хотите удалить это юр. лицо?")) {
      await LegalEntity.delete(id);
      loadEntities();
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingEntity(null);
    loadEntities();
  };

  return (
    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle>Управление юридическими лицами</CardTitle>
          <CardDescription>Добавляйте и редактируйте ваши организации.</CardDescription>
        </div>
        <Button onClick={() => { setEditingEntity(null); setShowForm(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          Добавить юр. лицо
        </Button>
      </CardHeader>
      <CardContent>
        {showForm ? (
          <LegalEntityForm
            entity={editingEntity}
            onCancel={() => setShowForm(false)}
            onSuccess={handleFormSubmit}
          />
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>ИНН</TableHead>
                  <TableHead>По умолчанию</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Загрузка...</TableCell></TableRow>
                ) : entities.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center">Юр. лица не добавлены.</TableCell></TableRow>
                ) : (
                  entities.map(entity => (
                    <TableRow key={entity.id}>
                      <TableCell>{entity.name}</TableCell>
                      <TableCell>{entity.inn}</TableCell>
                      <TableCell>{entity.is_default ? "Да" : "Нет"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(entity)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(entity.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}