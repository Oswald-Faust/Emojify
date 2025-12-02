import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useApp } from '../src/context/AppContext';
import { View, AppState } from '../types';

export const Layout: React.FC = () => {
  const { credits, user, appState } = useApp();
  const location = useLocation();
  
  // Masquer la sidebar quand l'éditeur est ouvert
  const isEditing = appState === AppState.EDITING;

  // Helper to map path to View enum for Sidebar highlighting
  const getCurrentView = (): View => {
    const path = location.pathname;
    if (path === '/app') return View.APP;
    if (path === '/motion') return View.MOTION;
    if (path === '/gallery') return View.GALLERY;
    if (path === '/pricing') return View.PRICING;
    return View.APP; // Default
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans text-gray-800">
      {!isEditing && (
        <Sidebar 
          currentView={getCurrentView()} 
          credits={credits}
          userEmail={user?.email}
        />
      )}

      <div className={`flex-1 transition-all duration-300 ${!isEditing ? 'md:ml-64' : ''}`}>
        {/* Mobile Header Placeholder */}
        <div className="md:hidden h-16 bg-white border-b border-gray-100 flex items-center px-4 justify-between sticky top-0 z-30">
             <span className="font-bold text-lg">Emojify</span>
             <div className="text-xs bg-gray-100 px-2 py-1 rounded-full">{credits} crédits</div>
        </div>

        <Outlet />
      </div>
    </div>
  );
};
