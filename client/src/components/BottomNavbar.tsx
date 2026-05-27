import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdHome, MdHistory, MdPerson, MdSportsCricket } from 'react-icons/md';
import { useAuth } from '../context/AuthContext';

const BottomNavbar: React.FC = () => {
  const { role, token } = useAuth();
  const location = useLocation();

  // Only render for logged-in users on user routes
  if (!token || role !== 'user') return null;

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { label: 'Home', path: '/', icon: MdHome },
    { label: 'Activities', path: '/activities', icon: MdSportsCricket },
    { label: 'Bookings', path: '/bookings', icon: MdHistory },
    { label: 'Profile', path: '/profile', icon: MdPerson },
  ];

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface-950/90 backdrop-blur-xl border-t border-white/5 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.5)] transition-all duration-300"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))', paddingTop: '0.75rem' }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className="flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all duration-300 relative group min-w-[64px]"
            >
              {/* Active Background Glow */}
              <div 
                className={`absolute inset-0 rounded-2xl transition-all duration-300 ${
                  active 
                    ? 'bg-primary-500/10 scale-100 opacity-100' 
                    : 'bg-white/0 scale-75 opacity-0 group-hover:bg-white/5 group-hover:scale-95 group-hover:opacity-50'
                }`} 
              />
              
              {/* Icon */}
              <item.icon 
                className={`relative z-10 text-2xl transition-all duration-300 ${
                  active 
                    ? 'text-primary-400 scale-110 drop-shadow-[0_0_8px_rgba(51,139,255,0.5)]' 
                    : 'text-surface-400 group-hover:text-surface-200'
                }`} 
              />
              
              {/* Label */}
              <span 
                className={`relative z-10 text-[9px] font-black tracking-widest uppercase transition-all duration-300 ${
                  active 
                    ? 'text-primary-400 font-bold' 
                    : 'text-surface-500 group-hover:text-surface-300'
                }`}
              >
                {item.label}
              </span>

              {/* Active indicator dot */}
              {active && (
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_6px_rgba(51,139,255,0.8)] animate-pulse" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavbar;
