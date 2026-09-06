import React from 'react';
import { FamilyProfile } from '../../types';
import { InteractiveAvatar } from '../avatar/InteractiveAvatar';
import { X, Plus, Check, ShieldCheck, Flame, Star, Edit3, Settings } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface FamilyProfileSwitcherModalProps {
  familyMembers: FamilyProfile[];
  activeMemberId: string;
  onSelectMember: (memberId: string) => void;
  onAddNewMember: () => void;
  onEditMember: (member: FamilyProfile) => void;
  onOpenParentSettings: () => void;
  onClose: () => void;
}

export const FamilyProfileSwitcherModal: React.FC<FamilyProfileSwitcherModalProps> = ({
  familyMembers,
  activeMemberId,
  onSelectMember,
  onAddNewMember,
  onEditMember,
  onOpenParentSettings,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border-4 border-gray-100 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
              👨‍👩‍👧‍👦
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Espace Famille</h2>
              <p className="text-xs text-gray-500 font-bold">Qui apprend aujourd'hui ?</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Member Cards List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {/* Quick tester highlight banner */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🧸</span>
              <div>
                <div className="text-xs font-black text-amber-900 uppercase tracking-wide">
                  Nouveau : Parcours Éveil 3–6 ans (Maternelle)
                </div>
                <div className="text-xs text-amber-800 font-bold">
                  Testez le profil <span className="underline font-black">Noah (3-6 ans)</span> : 100% visuel, audio & diction !
                </div>
              </div>
            </div>
            {familyMembers.some((m) => m.id === 'fam-noah') && (
              <button
                onClick={() => {
                  soundManager.playPop();
                  onSelectMember('fam-noah');
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs shadow-3d-amber shrink-0 cursor-pointer"
              >
                Activer Noah
              </button>
            )}
          </div>

          {familyMembers.map((member) => {
            const isActive = member.id === activeMemberId;

            return (
              <div
                key={member.id}
                onClick={() => {
                  soundManager.playPop();
                  onSelectMember(member.id);
                  onClose();
                }}
                className={`relative flex items-center justify-between p-4 rounded-2xl border-2 transition cursor-pointer group ${
                  isActive
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-md ring-2 ring-emerald-200'
                    : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    {member.customAvatar ? (
                      <InteractiveAvatar
                        config={member.customAvatar}
                        size="md"
                        interactive={false}
                        showPet={true}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-3xl flex items-center justify-center shadow-inner">
                        {member.avatarEmoji}
                      </div>
                    )}
                    {member.isKidsModeEnabled && (
                      <div
                        className="absolute -top-1 -right-1 bg-amber-400 text-white p-1 rounded-full shadow-sm"
                        title="Mode Enfant actif"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>

                  {/* Profile info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-black text-gray-800">{member.name}</h4>
                      {member.role === 'kid' && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase">
                          {member.age && member.age <= 6 ? 'Éveil 3-6 ans' : `Enfant (${member.age || 8} ans)`}
                        </span>
                      )}
                      {member.role === 'teen' && (
                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-[10px] font-black uppercase">
                          Ado ({member.age || 14} ans)
                        </span>
                      )}
                      {member.role === 'parent' && (
                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase">
                          Parent
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-1 text-xs font-bold text-gray-500">
                      <span className="flex items-center gap-1 text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {member.xp} XP
                      </span>
                      <span className="flex items-center gap-1 text-orange-500">
                        <Flame className="w-3.5 h-3.5 fill-current" />
                        {member.streak} j. série
                      </span>
                      <span className="uppercase text-gray-400 font-black">
                        Langue: {member.currentLanguage}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundManager.playPop();
                      onEditMember(member);
                    }}
                    className="p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                    title="Modifier le profil"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {isActive ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md">
                      <Check className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full border-2 border-gray-300 group-hover:border-emerald-400 transition" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => {
              soundManager.playPop();
              onOpenParentSettings();
            }}
            className="flex items-center gap-2 text-xs font-black text-gray-600 hover:text-gray-900 transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-gray-400" />
            <span>Paramètres Parents</span>
          </button>

          <button
            onClick={() => {
              soundManager.playPop();
              onAddNewMember();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-xs shadow-3d-green hover:bg-emerald-600 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter un profil</span>
          </button>
        </div>
      </div>
    </div>
  );
};
