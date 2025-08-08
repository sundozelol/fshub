
import React, { useState, useEffect } from "react";
import { Video as VideoEntity } from "@/api/entities";
import { VideoCategory } from "@/api/entities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlayCircle, Youtube, Video as VideoIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const PlatformIcon = ({ platform }) => {
  switch (platform) {
    case 'youtube':
      return <Youtube className="w-5 h-5 text-red-600" />;
    case 'rutube':
      return <PlayCircle className="w-5 h-5 text-red-600" />;
    case 'vk':
      return <VideoIcon className="w-5 h-5 text-red-500" />;
    default:
      return <PlayCircle className="w-5 h-5 text-slate-500" />;
  }
};

export default function VideoPage() {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterVideos();
  }, [searchQuery, selectedCategory, videos]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [videoData, categoryData] = await Promise.all([
        VideoEntity.filter({ is_published: true }, "order"),
        VideoCategory.filter({ is_active: true }, "order")
      ]);
      setVideos(videoData);
      setCategories(categoryData);
    } catch (error) {
      console.error("Ошибка загрузки видео:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterVideos = () => {
    let filtered = videos;
    if (selectedCategory !== "all") {
      filtered = filtered.filter(video => 
        video.categories && video.categories.includes(selectedCategory)
      );
    }
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(query) ||
        (video.description && video.description.toLowerCase().includes(query))
      );
    }
    setFilteredVideos(filtered);
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
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#C31E2E] to-[#940815] bg-clip-text text-transparent mb-4">
              Видеогалерея
            </h1>
            <p className="text-slate-600 text-lg">
              Полезные видео, инструкции и обзоры
            </p>
          </div>
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <Input
              placeholder="Поиск по видео..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-4 text-lg bg-white/80 border-slate-200 focus:border-red-300 focus:ring-red-300/20 rounded-xl"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setSelectedCategory("all")}
              className={selectedCategory === "all" ? "bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]" : "border-slate-200 hover:bg-slate-50"}
            >
              Все видео
            </Button>
            {categories.map(category => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={selectedCategory === category.id ? "bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]" : "border-slate-200 hover:bg-slate-50"}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {filteredVideos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVideos.map(video => (
              <Card key={video.id} className="bg-white/60 backdrop-blur-sm border border-white/20 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-4">
                  <div className="aspect-video mb-4 rounded-lg overflow-hidden">
                    <iframe
                      src={video.embed_url}
                      title={video.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                     <h3 className="font-semibold text-slate-900 text-md leading-tight">{video.title}</h3>
                     <PlatformIcon platform={video.platform} />
                  </div>
                  {video.description && <p className="text-sm text-slate-600 mb-3 line-clamp-2">{video.description}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white/60 backdrop-blur-sm border-white/20 text-center p-12">
            <CardContent>
              <PlayCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-800 mb-2">Видео не найдены</h3>
              <p className="text-slate-600">
                Попробуйте изменить поисковый запрос или выбрать другую категорию.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
