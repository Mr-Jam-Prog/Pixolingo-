import React from 'react';
import { Map, Trophy, ShoppingBag, User, Users, Wand2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface MobileTabBarProps {
  currentTab: 'path' | 'leaderboard' | 'shop' | 'profile' | 'family';
  onSelectTab: (tab: 'path' | 'leaderboard' | 'shop' | 'profile' | 'family') => void;
  onOpenStudio: () => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenStudio,
}) => {
  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 z-40 px-2 py-1.5 flex items-center justify-around">
      <button
        onClick={() => {
          soundManager.playPop();
          onSelectTab('path');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentTab === 'path' ? 'text-emerald-600 font-black' : 'text-gray-400'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase mt-0.5">Leçons</span>
      </button>

      <button
        onClick={() => {
          soundManager.playPop();
          onSelectTab('leaderboard');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentTab === 'leaderboard' ? 'text-emerald-600 font-black' : 'text-gray-400'
        }`}
      >
        <Trophy className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase mt-0.5">Ligue</span>
      </button>

      <button
        onClick={() => {
          soundManager.playPop();
          onSelectTab('shop');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentTab === 'shop' ? 'text-emerald-600 font-black' : 'text-gray-400'
        }`}
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase mt-0.5">Boutique</span>
      </button>

      <button
        onClick={() => {
          soundManager.playPop();
          onSelectTab('family');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentTab === 'family' ? 'text-emerald-600 font-black' : 'text-gray-400'
        }`}
      >
        <Users className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase mt-0.5">Famille</span>
      </button>

      <button
        onClick={() => {
          soundManager.playPop();
          onSelectTab('profile');
        }}
        className={`flex flex-col items-center py-1 px-2 rounded-xl transition cursor-pointer ${
          currentTab === 'profile' ? 'text-emerald-600 font-black' : 'text-gray-400'
        }`}
      >
        <User className="w-5 h-5" />
        <span className="text-[10px] font-black uppercase mt-0.5">Profil</span>
      </button>

      <button
        onClick={() => {
          soundManager.playPop();
          onOpenStudio();
        }}
        className="flex flex-col items-center py-1 px-2 rounded-xl text-purple-600 transition cursor-pointer"
      >
        <Wand2 className="w-5 h-5 text-purple-500" />
        <span className="text-[10px] font-black uppercase mt-0.5">Studio</span>
      </button>
    </nav>
  );
};
