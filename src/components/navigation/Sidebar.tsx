import React from 'react';
import { FamilyProfile } from '../../types';
import { InteractiveAvatar } from '../avatar/InteractiveAvatar';
import {
  Map,
  Trophy,
  ShoppingBag,
  User,
  Users,
  Wand2,
  Volume2,
  VolumeX,
  ShieldCheck,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface SidebarProps {
  currentTab: 'path' | 'leaderboard' | 'shop' | 'profile' | 'family';
  onSelectTab: (tab: 'path' | 'leaderboard' | 'shop' | 'profile' | 'family') => void;
  onOpenStudio: () => void;
  activeFamilyMember: FamilyProfile;
  onOpenFamilySwitcher: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onOpenStudio,
  activeFamilyMember,
  onOpenFamilySwitcher,
}) => {
  const [isMuted, setIsMuted] = React.useState(soundManager.isMutedState);

  const toggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
  };

  const navItems: {
    id: 'path' | 'leaderboard' | 'shop' | 'profile' | 'family';
    label: string;
    icon: React.ReactNode;
  }[] = [
    { id: 'path', label: 'Apprendre', icon: <Map className="w-6 h-6" /> },
    { id: 'leaderboard', label: 'Classement', icon: <Trophy className="w-6 h-6" /> },
    { id: 'shop', label: 'Boutique', icon: <ShoppingBag className="w-6 h-6" /> },
    { id: 'profile', label: 'Profil & Avatar', icon: <User className="w-6 h-6" /> },
    { id: 'family', label: 'Mode Famille', icon: <Users className="w-6 h-6" /> },
  ];

  return (
    <aside className="hidden sm:flex flex-col justify-between fixed top-0 bottom-0 left-0 w-64 bg-white border-r-2 border-gray-200 p-4 z-40">
      {/* Top Header Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white font-black text-2xl flex items-center justify-center shadow-3d-green">
            🦜
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-800 tracking-tight">PolyGlot</h1>
            <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
              Édition Famille
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  soundManager.playPop();
                  onSelectTab(item.id);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black transition cursor-pointer ${
                  isActive
                    ? 'text-emerald-600 bg-emerald-50 border-2 border-emerald-300 shadow-sm'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <span className={isActive ? 'text-emerald-600' : 'text-gray-400'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Studio IA button */}
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenStudio();
            }}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-sm font-black text-purple-600 hover:bg-purple-50 transition cursor-pointer border border-purple-200/50"
          >
            <Wand2 className="w-6 h-6 text-purple-500" />
            <div className="flex items-center gap-1.5">
              <span>Studio IA</span>
              <span className="px-1.5 py-0.5 rounded-md bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                Pro
              </span>
            </div>
          </button>
        </nav>
      </div>

      {/* Bottom Profile Badge & Sound Toggle */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        {/* Active Member Switcher Pill */}
        <button
          onClick={() => {
            soundManager.playPop();
            onOpenFamilySwitcher();
          }}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 transition cursor-pointer"
        >
          <div className="flex items-center gap-3">
            {activeFamilyMember.customAvatar ? (
              <InteractiveAvatar
                config={activeFamilyMember.customAvatar}
                size="sm"
                interactive={false}
                showPet={false}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-xl flex items-center justify-center">
                {activeFamilyMember.avatarEmoji}
              </div>
            )}
            <div className="text-left">
              <span className="text-xs font-black text-gray-800 block truncate max-w-[110px]">
                {activeFamilyMember.name}
              </span>
              <span className="text-[10px] font-bold text-gray-400 block">
                {activeFamilyMember.role === 'kid' ? 'Mode Enfant' : 'Apprenant'}
              </span>
            </div>
          </div>

          {activeFamilyMember.isKidsModeEnabled ? (
            <ShieldCheck className="w-5 h-5 text-amber-500" />
          ) : (
            <span className="text-xs font-black text-emerald-600">Changer</span>
          )}
        </button>

        {/* Sound toggle button */}
        <button
          onClick={toggleSound}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold text-gray-400 hover:text-gray-600 transition cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          <span>{isMuted ? 'Effets sonores muets' : 'Effets sonores activés'}</span>
        </button>
      </div>
    </aside>
  );
};
