import React, { useState } from 'react';
import { FamilyProfile, FamilyRole, LanguageCode } from '../../types';
import { X, Check, Trash2, ShieldCheck, User } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface FamilyMemberEditorModalProps {
  member?: FamilyProfile | null;
  onSave: (memberData: Partial<FamilyProfile>) => void;
  onDelete?: (memberId: string) => void;
  onClose: () => void;
}

const EMOJI_AVATARS = ['🦊', '🐱', '🐶', '🦉', '🦁', '🐼', '🐨', '🐯', '🐰', '🦄', '🦖', '🤖'];

export const FamilyMemberEditorModal: React.FC<FamilyMemberEditorModalProps> = ({
  member,
  onSave,
  onDelete,
  onClose,
}) => {
  const isEditing = !!member;

  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState<FamilyRole>(member?.role || 'kid');
  const [age, setAge] = useState<number>(member?.age || (role === 'kid' ? 8 : role === 'teen' ? 14 : 35));
  const [avatarEmoji, setAvatarEmoji] = useState(member?.avatarEmoji || '🦊');
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>(member?.currentLanguage || 'es');
  const [isKidsMode, setIsKidsMode] = useState<boolean>(member?.isKidsModeEnabled ?? (role === 'kid'));
  const [screenLimit, setScreenLimit] = useState<number>(member?.screenTimeLimitMinutes || 30);
  const [dailyTargetXP, setDailyTargetXP] = useState<number>(member?.dailyGoals?.targetXP || 30);

  const handleRoleChange = (newRole: FamilyRole) => {
    setRole(newRole);
    if (newRole === 'kid') {
      setIsKidsMode(true);
      setScreenLimit(25);
      setAge(8);
    } else if (newRole === 'teen') {
      setIsKidsMode(false);
      setScreenLimit(45);
      setAge(14);
    } else {
      setIsKidsMode(false);
      setScreenLimit(120);
      setAge(35);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;
    soundManager.playSuccess();
    onSave({
      id: member?.id || `fam-${Date.now()}`,
      name: name.trim(),
      role,
      age,
      avatarEmoji,
      currentLanguage,
      isKidsModeEnabled: isKidsMode,
      screenTimeLimitMinutes: screenLimit,
      dailyGoals: {
        targetXP: dailyTargetXP,
        currentXP: member?.dailyGoals?.currentXP || 0,
      },
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-800">
                {isEditing ? 'Modifier le profil' : 'Créer un profil membre'}
              </h3>
              <p className="text-xs text-gray-500 font-bold">Personnalise l'apprentissage pour toute la famille</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Name input */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Prénom ou Surnom
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Léo, Emma, Papa..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 font-black text-gray-800 focus:border-emerald-500 outline-none transition"
            />
          </div>

          {/* Role selector */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Profil d'apprenant
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'kid', label: 'Enfant (3-11 ans)', icon: '🧒' },
                { id: 'teen', label: 'Ado (12-17 ans)', icon: '🎒' },
                { id: 'parent', label: 'Adulte / Parent', icon: '🧑‍💼' },
              ].map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleChange(r.id as FamilyRole)}
                  className={`p-3 rounded-2xl border-2 text-center transition cursor-pointer ${
                    role === r.id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-1">{r.icon}</div>
                  <div className="text-xs font-black">{r.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Avatar Emoji picker */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Mascotte Emoji
            </label>
            <div className="flex flex-wrap gap-2">
              {EMOJI_AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatarEmoji(emoji)}
                  className={`w-11 h-11 rounded-2xl text-xl flex items-center justify-center border-2 transition cursor-pointer ${
                    avatarEmoji === emoji
                      ? 'border-emerald-500 bg-emerald-50 scale-110 shadow-md'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Language choice */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Langue d'apprentissage
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'es', label: 'Espagnol', flag: '🇪🇸' },
                { code: 'en', label: 'Anglais', flag: '🇬🇧' },
                { code: 'fr', label: 'Français', flag: '🇫🇷' },
                { code: 'de', label: 'Allemand', flag: '🇩🇪' },
                { code: 'it', label: 'Italien', flag: '🇮🇹' },
                { code: 'ja', label: 'Japonais', flag: '🇯🇵' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setCurrentLanguage(lang.code as LanguageCode)}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border-2 transition cursor-pointer ${
                    currentLanguage === lang.code
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-xs font-black">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kids Safe Mode Toggle */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h5 className="text-xs font-black text-amber-900">Activer le Mode Enfant Sécurisé</h5>
                <p className="text-[11px] text-amber-700 font-medium">
                  Verrouillage parental par code PIN ou calcul mental
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isKidsMode}
              onChange={(e) => setIsKidsMode(e.target.checked)}
              className="w-5 h-5 accent-amber-500 cursor-pointer"
            />
          </div>

          {/* Screen time & Daily goal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                Limite quotidienne (min)
              </label>
              <input
                type="number"
                min={5}
                max={180}
                value={screenLimit}
                onChange={(e) => setScreenLimit(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-black text-gray-800 focus:border-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1">
                Objectif quotidien (XP)
              </label>
              <input
                type="number"
                min={10}
                max={200}
                value={dailyTargetXP}
                onChange={(e) => setDailyTargetXP(parseInt(e.target.value, 10) || 30)}
                className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 font-black text-gray-800 focus:border-emerald-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          {isEditing && onDelete ? (
            <button
              onClick={() => {
                soundManager.playPop();
                if (confirm('Voulez-vous vraiment supprimer ce profil ?')) {
                  onDelete(member.id);
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 text-xs font-black text-rose-600 hover:text-rose-700 p-2 rounded-xl transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border-2 border-gray-300 text-gray-600 font-black text-xs hover:bg-gray-100 transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={!name.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 disabled:opacity-50 text-white font-black text-xs shadow-3d-green hover:bg-emerald-600 transition cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
