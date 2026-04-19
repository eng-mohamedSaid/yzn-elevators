import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Wrench, MapPin, Users, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'الرئيسية', path: '/', icon: Home },
  { name: 'العروض', path: '/offers', icon: FileText },
  { name: 'الصيانة', path: '/maintenance', icon: Wrench },
  { name: 'المواقع', path: '/sites', icon: MapPin },
  { name: 'الموظفين', path: '/workers', icon: Users },
];

export const BottomNav: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-line px-2 py-1 flex justify-around items-center z-50 sm:hidden">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center p-2 text-secondary transition-all mobile-nav-item ${isActive ? 'active' : ''}`
          }
        >
          <item.icon size={22} />
          <span className="text-[10px] mt-1 font-medium">{item.name}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export const Sidebar: React.FC = () => {
  const { logout } = useAuth();
  
  return (
    <aside className="hidden sm:flex flex-col w-60 bg-primary text-white min-h-screen sticky top-0 py-8 z-50 flex-shrink-0">
      <div className="px-6 pb-8 border-b border-white/10 mb-6">
        <h1 className="text-xl font-bold text-accent tracking-wide italic">اليزن للمصاعد</h1>
      </div>
      
      <nav className="flex-1 flex flex-col">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item-desktop ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="px-6 mt-auto">
        <button 
          onClick={logout}
          className="w-full flex items-center gap-3 p-3 text-secondary hover:text-white transition-all text-sm font-medium"
        >
          <LogOut size={18} />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
};
