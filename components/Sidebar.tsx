
import React from 'react';
import { Link } from 'react-router-dom';
import { View } from '../types';
import { 
  LayoutGrid, 
  Image as ImageIcon, 
  Clapperboard, 
  CreditCard, 
  Sparkles,
  LogOut // LogOut is still used later, so it should not be removed from imports
} from 'lucide-react';

import { useApp } from '../src/context/AppContext';

interface SidebarProps {
  currentView: View;
  credits: number;
  userEmail?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, 
  credits,
  userEmail
}) => {
  const { isPro } = useApp();
  
  const menuItems = [
    { id: View.APP, label: 'Photo Studio', icon: ImageIcon, path: '/app', comingSoon: false },
    { id: View.MOTION, label: 'Motion Studio', icon: Clapperboard, path: '/motion', comingSoon: true },
    { id: View.GALLERY, label: 'Ma Galerie', icon: LayoutGrid, path: '/gallery', comingSoon: false },
    { id: View.PRICING, label: 'Crédits & Plans', icon: CreditCard, path: '/pricing', comingSoon: false },
  ];

  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 flex justify-around py-3 px-2 z-50 safe-area-bottom">
        {menuItems.map((item) => {
          const content = (
            <div className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all relative ${
              currentView === item.id 
                ? 'text-primary bg-primary/5' 
                : item.comingSoon
                ? 'text-gray-300 cursor-not-allowed opacity-60'
                : 'text-gray-400 hover:text-gray-600'
            }`}>
              <item.icon size={24} strokeWidth={currentView === item.id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label.split(' ')[0]}</span>
              {item.comingSoon && (
                <span className="absolute -top-1 -right-1 text-[8px] uppercase bg-gray-200 text-gray-600 px-1 py-0.5 rounded font-bold">
                  Bientôt
                </span>
              )}
            </div>
          );

          if (item.comingSoon) {
            return (
              <div key={item.id} className="relative">
                {content}
              </div>
            );
          }

          return (
            <Link key={item.id} to={item.path}>
              {content}
            </Link>
          );
        })}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex-col z-40 shadow-sm">
        
        {/* Logo Area */}
        <div className="p-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <h1 className="font-display font-bold text-2xl tracking-tight text-gray-900">
              Emojify
            </h1>
          </div>
          <p className="text-xs text-gray-400 ml-14 font-medium tracking-wide">AI CREATIVE SUITE</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          <div className="mb-6 px-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Menu Principal</p>
            <div className="space-y-1">
              {menuItems.map((item) => {
                const content = (
                  <div className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                    currentView === item.id 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 font-medium' 
                      : item.comingSoon
                      ? 'text-gray-400 cursor-not-allowed opacity-60'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}>
                    <item.icon 
                      size={20} 
                      className={`transition-transform duration-300 ${
                        currentView === item.id 
                          ? 'scale-110' 
                          : item.comingSoon 
                          ? '' 
                          : 'group-hover:scale-110'
                      }`}
                    />
                    <span>{item.label}</span>
                    
                    {item.comingSoon && (
                      <span className="ml-auto text-[10px] uppercase bg-gray-200 text-gray-600 px-2 py-0.5 rounded font-bold">
                        Bientôt
                      </span>
                    )}
                    
                    {currentView === item.id && !item.comingSoon && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                    )}
                  </div>
                );

                if (item.comingSoon) {
                  return (
                    <div 
                      key={item.id}
                      onClick={(e) => {
                        e.preventDefault();
                        // Optionnel: afficher un message ou une notification
                      }}
                      title="Fonctionnalité à venir"
                    >
                      {content}
                    </div>
                  );
                }

                return (
                  <Link key={item.id} to={item.path}>
                    {content}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>

        {/* User Profile / Credits */}
        <div className="p-4 m-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Link to="/profile" className="flex items-center gap-3 mb-3 hover:bg-slate-100 p-2 rounded-lg transition-colors -mx-2">
            <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-lg shadow-sm">
              {userEmail && typeof userEmail === 'string' && userEmail.length > 0 ? userEmail[0].toUpperCase() : '👤'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">
                {userEmail ? userEmail : 'Invité'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {isPro ? (
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary font-bold">
                    ✨ Mode Pro
                  </span>
                ) : (
                  'Plan Gratuit'
                )}
              </p>
            </div>
          </Link>
          
          <div className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-gray-500 uppercase">Crédits</span>
              <span className="text-xs font-bold text-primary">{credits} restants</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-primary to-secondary h-full rounded-full transition-all duration-500"
                style={{ width: `${(credits / 10) * 100}%` }}
              ></div>
            </div>
            <Link 
              to="/pricing"
              className="mt-3 w-full block text-center text-xs font-bold text-primary hover:text-primaryDark transition-colors py-1"
            >
              Recharger +
            </Link>
          </div>
        </div>

        {/* Logout Button */}
        {/* Assuming onChangeView is passed as a prop or available in context */}
        {/* This button was outside the aside tag, moving it inside for structural correctness */}
        <button 
            // onClick={() => onChangeView(View.LANDING)} // onChangeView is not defined in current scope
            className="mt-4 flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors w-full md:justify-start justify-center p-4"
        >
          <LogOut size={16} />
          <span className="hidden md:inline font-medium text-xs">Déconnexion</span>
        </button>
      </aside>
    </>
  );
};

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  comingSoon?: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, isActive, onClick, comingSoon }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
        ${isActive 
          ? 'bg-white shadow-md text-primary font-bold ring-1 ring-gray-100' 
          : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
        }
        justify-center md:justify-start
      `}
    >
      <span className={`${isActive ? 'text-primary' : 'text-gray-400 group-hover:text-gray-600'}`}>
        {icon}
      </span>
      <span className="hidden md:block">{label}</span>
      {comingSoon && (
        <span className="hidden md:block absolute right-2 text-[10px] uppercase bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-bold">
          Bientôt
        </span>
      )}
    </button>
  );
};
