import React from 'react';
import { motion } from 'motion/react';
import { getAvatarSvgUrl } from '../../utils/avatarGenerator';
import { DiceBearAvatarConfig } from '../../types';

interface DuoMascotProps {
  mood?: 'happy' | 'excited' | 'thinking' | 'sad' | 'onFire';
  size?: number;
  speechText?: string;
  avatarConfig?: DiceBearAvatarConfig;
  outfit?: string;
  onClick?: () => void;
}

export const DuoMascot: React.FC<DuoMascotProps> = ({
  mood = 'happy',
  size = 96,
  speechText,
  avatarConfig,
  outfit,
  onClick,
}) => {
  const getOutfitAccessories = (): { accessories?: string; glasses?: string; style?: 'big-smile' | 'adventurer' } => {
    switch (outfit) {
      case 'outfit-super':
      case 'super':
        return { accessories: 'sailormoonCrown', style: 'big-smile' };
      case 'outfit-tuxedo':
      case 'tuxedo':
        return { accessories: 'mustache', glasses: 'variant01', style: 'big-smile' };
      case 'outfit-sport':
      case 'sport':
        return { accessories: 'sunglasses', style: 'big-smile' };
      case 'sunglasses':
        return { accessories: 'sunglasses', glasses: 'variant03', style: 'big-smile' };
      default:
        return {};
    }
  };

  const outfitDetails = getOutfitAccessories();
  const effectiveConfig: DiceBearAvatarConfig = {
    style: outfitDetails.style || avatarConfig?.style || 'big-smile',
    seed: avatarConfig?.seed || 'DuoHero',
    skinColor: avatarConfig?.skinColor || 'light',
    hairColor: avatarConfig?.hairColor || 'brown',
    ...(outfitDetails.accessories ? { accessories: outfitDetails.accessories } : {}),
    ...(outfitDetails.glasses ? { glasses: outfitDetails.glasses } : {}),
  };

  const avatarUrl = getAvatarSvgUrl(effectiveConfig);

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer' : ''}`}
    >
      {speechText && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="mb-2 bg-white px-3.5 py-1.5 rounded-2xl shadow-md border-2 border-emerald-300 text-xs font-bold text-emerald-900 relative z-20"
        >
          {speechText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-emerald-300 rotate-45" />
        </motion.div>
      )}

      <motion.div
        animate={
          mood === 'onFire'
            ? { y: [0, -6, 0], scale: [1, 1.05, 1] }
            : mood === 'happy'
            ? { y: [0, -3, 0] }
            : {}
        }
        transition={{ repeat: Infinity, duration: mood === 'onFire' ? 1.2 : 2.5, ease: 'easeInOut' }}
        className="relative"
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl}
          alt="Mascotte"
          className="w-full h-full object-contain filter drop-shadow-md rounded-full bg-emerald-100 border-4 border-white"
        />

        {mood === 'onFire' && (
          <span className="absolute -top-2 -right-2 text-2xl animate-bounce">
            🔥
          </span>
        )}
        {outfit === 'super' && (
          <span className="absolute -bottom-1 -left-1 text-xl">
            ⚡
          </span>
        )}
      </motion.div>
    </div>
  );
};
