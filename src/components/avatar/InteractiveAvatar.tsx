import React, { useState } from 'react';
import { CustomAvatarConfig } from '../../types';
import { motion, AnimatePresence } from 'motion/react';
import { soundManager } from '../../utils/sound';

interface InteractiveAvatarProps {
  config?: CustomAvatarConfig;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showPet?: boolean;
  interactive?: boolean;
  speechText?: string;
  className?: string;
}

export const InteractiveAvatar: React.FC<InteractiveAvatarProps> = ({
  config,
  size = 'md',
  showPet = true,
  interactive = true,
  speechText,
  className = '',
}) => {
  const [isWinking, setIsWinking] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(speechText || null);

  // Default fallback configuration
  const avatar: CustomAvatarConfig = config || {
    gender: 'boy',
    skinTone: '#FDDBB4',
    hairStyle: 'spiky',
    hairColor: '#4a3728',
    eyeExpression: 'sparkle',
    mouthExpression: 'big_grin',
    outfit: 'explorer',
    outfitColor: '#10b981',
    accessory: 'cap',
    petCompanion: 'fox',
    backgroundColor: '#ecfdf5',
  };

  const sizeDimensions = {
    sm: { width: 48, height: 48, petSize: 20 },
    md: { width: 80, height: 80, petSize: 28 },
    lg: { width: 120, height: 120, petSize: 38 },
    xl: { width: 160, height: 160, petSize: 48 },
  };

  const dim = sizeDimensions[size];

  const handleClick = () => {
    if (!interactive) return;
    soundManager.playPop();
    setIsWinking(true);
    setTimeout(() => setIsWinking(false), 900);

    const cheers = [
      '¡Vamos!',
      'You can do it! ✨',
      'Super travail ! 🌟',
      'Toll gemacht! 🚀',
      'Avanti così! 🔥',
      'Ganbatte! 🌸',
    ];
    const randomCheer = cheers[Math.floor(Math.random() * cheers.length)];
    setBubbleMessage(randomCheer);
    setTimeout(() => {
      setBubbleMessage(speechText || null);
    }, 2500);
  };

  const getPetEmoji = (pet: CustomAvatarConfig['petCompanion']) => {
    switch (pet) {
      case 'fox':
        return '🦊';
      case 'owl':
        return '🦉';
      case 'puppy':
        return '🐶';
      case 'kitten':
        return '🐱';
      case 'dragon':
        return '🐲';
      case 'robot':
        return '🤖';
      default:
        return null;
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      {/* Speech Bubble */}
      <AnimatePresence>
        {bubbleMessage && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: -10, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.8 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 z-30 bg-white px-3 py-1 rounded-full shadow-lg border-2 border-emerald-400 text-xs font-black text-gray-800 whitespace-nowrap flex items-center gap-1.5"
          >
            <span>{bubbleMessage}</span>
            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-emerald-400 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar Avatar Frame */}
      <motion.div
        whileHover={interactive ? { scale: 1.05 } : undefined}
        whileTap={interactive ? { scale: 0.95 } : undefined}
        onClick={handleClick}
        style={{
          width: dim.width,
          height: dim.height,
          backgroundColor: avatar.backgroundColor || '#f3f4f6',
        }}
        className={`relative rounded-3xl border-4 border-white shadow-md overflow-hidden flex items-center justify-center select-none ${
          interactive ? 'cursor-pointer' : ''
        }`}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Hair back (if long) */}
          {avatar.hairStyle === 'long' && (
            <path
              d="M 22,45 C 15,65 15,85 28,95 C 40,88 60,88 72,95 C 85,85 85,65 78,45 Z"
              fill={avatar.hairColor}
            />
          )}

          {/* Shoulders & Outfit */}
          <path
            d="M 20,85 C 20,68 35,66 50,66 C 65,66 80,68 80,85 L 82,100 L 18,100 Z"
            fill={avatar.outfitColor || '#10b981'}
          />

          {/* Outfit details */}
          {avatar.outfit === 'superhero' && (
            <polygon points="50,70 54,78 62,78 56,83 58,91 50,86 42,91 44,83 38,78 46,78" fill="#facc15" />
          )}
          {avatar.outfit === 'wizard' && (
            <circle cx="50" cy="78" r="4" fill="#fbbf24" />
          )}
          {avatar.outfit === 'explorer' && (
            <path d="M 46,67 L 46,95 M 54,67 L 54,95" stroke="#065f46" strokeWidth="2" />
          )}

          {/* Neck */}
          <rect x="44" y="58" width="12" height="12" fill={avatar.skinTone} />

          {/* Head */}
          <circle cx="50" cy="46" r="23" fill={avatar.skinTone} />

          {/* Cheeks */}
          <circle cx="34" cy="52" r="3.5" fill="#f87171" opacity="0.4" />
          <circle cx="66" cy="52" r="3.5" fill="#f87171" opacity="0.4" />

          {/* Eyes */}
          {isWinking || avatar.eyeExpression === 'wink' ? (
            <>
              {/* Left Eye open */}
              <circle cx="39" cy="45" r="3.5" fill="#1f2937" />
              <circle cx="37.5" cy="43.5" r="1.2" fill="#ffffff" />
              {/* Right Eye wink */}
              <path d="M 58,45 Q 62,49 66,45" stroke="#1f2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            </>
          ) : avatar.eyeExpression === 'sparkle' ? (
            <>
              <circle cx="39" cy="45" r="4" fill="#1f2937" />
              <circle cx="37.5" cy="43" r="1.8" fill="#ffffff" />
              <circle cx="40.5" cy="46.5" r="0.8" fill="#ffffff" />

              <circle cx="61" cy="45" r="4" fill="#1f2937" />
              <circle cx="59.5" cy="43" r="1.8" fill="#ffffff" />
              <circle cx="62.5" cy="46.5" r="0.8" fill="#ffffff" />
            </>
          ) : (
            <>
              <circle cx="39" cy="45" r="3" fill="#1f2937" />
              <circle cx="38" cy="44" r="1" fill="#ffffff" />
              <circle cx="61" cy="45" r="3" fill="#1f2937" />
              <circle cx="60" cy="44" r="1" fill="#ffffff" />
            </>
          )}

          {/* Eyebrows */}
          <path d="M 34,39 Q 39,36 44,39" stroke={avatar.hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 56,39 Q 61,36 66,39" stroke={avatar.hairColor} strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Mouth */}
          {avatar.mouthExpression === 'big_grin' || avatar.mouthExpression === 'laugh' ? (
            <path d="M 40,54 Q 50,64 60,54 Z" fill="#b91c1c" />
          ) : (
            <path d="M 42,54 Q 50,60 58,54" stroke="#991b1b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}

          {/* Hair Styles */}
          {avatar.hairStyle === 'spiky' && (
            <polygon
              points="28,40 32,25 38,33 46,20 54,32 62,22 68,34 72,42 70,48 30,48"
              fill={avatar.hairColor}
            />
          )}
          {avatar.hairStyle === 'short' && (
            <path
              d="M 27,45 C 25,28 35,22 50,22 C 65,22 75,28 73,45 C 67,36 58,34 50,34 C 42,34 33,36 27,45 Z"
              fill={avatar.hairColor}
            />
          )}
          {avatar.hairStyle === 'curly' && (
            <g fill={avatar.hairColor}>
              <circle cx="32" cy="30" r="9" />
              <circle cx="44" cy="24" r="10" />
              <circle cx="56" cy="24" r="10" />
              <circle cx="68" cy="30" r="9" />
              <circle cx="26" cy="40" r="8" />
              <circle cx="74" cy="40" r="8" />
            </g>
          )}
          {avatar.hairStyle === 'wavy' && (
            <path
              d="M 26,45 C 24,24 35,20 50,20 C 65,20 76,24 74,45 C 70,35 62,32 50,32 C 38,32 30,35 26,45 Z"
              fill={avatar.hairColor}
            />
          )}

          {/* Accessories */}
          {avatar.accessory === 'cap' && (
            <g>
              <ellipse cx="50" cy="28" rx="22" ry="12" fill="#ef4444" />
              <path d="M 30,30 Q 50,24 70,30 L 76,34 Q 50,30 24,34 Z" fill="#b91c1c" />
            </g>
          )}
          {avatar.accessory === 'glasses' && (
            <g stroke="#1f2937" strokeWidth="2" fill="none">
              <rect x="32" y="40" width="14" height="10" rx="3" fill="#ffffff" fillOpacity="0.3" />
              <rect x="54" y="40" width="14" height="10" rx="3" fill="#ffffff" fillOpacity="0.3" />
              <line x1="46" y1="45" x2="54" y2="45" />
            </g>
          )}
          {avatar.accessory === 'crown' && (
            <polygon points="34,26 40,16 46,24 50,12 54,24 60,16 66,26" fill="#facc15" stroke="#eab308" strokeWidth="1" />
          )}
          {avatar.accessory === 'headband' && (
            <rect x="28" y="32" width="44" height="6" rx="3" fill="#ec4899" />
          )}
        </svg>
      </motion.div>

      {/* Pet Companion badge */}
      {showPet && avatar.petCompanion && avatar.petCompanion !== 'none' && (
        <motion.div
          whileHover={{ scale: 1.2, rotate: 10 }}
          className="absolute -bottom-1 -right-1 z-20 bg-white rounded-full shadow-md border-2 border-amber-300 flex items-center justify-center"
          style={{ width: dim.petSize, height: dim.petSize, fontSize: dim.petSize * 0.6 }}
        >
          {getPetEmoji(avatar.petCompanion)}
        </motion.div>
      )}
    </div>
  );
};
