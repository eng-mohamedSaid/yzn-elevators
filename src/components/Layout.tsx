import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, BottomNav } from './Navigation';
import { useAuth } from '../context/AuthContext';

export const Layout: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-primary">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-[72px] bg-white border-b border-line flex items-center justify-between px-8 flex-shrink-0">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-accent italic">اليزن للمصاعد</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-line">
              <span className="text-xs font-bold text-secondary">Admin</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-8 pb-24 sm:pb-8">
            <div className="max-w-6xl mx-auto">
                <Outlet />
            </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
