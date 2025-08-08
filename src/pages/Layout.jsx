

import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { MessageSquare, BookOpen, Settings, LogOut, User, Menu, HelpCircle, ShieldAlert, Clock, PlayCircle, Calculator } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { User as UserEntity } from "@/api/entities";

const navigationItems = [
  {
    title: "Чат",
    url: createPageUrl("Chat"),
    icon: MessageSquare,
  },
  {
    title: "База знаний",
    url: createPageUrl("KnowledgeBase"),
    icon: BookOpen,
  },
  {
    title: "FAQ",
    url: createPageUrl("FAQ"),
    icon: HelpCircle,
  },
  {
    title: "Видео",
    url: createPageUrl("Video"),
    icon: PlayCircle,
  },
  {
    title: "Калькулятор",
    url: createPageUrl("Calculator"),
    icon: Calculator,
  },
];

const adminItems = [
  {
    title: "Админ-панель",
    url: createPageUrl("Admin"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [isBlocked, setIsBlocked] = React.useState(false);
  const [needsApproval, setNeedsApproval] = React.useState(false);

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);
    setIsBlocked(false);
    setNeedsApproval(false);
    try {
      const currentUser = await UserEntity.me();
      console.log("Loaded user:", currentUser);
      if (currentUser.is_blocked) {
        await UserEntity.logout();
        setIsBlocked(true);
        setUser(null);
      } else if (!currentUser.is_approved && currentUser.role !== 'admin') {
        setNeedsApproval(true);
        setUser(currentUser);
        if (!currentUser.approval_requested_at) {
          await UserEntity.updateMyUserData({
            approval_requested_at: new Date().toISOString()
          });
        }
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.log("Пользователь не авторизован", error);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await UserEntity.logout();
    setUser(null);
  };

  const handleLogin = async () => {
    await UserEntity.login();
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C31E2E]" />
      </div>
    );
  }

  if (isBlocked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Доступ заблокирован</h1>
            <p className="text-slate-600 mb-8">Ваш аккаунт был заблокирован администратором. Пожалуйста, свяжитесь с поддержкой для получения дополнительной информации.</p>
            <Button
              onClick={() => window.location.reload()}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Обновить страницу
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (needsApproval) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Ожидание одобрения</h1>
            <p className="text-slate-600 mb-4">Ваш аккаунт находится на модерации. Администратор должен одобрить ваш доступ к системе.</p>
            <p className="text-sm text-slate-500 mb-8">Обычно это занимает не более 24 часов. Вы получите уведомление на email, когда доступ будет предоставлен.</p>

            <div className="space-y-3">
              <Button
                onClick={() => window.location.reload()}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Проверить статус
              </Button>
              <Button
                onClick={handleLogout}
                variant="outline"
                className="w-full border-slate-200 hover:bg-slate-50"
              >
                Выйти из аккаунта
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-2xl mx-auto mb-6 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">ИИ-Ассистент</h1>
            <p className="text-slate-600 mb-8">Войдите в систему для доступа к чату и базе знаний</p>
            <Button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-[#C31E2E] to-[#940815] hover:from-[#d12f3f] hover:to-[#a31b26] text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]"
            >
              Войти в систему
            </Button>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering layout with user:", user);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-x-hidden">
        <style>
          {`
            html, body {
              width: 100%;
              overflow-x: hidden;
              box-sizing: border-box;
            }

            * {
              box-sizing: border-box;
            }

            /* Полное устранение горизонтального скролла */
            .main-layout {
              width: 100vw;
              max-width: 100vw;
              overflow-x: hidden;
            }

            /* Исправление для админ страницы */
            .admin-page-override {
              width: 100vw !important;
              max-width: 100vw !important;
              overflow-x: hidden !important;
              margin-left: 0 !important;
              padding-left: 0 !important;
            }

            img {
              max-width: 100%;
              height: auto;
              display: block;
            }

            p, a, div {
              overflow-wrap: break-word;
              word-break: break-word;
            }

            /* Обеспечиваем правильный скролл на мобильных */
            @media (max-width: 768px) {
              .sidebar-content {
                max-width: 100vw;
                overflow-x: auto;
              }
              
              .main-content {
                width: 100%;
                min-width: 0;
                overflow-x: auto;
              }
              
              /* Исправляем таблицы на мобильных */
              table {
                min-width: 100%;
                display: block;
                overflow-x: auto;
                white-space: nowrap;
              }
              
              /* Исправляем карточки */
              .card-grid {
                grid-template-columns: 1fr;
                gap: 1rem;
              }
              
              /* Исправляем формы */
              .form-grid {
                grid-template-columns: 1fr;
              }
            }

            :root {
              --primary-gradient: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
              --surface-glass: rgba(255, 255, 255, 0.85);
              --border-glass: rgba(255, 255, 255, 0.2);
            }
          `}
        </style>

        {/* Mobile Header - Fixed */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-white/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="hover:bg-white/80 p-2 rounded-lg transition-colors duration-200">
                <Menu className="w-5 h-5 text-slate-700" />
              </SidebarTrigger>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h1 className="text-lg font-bold text-slate-900">ИИ-Ассистент</h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-slate-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Показываем сайдбар только если НЕ админ-панель */}
        {currentPageName !== "Admin" && (
          <Sidebar className="border-r border-white/20 bg-white/60 backdrop-blur-xl z-20">
            <SidebarHeader className="border-b border-white/20 p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#C31E2E] to-[#940815] rounded-xl flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Floor Service hub</h2>
                  <p className="text-xs text-slate-500">{isAdmin ? "Администратор" : (user?.user_type === 'dealer' ? "Дилер" : user?.user_type === 'manager' ? "Менеджер" : "Пользователь")}</p>
                </div>
              </div>
            </SidebarHeader>

            <SidebarContent className="p-4 sidebar-content">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                  Основные
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          className={`hover:bg-red-50 hover:text-red-700 transition-all duration-200 rounded-xl mb-1 ${
                            location.pathname === item.url ? 'bg-gradient-to-r from-[#C31E2E] to-[#940815] text-white shadow-lg hover:shadow-[0_0_15px_rgba(195,30,46,0.4)]' : ''
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              {isAdmin && (
                <SidebarGroup>
                  <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 py-2">
                    Администрирование
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {adminItems.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton
                            asChild
                            className={`hover:bg-orange-50 hover:text-orange-700 transition-all duration-200 rounded-xl mb-1 ${
                              location.pathname === item.url ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' : ''
                            }`}
                          >
                            <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                              <item.icon className="w-5 h-5" />
                              <span className="font-medium">{item.title}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              )}
            </SidebarContent>

            <SidebarFooter className="border-t border-white/20 p-6 pb-24 md:pb-6 z-30 relative">
              {user && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 text-sm truncate">
                        {user.full_name || user.email || 'Пользователь'}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {user.email || 'email не указан'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Button
                      asChild
                      variant="ghost"
                      size="icon"
                      className="hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Link to={createPageUrl("Profile")}>
                        <Settings className="w-4 h-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleLogout}
                      className="hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {!user && (
                <div className="text-center text-sm text-slate-500">
                  Загрузка информации о пользователе...
                </div>
              )}
            </SidebarFooter>
          </Sidebar>
        )}

        <main className={`flex-1 flex flex-col min-h-screen main-content ${
          currentPageName === "Admin" ? "admin-page-override" : ""
        }`}>
          <div className="flex-1 pt-16 md:pt-0 w-full min-w-0 overflow-x-hidden">
            {children}
          </div>
        </main>
        
        <Toaster />
      </div>
    </SidebarProvider>
  );
}

