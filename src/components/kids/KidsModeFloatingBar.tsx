import React from 'react';
import { FamilyProfile } from '../../types';
import { ShieldCheck, Lock, Star, Clock } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface KidsModeFloatingBarProps {
  currentProfile: FamilyProfile;
  onExitKidsModeClick: () => void;
}

export const KidsModeFloatingBar: React.FC<KidsModeFloatingBarProps> = ({
  currentProfile,
  onExitKidsModeClick,
}) => {
  if (!currentProfile.isKidsModeEnabled) return null;

  return (
    <div className="fixed top-2 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-white rounded-2xl shadow-lg px-4 py-2 flex items-center justify-between border-2 border-white/40 animate-slide-down">
      {/* Left info */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
          <ShieldCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-wide uppercase">Espace Enfant Sécurisé</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-black">
              {currentProfile.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-white/90">
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-current text-yellow-200" />
              {currentProfile.xp} étoiles
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {currentProfile.screenTimeUsedMinutes} / {currentProfile.screenTimeLimitMinutes} min
            </span>
          </div>
        </div>
      </div>

      {/* Right unlock button */}
      <button
        onClick={() => {
          soundManager.playPop();
          onExitKidsModeClick();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-orange-600 font-black text-xs shadow-md hover:bg-orange-50 active:scale-95 transition cursor-pointer"
        title="Accès Parent ou Sortie"
      >
        <Lock className="w-3.5 h-3.5" />
        <span>Espace Parent</span>
      </button>
    </div>
  );
};
