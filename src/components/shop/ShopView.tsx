import React from 'react';
import { UserProfile, ShopItem } from '../../types';
import { X, Gem, Zap, Sparkles, Snowflake, Shield, Shirt, Check } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ShopViewProps {
  userProfile: UserProfile;
  onBuyItem: (item: ShopItem) => void;
  onEquipOutfit: (outfitId: string) => void;
  onClose: () => void;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'energy-refill',
    name: 'Recharge d\'Énergie Pleine',
    description: 'Remplis immédiatement tous tes cœurs au maximum pour continuer à jouer.',
    price: 350,
    icon: '⚡',
    category: 'hearts',
  },
  {
    id: 'streak-freeze',
    name: 'Gel de Série Protecteur',
    description: 'Protège ta série si tu manques un jour d\'entraînement.',
    price: 200,
    icon: '❄️',
    category: 'freeze',
  },
  {
    id: 'double-xp',
    name: 'Potion Double XP (15 min)',
    description: 'Double tous tes gains d\'XP pendant 15 minutes complètes.',
    price: 150,
    icon: '🧪',
    category: 'boost',
  },
  {
    id: 'outfit-super',
    name: 'Costume Super Héros',
    description: 'Habille ta mascotte avec une cape légendaire et une couronne lumineuse.',
    price: 400,
    icon: '🦸‍♂️',
    category: 'outfit',
    outfitId: 'outfit-super',
  },
  {
    id: 'outfit-tuxedo',
    name: 'Smoking Grand Gala',
    description: 'Un look raffiné avec nœud papillon et lunettes chics.',
    price: 300,
    icon: '🤵',
    category: 'outfit',
    outfitId: 'outfit-tuxedo',
  },
  {
    id: 'outfit-sport',
    name: 'Bandeau Athlète & Sport',
    description: 'Lunettes de soleil et bandeau pour les marathoniens de la langue.',
    price: 250,
    icon: '🏋️‍♂️',
    category: 'outfit',
    outfitId: 'outfit-sport',
  },
];

export const ShopView: React.FC<ShopViewProps> = ({
  userProfile,
  onBuyItem,
  onEquipOutfit,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col border-2 border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛍️</span>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Boutique & Objets</h2>
              <p className="text-xs font-bold text-gray-500">Dépense tes gemmes pour booster ton apprentissage</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-sky-50 px-3 py-1.5 rounded-2xl border border-sky-200">
              <Gem className="w-4 h-4 text-sky-500 fill-sky-500" />
              <span className="font-extrabold text-sm text-sky-600">{userProfile.gems}</span>
            </div>
            <button
              onClick={() => {
                soundManager.playPop();
                onClose();
              }}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {SHOP_ITEMS.map((item) => {
            const isOwned = userProfile.ownedItems.includes(item.id);
            const isOutfit = item.category === 'outfit';
            const isEquipped = isOutfit && userProfile.equippedOutfit === item.outfitId;
            const canAfford = userProfile.gems >= item.price;

            return (
              <div
                key={item.id}
                className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 transition ${
                  isEquipped
                    ? 'border-purple-300 bg-purple-50/50'
                    : isOwned
                    ? 'border-gray-200 bg-gray-50/70'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl shrink-0">
                    {item.icon}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-gray-800 flex items-center gap-2">
                      <span>{item.name}</span>
                      {isEquipped && (
                        <span className="text-[10px] bg-purple-600 text-white font-extrabold px-2 py-0.5 rounded-full">
                          Équipé
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 font-medium leading-tight">
                      {item.description}
                    </div>
                  </div>
                </div>

                {/* Actions: Buy or Equip */}
                <div className="shrink-0">
                  {isOutfit && isOwned ? (
                    <button
                      onClick={() => {
                        soundManager.playPop();
                        onEquipOutfit(item.outfitId!);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs transition cursor-pointer active:translate-y-0.5 ${
                        isEquipped
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                          : 'btn-3d-purple text-white'
                      }`}
                    >
                      {isEquipped ? '✓ Actif' : 'Équiper'}
                    </button>
                  ) : (
                    <button
                      disabled={!canAfford}
                      onClick={() => {
                        soundManager.playGem();
                        onBuyItem(item);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer active:translate-y-0.5 ${
                        canAfford
                          ? 'btn-3d-blue text-white'
                          : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                      }`}
                    >
                      <Gem className="w-3.5 h-3.5 fill-current" />
                      <span>{item.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
