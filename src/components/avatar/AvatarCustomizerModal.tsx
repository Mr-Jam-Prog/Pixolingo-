import React, { useState } from 'react';
import { CustomAvatarConfig } from '../../types';
import { InteractiveAvatar } from './InteractiveAvatar';
import { X, Check, Sparkles, Wand2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface AvatarCustomizerModalProps {
  currentConfig?: CustomAvatarConfig;
  onSave: (newConfig: CustomAvatarConfig) => void;
  onClose: () => void;
}

const SKIN_TONES = ['#FDDBB4', '#F4C29F', '#E0A370', '#C68642', '#8D5524', '#472B1B'];
const HAIR_COLORS = ['#2c1b18', '#4a3728', '#8b4513', '#b55239', '#e6be8a', '#10b981', '#6366f1'];
const OUTFIT_COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#ef4444', '#1f2937'];
const BG_COLORS = ['#ecfdf5', '#eff6ff', '#f5f3ff', '#fdf2f8', '#fffbeb', '#fef2f2'];

export const AvatarCustomizerModal: React.FC<AvatarCustomizerModalProps> = ({
  currentConfig,
  onSave,
  onClose,
}) => {
  const [config, setConfig] = useState<CustomAvatarConfig>(
    currentConfig || {
      gender: 'neutral',
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
    }
  );

  const [activeTab, setActiveTab] = useState<
    'features' | 'hair' | 'outfit' | 'accessory' | 'pet'
  >('features');

  const handleRandomize = () => {
    soundManager.playPop();
    const randomHairStyles: CustomAvatarConfig['hairStyle'][] = ['short', 'curly', 'long', 'spiky', 'wavy'];
    const randomOutfits: CustomAvatarConfig['outfit'][] = ['tshirt', 'hoodie', 'explorer', 'wizard', 'superhero'];
    const randomAccessories: CustomAvatarConfig['accessory'][] = ['none', 'glasses', 'headband', 'crown', 'cap'];
    const randomPets: CustomAvatarConfig['petCompanion'][] = ['fox', 'owl', 'puppy', 'kitten', 'dragon', 'robot'];

    setConfig({
      gender: 'neutral',
      skinTone: SKIN_TONES[Math.floor(Math.random() * SKIN_TONES.length)],
      hairStyle: randomHairStyles[Math.floor(Math.random() * randomHairStyles.length)],
      hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
      eyeExpression: 'sparkle',
      mouthExpression: 'big_grin',
      outfit: randomOutfits[Math.floor(Math.random() * randomOutfits.length)],
      outfitColor: OUTFIT_COLORS[Math.floor(Math.random() * OUTFIT_COLORS.length)],
      accessory: randomAccessories[Math.floor(Math.random() * randomAccessories.length)],
      petCompanion: randomPets[Math.floor(Math.random() * randomPets.length)],
      backgroundColor: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
    });
  };

  const handleSave = () => {
    soundManager.playSuccess();
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });
    onSave(config);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border-4 border-gray-100 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500 text-white shadow-md">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Studio d'Avatar Personnalisé</h2>
              <p className="text-xs text-gray-500 font-bold">Crée ton personnage unique pour apprendre les langues !</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRandomize}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-black text-purple-600 hover:bg-purple-50 transition cursor-pointer shadow-sm"
              title="Générer aléatoirement"
            >
              <Wand2 className="w-3.5 h-3.5" />
              <span>Aléatoire</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Center Preview & Editor Layout */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-6 items-center md:items-start">
          {/* Live Avatar Preview */}
          <div className="w-full md:w-52 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-emerald-50/40 rounded-3xl border-2 border-dashed border-emerald-200 shrink-0">
            <InteractiveAvatar config={config} size="xl" interactive={true} speechText="Coucou ! ✨" />
            <p className="mt-3 text-xs font-black text-emerald-700 uppercase tracking-wider">Aperçu en direct</p>
            <p className="text-[11px] text-gray-400 font-medium text-center mt-1">Clique dessus pour le voir s'animer</p>
          </div>

          {/* Controls & Options */}
          <div className="flex-1 w-full space-y-4">
            {/* Category Tabs */}
            <div className="flex p-1 bg-gray-100 rounded-2xl gap-1 overflow-x-auto text-xs font-black">
              {[
                { id: 'features', label: 'Visage' },
                { id: 'hair', label: 'Cheveux' },
                { id: 'outfit', label: 'Tenue' },
                { id: 'accessory', label: 'Accessoires' },
                { id: 'pet', label: 'Familier' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    soundManager.playPop();
                    setActiveTab(tab.id as any);
                  }}
                  className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-emerald-600 shadow-sm border border-emerald-200'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Features (Skin, Eyes, Mouth) */}
            {activeTab === 'features' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Teinte de peau
                  </label>
                  <div className="flex items-center gap-3">
                    {SKIN_TONES.map((tone) => (
                      <button
                        key={tone}
                        onClick={() => setConfig({ ...config, skinTone: tone })}
                        style={{ backgroundColor: tone }}
                        className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                          config.skinTone === tone ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Expression du regard
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'sparkle', label: 'Étincelant ✨' },
                      { id: 'happy', label: 'Joyeux 😊' },
                      { id: 'wink', label: 'Clin d’œil 😉' },
                      { id: 'focused', label: 'Déterminé 🔥' },
                      { id: 'calm', label: 'Serein 😌' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setConfig({ ...config, eyeExpression: opt.id as any })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                          config.eyeExpression === opt.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Hair */}
            {activeTab === 'hair' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Coupe de cheveux
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'spiky', label: 'Ébouriffé ⚡' },
                      { id: 'short', label: 'Court classique 👦' },
                      { id: 'curly', label: 'Bouclé 🌀' },
                      { id: 'wavy', label: 'Ondulé 🌊' },
                      { id: 'long', label: 'Long 👧' },
                    ].map((h) => (
                      <button
                        key={h.id}
                        onClick={() => setConfig({ ...config, hairStyle: h.id as any })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                          config.hairStyle === h.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {h.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Couleur des cheveux
                  </label>
                  <div className="flex items-center gap-3">
                    {HAIR_COLORS.map((col) => (
                      <button
                        key={col}
                        onClick={() => setConfig({ ...config, hairColor: col })}
                        style={{ backgroundColor: col }}
                        className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                          config.hairColor === col ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Outfit */}
            {activeTab === 'outfit' && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Modèle de tenue
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'explorer', label: 'Explorateur 🧭' },
                      { id: 'superhero', label: 'Super-héros 🦸' },
                      { id: 'wizard', label: 'Mage étoilé 🧙' },
                      { id: 'hoodie', label: 'Sweat à capuche 🎧' },
                      { id: 'tshirt', label: 'T-Shirt cool 👕' },
                    ].map((out) => (
                      <button
                        key={out.id}
                        onClick={() => setConfig({ ...config, outfit: out.id as any })}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                          config.outfit === out.id
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {out.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                    Couleur de la tenue
                  </label>
                  <div className="flex items-center gap-3">
                    {OUTFIT_COLORS.map((col) => (
                      <button
                        key={col}
                        onClick={() => setConfig({ ...config, outfitColor: col })}
                        style={{ backgroundColor: col }}
                        className={`w-9 h-9 rounded-full border-2 transition cursor-pointer ${
                          config.outfitColor === col ? 'border-emerald-600 scale-110 shadow-md ring-2 ring-emerald-300' : 'border-white'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Accessories */}
            {activeTab === 'accessory' && (
              <div className="space-y-4 animate-fade-in">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                  Accessoire de tête
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Aucun ❌' },
                    { id: 'cap', label: 'Casquette rouge 🧢' },
                    { id: 'glasses', label: 'Lunettes intello 👓' },
                    { id: 'crown', label: 'Couronne dorée 👑' },
                    { id: 'headband', label: 'Bandeau sport 🎀' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => setConfig({ ...config, accessory: acc.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                        config.accessory === acc.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {acc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Pet Companion */}
            {activeTab === 'pet' && (
              <div className="space-y-4 animate-fade-in">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
                  Choisis ton familier de voyage
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: 'Sans familier ❌' },
                    { id: 'fox', label: 'Renard rusé 🦊' },
                    { id: 'owl', label: 'Chouette savante 🦉' },
                    { id: 'puppy', label: 'Chiot joueur 🐶' },
                    { id: 'kitten', label: 'Chaton curieux 🐱' },
                    { id: 'dragon', label: 'Bébé dragon 🐲' },
                    { id: 'robot', label: 'Petit robot 🤖' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setConfig({ ...config, petCompanion: p.id as any })}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition cursor-pointer ${
                        config.petCompanion === p.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl border-2 border-gray-300 text-gray-700 font-black text-sm hover:bg-gray-100 transition cursor-pointer"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-3d-green hover:bg-emerald-600 transition cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>Valider mon Avatar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
