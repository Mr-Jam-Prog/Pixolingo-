import React from 'react';
import { Lesson } from '../../types';
import { Star, Check, Lock, Play } from 'lucide-react';
import { motion } from 'motion/react';
import { soundManager } from '../../utils/sound';

interface LessonNodeProps {
  lesson: Lesson;
  index: number;
  isCompleted: boolean;
  isUnlocked: boolean;
  isCurrent: boolean;
  unitColor: string;
  onClick: () => void;
}

export const LessonNode: React.FC<LessonNodeProps> = ({
  lesson,
  index,
  isCompleted,
  isUnlocked,
  isCurrent,
  unitColor,
  onClick,
}) => {
  // S-Curve sine horizontal displacement
  const offsets = [0, 45, 75, 45, 0, -45, -75, -45];
  const xOffset = offsets[index % offsets.length];

  const getColorClasses = () => {
    if (isCompleted) {
      return {
        bg: 'bg-yellow-400 border-yellow-500',
        shadow: 'shadow-3d-yellow',
        text: 'text-yellow-950',
      };
    }
    if (isCurrent) {
      return {
        bg: 'bg-emerald-500 border-emerald-600',
        shadow: 'shadow-3d-green',
        text: 'text-white',
      };
    }
    if (isUnlocked) {
      return {
        bg: 'bg-blue-500 border-blue-600',
        shadow: 'shadow-3d-blue',
        text: 'text-white',
      };
    }
    return {
      bg: 'bg-gray-300 border-gray-400',
      shadow: 'shadow-3d-gray',
      text: 'text-gray-500',
    };
  };

  const colors = getColorClasses();

  return (
    <div
      className="relative flex flex-col items-center my-4 select-none"
      style={{ transform: `translateX(${xOffset}px)` }}
    >
      {/* Pulsing indicator for active lesson */}
      {isCurrent && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [-4, 0, -4] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            className="px-3 py-1 bg-white rounded-full shadow-lg border-2 border-emerald-400 text-[11px] font-black text-emerald-600 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap"
          >
            <span>Commencer</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2 h-2 bg-white border-b-2 border-r-2 border-emerald-400 rotate-45" />
          </motion.div>
        </div>
      )}

      {/* Main 3D Node Button */}
      <motion.button
        whileHover={isUnlocked ? { scale: 1.08 } : undefined}
        whileTap={isUnlocked ? { scale: 0.94 } : undefined}
        onClick={() => {
          if (isUnlocked) {
            soundManager.playPop();
            onClick();
          }
        }}
        disabled={!isUnlocked}
        className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-b-6 flex items-center justify-center relative z-10 transition cursor-pointer ${
          colors.bg
        } ${colors.shadow} ${!isUnlocked ? 'cursor-not-allowed opacity-80' : ''}`}
      >
        {isCompleted ? (
          <div className="flex flex-col items-center">
            <Check className="w-8 h-8 text-yellow-950 stroke-[3]" />
            <div className="flex gap-0.5 mt-0.5">
              <Star className="w-3 h-3 fill-yellow-950 text-yellow-950" />
              <Star className="w-3 h-3 fill-yellow-950 text-yellow-950" />
              <Star className="w-3 h-3 fill-yellow-950 text-yellow-950" />
            </div>
          </div>
        ) : isCurrent ? (
          <Play className="w-8 h-8 text-white fill-white ml-1" />
        ) : isUnlocked ? (
          <Star className="w-8 h-8 text-white fill-white" />
        ) : (
          <Lock className="w-7 h-7 text-gray-500" />
        )}
      </motion.button>

      {/* Lesson title label */}
      <span className="mt-2 text-xs font-black text-gray-700 text-center max-w-[120px] line-clamp-1">
        {lesson.title}
      </span>
    </div>
  );
};
