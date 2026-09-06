import React, { useState } from 'react';
import { UserProfile, CustomAvatarConfig, Course, LanguageCode } from '../../types';
import { User, Flame, Gem, Zap, Shirt, Award, Edit3, Sparkles, Globe, Check, Mic, Volume2, ShieldCheck } from 'lucide-react';
import { InteractiveAvatar } from '../avatar/InteractiveAvatar';
import { soundManager } from '../../utils/sound';

interface ProfileViewProps {
  userProfile: UserProfile;
  customAvatar?: CustomAvatarConfig;
  courses?: Course[];
  onSelectLanguage?: (lang: LanguageCode) => void;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onEquipOutfit: (outfitId: string) => void;
  onOpenShop: () => void;
  onOpenStudio?: () => void;
  onOpenAvatarCustomizer?: () => void;
  onOpenMicrophoneTest?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userProfile,
  customAvatar,
  courses,
  onSelectLanguage,
  onUpdateProfile,
  onEquipOutfit,
  onOpenShop,
  onOpenStudio,
  onOpenAvatarCustomizer,
  onOpenMicrophoneTest,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(userProfile.name);

  const handleSaveName = () => {
    if (nameInput.trim()) {
      onUpdateProfile({ name: nameInput.trim() });
      setIsEditingName(false);
    }
  };

  const outfitsList = [
    { id: 'outfit-super', name: 'Costume Super Héros 🦸‍♂️', icon: '🦸‍♂️', type: 'outfit-super', desc: 'Cape et couronne' },
    { id: 'outfit-tuxedo', name: 'Smoking Élégant 🤵', icon: '🤵', type: 'outfit-tuxedo', desc: 'Moustache et chic' },
    { id: 'outfit-sport', name: 'Bandeau Athlète 🏋️‍♂️', icon: '🏋️‍♂️', type: 'outfit-sport', desc: 'Bandeau et lunettes' },
  ];

  return (
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
        <div className="relative flex flex-col items-center">
          {customAvatar ? (
            <InteractiveAvatar config={customAvatar} size="lg" interactive={true} />
          ) : (
            <div className="w-24 h-24 rounded-3xl bg-emerald-100 border-4 border-emerald-400 text-4xl flex items-center justify-center shadow-md">
              {userProfile.avatarEmoji}
            </div>
          )}

          {onOpenAvatarCustomizer && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenAvatarCustomizer();
              }}
              className="mt-2 flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full text-xs font-black border border-emerald-300 transition cursor-pointer shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personnaliser</span>
            </button>
          )}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          {isEditingName ? (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="px-3 py-1.5 border-2 border-emerald-400 rounded-xl text-base font-extrabold text-gray-800"
              />
              <button
                onClick={handleSaveName}
                className="px-3 py-1.5 bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-3d-green"
              >
                OK
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <h1 className="text-2xl font-black text-gray-800">{userProfile.name}</h1>
              <button
                onClick={() => setIsEditingName(true)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-xs font-bold text-gray-500">Apprenant Passionné • PolyGlot Club</p>
        </div>
      </div>


      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 text-center space-y-1">
          <div className="flex justify-center text-orange-500">
            <Flame className="w-6 h-6 fill-current" />
          </div>
          <div className="text-xl font-black text-gray-800">{userProfile.streak}</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase">Jours de Série</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 text-center space-y-1">
          <div className="flex justify-center text-sky-500">
            <Gem className="w-6 h-6 fill-current" />
          </div>
          <div className="text-xl font-black text-gray-800">{userProfile.gems}</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase">Gemmes</div>
        </div>

        <div className="bg-white p-4 rounded-3xl border-2 border-gray-200 text-center space-y-1">
          <div className="flex justify-center text-yellow-500">
            <Award className="w-6 h-6" />
          </div>
          <div className="text-xl font-black text-gray-800">{userProfile.xp}</div>
          <div className="text-[11px] font-extrabold text-gray-400 uppercase">Total XP</div>
        </div>
      </div>

      {/* Available Languages Catalog (12 Languages) */}
      {courses && courses.length > 0 && onSelectLanguage && (
        <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-500" />
              <span>Langues d'apprentissage ({courses.length} disponibles)</span>
            </h2>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              1 clic pour changer
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {courses.map((course) => {
              const isActive = course.language === userProfile.currentLanguage;
              const lessonCount = course.units.reduce((acc, u) => acc + u.lessons.length, 0);

              return (
                <button
                  key={course.id}
                  onClick={() => {
                    soundManager.playPop();
                    onSelectLanguage(course.language);
                  }}
                  className={`p-3 rounded-2xl border-2 flex items-center justify-between transition text-left cursor-pointer ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-50/80 shadow-xs ring-2 ring-emerald-200'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{course.flag}</span>
                    <div>
                      <div className="text-xs font-black text-gray-800">{course.languageName}</div>
                      <div className="text-[10px] text-gray-400 font-bold">
                        {course.units.length} unités • {lessonCount} leçons
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Wardrobe & Owned Outfits */}
      <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <Shirt className="w-5 h-5 text-purple-500" /> Garde-Robe & Costumes
          </h2>
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenShop();
            }}
            className="text-xs font-extrabold text-purple-600 hover:text-purple-700"
          >
            + Obtenir plus
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {outfitsList.map((outfit) => {
            const isOwned = userProfile.ownedItems.includes(outfit.id);
            const isEquipped = userProfile.equippedOutfit === outfit.type;

            return (
              <div
                key={outfit.id}
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center gap-2 transition ${
                  isEquipped
                    ? 'border-purple-400 bg-purple-50/70'
                    : isOwned
                    ? 'border-gray-200 bg-white'
                    : 'border-gray-200 bg-gray-50 opacity-60'
                }`}
              >
                <div className="text-3xl">{outfit.icon}</div>
                <div className="text-xs font-extrabold text-gray-800">{outfit.name}</div>
                {isOwned ? (
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      onEquipOutfit(outfit.type);
                    }}
                    className={`w-full py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                      isEquipped
                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                        : 'btn-3d-purple text-white'
                    }`}
                  >
                    {isEquipped ? '✓ Équipé' : 'Équiper'}
                  </button>
                ) : (
                  <span className="text-[10px] text-gray-400 font-bold">Non débloqué</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Audio & Microphone Diagnostics Card */}
      <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-gray-800 flex items-center gap-2">
            <Mic className="w-5 h-5 text-emerald-500" /> Audio & Microphone
          </h2>
          {onOpenMicrophoneTest && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenMicrophoneTest();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 font-black text-xs transition cursor-pointer shadow-xs"
            >
              Tester le micro
            </button>
          )}
        </div>

        <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-black text-emerald-950">
              Reconnaissance vocale & prononciation
            </div>
            <div className="text-[11px] font-medium text-emerald-800">
              Pratiquez les exercices de répétition orale à voix haute avec analyse en temps réel.
            </div>
          </div>
          {onOpenMicrophoneTest && (
            <button
              onClick={() => {
                soundManager.playPop();
                onOpenMicrophoneTest();
              }}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-3d-green transition cursor-pointer shrink-0"
            >
              Lancer le test
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
