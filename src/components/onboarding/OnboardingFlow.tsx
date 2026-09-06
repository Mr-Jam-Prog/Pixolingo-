import React, { useState } from 'react';
import { LanguageCode } from '../../types';
import { ArrowRight, Check, Sparkles, Clock, Globe } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface OnboardingFlowProps {
  onComplete: (settings: {
    language: LanguageCode;
    name: string;
    avatarEmoji: string;
    dailyTargetMinutes: number;
    dailyTargetXP: number;
  }) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageCode>('es');
  const [learnerName, setLearnerName] = useState('Explorateur');
  const [selectedEmoji, setSelectedEmoji] = useState('🦊');
  const [dailyMinutes, setDailyMinutes] = useState(10);

  const languages: { code: LanguageCode; name: string; flag: string; tag: string }[] = [
    { code: 'es', name: 'Espagnol', flag: '🇪🇸', tag: 'Populaire & Chaleureux' },
    { code: 'en', name: 'Anglais', flag: '🇬🇧', tag: 'Indispensable mondial' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', tag: 'Culture & Gastronomie' },
    { code: 'de', name: 'Allemand', flag: '🇩🇪', tag: 'Précis & Européen' },
    { code: 'it', name: 'Italien', flag: '🇮🇹', tag: 'Mélodieux & Dolce Vita' },
    { code: 'ja', name: 'Japonais', flag: '🇯🇵', tag: 'Mangas & Découverte' },
    { code: 'pt', name: 'Portugais', flag: '🇵🇹', tag: 'Rythmé & Solaire' },
    { code: 'ar', name: 'Arabe', flag: '🇸🇦', tag: 'Riche & Expressif' },
    { code: 'zh', name: 'Chinois', flag: '🇨🇳', tag: 'Mandarin & Caractères' },
    { code: 'ru', name: 'Russe', flag: '🇷🇺', tag: 'Cyrillique & Fascinant' },
    { code: 'ko', name: 'Coréen', flag: '🇰🇷', tag: 'K-Pop & Hangul' },
    { code: 'nl', name: 'Néerlandais', flag: '🇳🇱', tag: 'Fluide & Convivial' },
  ];

  const handleNext = () => {
    soundManager.playPop();
    if (step < 3) {
      setStep(step + 1);
    } else {
      soundManager.playSuccess();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
      onComplete({
        language: selectedLanguage,
        name: learnerName.trim() || 'Apprenant Étoile',
        avatarEmoji: selectedEmoji,
        dailyTargetMinutes: dailyMinutes,
        dailyTargetXP: dailyMinutes * 5,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#f7f7f7] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-xl border-4 border-gray-100 p-6 md:p-8 flex flex-col">
        {/* Progress header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦜</span>
            <span className="text-sm font-black text-gray-800">Bienvenue dans l'aventure !</span>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  step === s ? 'w-8 bg-emerald-500' : step > s ? 'w-3 bg-emerald-200' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-800">Quelle langue veux-tu apprendre ?</h2>
              <p className="text-xs text-gray-500 font-bold mt-1">Tu pourras en changer à tout moment !</p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedLanguage(lang.code);
                  }}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition cursor-pointer text-left ${
                    selectedLanguage === lang.code
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-3xl">{lang.flag}</span>
                  <div>
                    <h4 className="text-sm font-black text-gray-800">{lang.name}</h4>
                    <span className="text-[10px] text-gray-400 font-bold">{lang.tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Time commitment */}
        {step === 2 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-800">Combien de temps par jour ?</h2>
              <p className="text-xs text-gray-500 font-bold mt-1">Une régularité de quelques minutes suffit à progresser !</p>
            </div>

            <div className="space-y-2.5">
              {[
                { min: 5, label: 'Décontracté', desc: '5 min / jour (25 XP)', icon: '🌱' },
                { min: 10, label: 'Régulier (Recommandé)', desc: '10 min / jour (50 XP)', icon: '⚡' },
                { min: 15, label: 'Sérieux', desc: '15 min / jour (75 XP)', icon: '🔥' },
                { min: 20, label: 'Intensif', desc: '20 min / jour (100 XP)', icon: '🚀' },
              ].map((item) => (
                <button
                  key={item.min}
                  onClick={() => {
                    soundManager.playPop();
                    setDailyMinutes(item.min);
                  }}
                  className={`w-full p-4 rounded-2xl border-2 flex items-center justify-between transition cursor-pointer ${
                    dailyMinutes === item.min
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-md ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div className="text-left">
                      <h4 className="text-sm font-black text-gray-800">{item.label}</h4>
                      <p className="text-xs font-bold text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                  {dailyMinutes === item.min && (
                    <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                      <Check className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Identity & Avatar */}
        {step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="text-center mb-4">
              <h2 className="text-2xl font-black text-gray-800">Personnalise ton profil !</h2>
              <p className="text-xs text-gray-500 font-bold mt-1">Choisis ton nom et ta mascotte favorite.</p>
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                Ton prénom ou pseudo
              </label>
              <input
                type="text"
                value={learnerName}
                onChange={(e) => setLearnerName(e.target.value)}
                placeholder="Ex: Léo, Sarah..."
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 font-black text-gray-800 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                Choisis ta mascotte
              </label>
              <div className="flex flex-wrap justify-center gap-2">
                {['🦊', '🐱', '🐶', '🦉', '🦁', '🐼', '🐨', '🐯', '🐰', '🦄', '🦖', '🤖'].map((e) => (
                  <button
                    key={e}
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedEmoji(e);
                    }}
                    className={`w-12 h-12 rounded-2xl text-2xl flex items-center justify-center border-2 transition cursor-pointer ${
                      selectedEmoji === e
                        ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-md ring-2 ring-emerald-200'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="text-xs font-black text-gray-500 hover:text-gray-800 p-2 cursor-pointer"
            >
              Retour
            </button>
          ) : (
            <div />
          )}

          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-8 py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-3d-green hover:bg-emerald-600 transition cursor-pointer active:translate-y-0.5"
          >
            <span>{step === 3 ? "C'est parti !" : 'Continuer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
