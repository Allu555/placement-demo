'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/core/store';
import { useSocket } from '@/features/notifications/socket-client';
import { useRouter, usePathname } from 'next/navigation';
import { 
  User, Briefcase, FileText, Bot, Shield, BarChart3, Settings, LogOut,
  Bell, Sun, Moon, Menu, X, CheckSquare, Search, Award
} from 'lucide-react';
import { Button } from '../ui/button';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const { 
    user, 
    isAuthenticated, 
    theme, 
    toggleTheme, 
    checkSession, 
    isLoadingSession,
    notifications,
    logout 
  } = useAppStore();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Initialize socket listener
  useSocket();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  useEffect(() => {
    if (!isLoadingSession && !isAuthenticated) {
      router.push('/login');
    }
  }, [isLoadingSession, isAuthenticated, router]);

  if (isLoadingSession) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium text-muted-foreground">Synchronizing secure session...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  // Determine Sidebar Navigation links based on User Role
  const navigationItems: SidebarItem[] = [];

  if (user.role === 'STUDENT') {
    navigationItems.push(
      { name: 'My Profile', href: '/student/profile', icon: <User className="h-4 w-4" /> },
      { name: 'Placement Portal', href: '/student/portal', icon: <Briefcase className="h-4 w-4" /> },
      { name: 'Applications', href: '/student/applications', icon: <FileText className="h-4 w-4" /> },
      { name: 'AI Career Coach', href: '/student/ai-assistant', icon: <Bot className="h-4 w-4" /> }
    );
  } else if (user.role === 'RECRUITER' || user.role === 'HR') {
    navigationItems.push(
      { name: 'Open Drives', href: '/recruiter/jobs', icon: <Briefcase className="h-4 w-4" /> },
      { name: 'Hiring Insights', href: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> }
    );
  } else if (user.role === 'PLACEMENT_OFFICER' || user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') {
    navigationItems.push(
      { name: 'Active Drives', href: '/tpo/drives', icon: <Briefcase className="h-4 w-4" /> },
      { name: 'Student Directory', href: '/tpo/students', icon: <Search className="h-4 w-4" /> },
      { name: 'Analytics Hub', href: '/admin/analytics', icon: <BarChart3 className="h-4 w-4" /> },
      { name: 'Audit Logs', href: '/admin/audit', icon: <Shield className="h-4 w-4" /> }
    );
  }

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground premium-gradient">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card/40 backdrop-blur-md">
        {/* Brand Banner */}
        <div className="flex h-16 items-center px-6 gap-2 border-b border-border">
          <Award className="h-6 w-6 text-primary animate-pulse" />
          <span className="font-bold tracking-tight text-lg bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            Campus Placement
          </span>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary uppercase text-sm border border-primary/20">
              {user.name.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate leading-none">{user.name}</p>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{user.role.replace('_', ' ')}</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-500/10 gap-3"
            onClick={logout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header Bar */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-card/30 backdrop-blur-md px-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-1 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold tracking-tight hidden md:block">
              Welcome back, {user.name}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border bg-card/50"
            >
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </button>

            {/* Notifications Trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg hover:bg-muted transition-colors cursor-pointer border border-border bg-card/50 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-background">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-card text-card-foreground shadow-lg glass-panel p-4 z-50 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-border pb-2 mb-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    <button 
                      className="text-xs text-primary hover:underline"
                      onClick={() => setShowNotifications(false)}
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">No recent notifications</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="text-xs border-b border-border/40 pb-2 last:border-0">
                          <div className="flex justify-between font-semibold text-primary">
                            <span>{n.title}</span>
                            <span className="text-[10px] text-muted-foreground">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-black/50 backdrop-blur-sm">
          <div className="relative flex w-64 flex-col bg-card border-r border-border p-6 animate-in slide-in-from-left duration-200">
            <button 
              className="absolute right-4 top-4 p-1 rounded-md hover:bg-muted"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 mb-8 border-b border-border pb-4">
              <Award className="h-5 w-5 text-primary" />
              <span className="font-bold tracking-tight text-md">Campus Placement</span>
            </div>
            <nav className="flex-1 space-y-2">
              {navigationItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => {
                    setSidebarOpen(false);
                    router.push(item.href);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    pathname === item.href ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {item.icon}
                  {item.name}
                </button>
              ))}
            </nav>
            <div className="mt-auto border-t border-border pt-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-start text-red-500 gap-3"
                onClick={logout}
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
