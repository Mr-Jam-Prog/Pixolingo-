import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Course, LanguageCode, FamilyProfile } from '../../types';
import { Flame, Zap, Gem, Globe, Volume2, VolumeX, Users, ShieldCheck, ChevronDown, Check, Mic } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface TopBarProps {
  userProfile: UserProfile;
  courses: Course[];
  activeFamilyMember?: FamilyProfile;
  onSelectLanguage: (lang: LanguageCode) => void;
  onOpenShop: () => void;
  onOpenMistakes: () => void;
  onOpenFamilySwitcher?: () => void;
  onOpenMicrophoneTest?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  userProfile,
  courses,
  activeFamilyMember,
  onSelectLanguage,
  onOpenShop,
  onOpenMistakes,
  onOpenFamilySwitcher,
  onOpenMicrophoneTest,
}) => {
  const [soundEnabled, setSoundEnabled] = useState(soundManager.isEnabled());
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const currentCourse = courses.find((c) => c.language === userProfile.currentLanguage) || courses[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleSound = () => {
    const next = soundManager.toggleSound();
    setSoundEnabled(next);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-gray-200 px-4 py-2.5 transition-all">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
        {/* Course / Language Switcher */}
        <div className="flex items-center gap-2">
          <div className="relative" ref={langMenuRef}>
            <button
              onClick={() => {
                soundManager.playPop();
                setIsLangMenuOpen((prev) => !prev);
              }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 border-gray-200 hover:border-emerald-400 bg-gray-50 hover:bg-emerald-50/50 transition cursor-pointer active:scale-95"
              title="Changer de langue"
            >
              <span className="text-xl">{currentCourse.flag}</span>
              <span className="font-extrabold text-sm text-gray-700 hidden sm:inline">
                {currentCourse.languageName}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                  isLangMenuOpen ? 'rotate-180 text-emerald-600' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {isLangMenuOpen && (
              <div className="absolute left-0 top-full mt-2 flex flex-col bg-white border-2 border-gray-200 rounded-3xl shadow-2xl p-2.5 w-72 max-h-96 overflow-y-auto z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between px-3 py-2 border-b border-gray-100 mb-1">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase text-gray-500 tracking-wider">
                    <Globe className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Langues d'apprentissage ({courses.length})</span>
                  </div>
                </div>
                <div className="space-y-1">
                  {courses.map((c) => {
                    const isSelected = c.language === userProfile.currentLanguage;
                    const totalLessons = c.units.reduce((acc, u) => acc + u.lessons.length, 0);
                    return (
                      <button
                        key={c.id}
                        onClick={() => {
                          soundManager.playPop();
                          onSelectLanguage(c.language);
                          setIsLangMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-left font-bold text-xs transition cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border border-emerald-300 text-emerald-800 font-black'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{c.flag}</span>
                          <div>
                            <div className="text-sm font-black text-gray-800">{c.languageName}</div>
                            <div className="text-[10px] text-gray-400 font-bold">
                              {c.units.length} unités • {totalLessons} leçons
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Family Member badge */}
          {activeFamilyMember && onOpenFamilySwitcher && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenFamilySwitcher();
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-2xl border border-gray-200 hover:bg-gray-100 bg-white text-xs font-black transition cursor-pointer shadow-xs"
              title="Changer de profil famille"
            >
              <span className="text-base">{activeFamilyMember.avatarEmoji}</span>
              <span className="hidden md:inline text-gray-700">{activeFamilyMember.name}</span>
              {activeFamilyMember.isKidsModeEnabled && (
                <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              )}
            </button>
          )}
        </div>

        {/* Gamification Stats: Streak, Gems, Energy */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-2xl border border-orange-200">
            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />
            <span className="font-extrabold text-sm text-orange-600">
              {userProfile.streak}
            </span>
          </div>

          {/* Gems */}
          <button
            onClick={() => {
              soundManager.playGem();
              onOpenShop();
            }}
            className="flex items-center gap-1.5 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-2xl border border-sky-200 transition cursor-pointer"
          >
            <Gem className="w-5 h-5 text-sky-500 fill-sky-500" />
            <span className="font-extrabold text-sm text-sky-600">
              {userProfile.gems}
            </span>
          </button>

          {/* Energy / Hearts */}
          <button
            onClick={() => {
              soundManager.playPop();
              if (userProfile.energy < userProfile.maxEnergy) {
                onOpenShop();
              }
            }}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-2xl border border-emerald-200 transition cursor-pointer"
          >
            <Zap className="w-5 h-5 text-emerald-500 fill-emerald-500" />
            <span className="font-extrabold text-sm text-emerald-600">
              {userProfile.energy}/{userProfile.maxEnergy}
            </span>
          </button>

          {/* Mistakes review quick button */}
          {userProfile.mistakeBank && userProfile.mistakeBank.length > 0 && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenMistakes();
              }}
              className="hidden sm:flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-2xl border border-amber-200 text-xs font-bold text-amber-700 transition cursor-pointer"
            >
              <span>🩹 Révision ({userProfile.mistakeBank.length})</span>
            </button>
          )}

          {/* Microphone Test & Diagnostics */}
          {onOpenMicrophoneTest && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenMicrophoneTest();
              }}
              className="p-2 rounded-xl text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 bg-emerald-50/50 border border-emerald-200/60 transition cursor-pointer"
              title="Tester et régler le microphone"
            >
              <Mic className="w-5 h-5" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
            title={soundEnabled ? 'Désactiver le son' : 'Activer le son'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};

