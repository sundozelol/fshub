
import React, { useState, useEffect } from "react";
import { Video } from "@/api/entities";
import { VideoCategory } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VideoForm from "./VideoForm";
import VideoList from "./VideoList";
import VideoCategoryManager from "./VideoCategoryManager";

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videoData, categoryData] = await Promise.all([
        Video.list("-created_date"),
        VideoCategory.list("order")
      ]);
      setVideos(videoData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Ошибка загрузки данных видео:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (itemId) => {
    if (window.confirm("Вы уверены, что хотите удалить это видео?")) {
      try {
        await Video.delete(itemId);
        await loadData();
      } catch (error) {
        console.error("Ошибка удаления видео:", error);
        alert("Ошибка при удалении видео");
      }
    }
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingItem) {
        await Video.update(editingItem.id, data);
      } else {
        await Video.create(data);
      }
      setShowForm(false);
      setEditingItem(null);
      await loadData();
    } catch (error) {
      console.error("Ошибка сохранения видео:", error);
      alert("Ошибка при сохранении видео");
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg">
        <CardHeader>
          <CardTitle>Управление Видео</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="videos" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="videos">Видео</TabsTrigger>
              <TabsTrigger value="categories">Категории видео</TabsTrigger>
            </TabsList>
            
            <TabsContent value="videos" className="mt-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h3 className="text-lg font-semibold">Все видео</h3>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadData}
                    disabled={loading}
                    className="flex-grow sm:flex-grow-0"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Обновить
                  </Button>
                  <Button onClick={() => { setEditingItem(null); setShowForm(true); }} className="flex-grow sm:flex-grow-0">
                    <Plus className="w-4 h-4 mr-2" />
                    Добавить видео
                  </Button>
                </div>
              </div>

              {showForm && (
                <VideoForm
                  item={editingItem}
                  categories={categories}
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                />
              )}
              
              <VideoList 
                items={videos}
                categories={categories}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </TabsContent>
            
            <TabsContent value="categories" className="mt-6">
              <VideoCategoryManager onUpdate={loadData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
