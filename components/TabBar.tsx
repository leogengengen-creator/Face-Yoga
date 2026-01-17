import React from 'react';
import { ViewState } from '../types';
import { Home, Camera, Users, Image as ImageIcon } from 'lucide-react';

interface TabBarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentView, setView }) => {
  const getTabClass = (view: ViewState) => {
    const isActive = currentView === view;
    return `flex flex-col items-center justify-center w-full h-full space-y-1 ${
      isActive ? 'text-pink-600' : 'text-gray-400'
    }`;
  };

  return (
    <div 
      className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 flex justify-around items-start z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
      style={{ 
        height: 'calc(5rem + env(safe-area-inset-bottom))', 
        paddingBottom: 'env(safe-area-inset-bottom)' 
      }}
    >
      {/* Container specifically for the icons, fixed height part */}
      <div className="w-full h-20 flex justify-around items-center">
        <button onClick={() => setView(ViewState.HOME)} className={getTabClass(ViewState.HOME)}>
          <Home size={24} />
          <span className="text-xs font-medium">Workout</span>
        </button>
        
        <button onClick={() => setView(ViewState.GALLERY)} className={getTabClass(ViewState.GALLERY)}>
          <ImageIcon size={24} />
          <span className="text-xs font-medium">Gallery</span>
        </button>

        <button onClick={() => setView(ViewState.COMMUNITY)} className={getTabClass(ViewState.COMMUNITY)}>
          <Users size={24} />
          <span className="text-xs font-medium">Community</span>
        </button>
      </div>
    </div>
  );
};