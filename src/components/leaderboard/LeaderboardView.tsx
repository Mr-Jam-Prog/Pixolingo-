import React, { useState } from 'react';
import { LeaderboardUser, LeagueTier } from '../../types';
import { Trophy, Flame, ChevronUp, ChevronDown, Minus, Crown, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface LeaderboardViewProps {
  currentUserXP: number;
  currentStreak: number;
  currentUserName: string;
  currentUserAvatarEmoji: string;
}

const DEFAULT_USERS: LeaderboardUser[] = [
  { id: 'u-1', name: 'Sofia M.', avatarEmoji: '🦊', xp: 840, streak: 14, trend: 'up', countryFlag: '🇪🇸' },
  { id: 'u-2', name: 'Lucas D.', avatarEmoji: '🦁', xp: 790, streak: 12, trend: 'same', countryFlag: '🇫🇷' },
  { id: 'u-3', name: 'Alex K.', avatarEmoji: '🐼', xp: 710, streak: 8, trend: 'up', countryFlag: '🇩🇪' },
  { id: 'u-4', name: 'Elena R.', avatarEmoji: '🐱', xp: 620, streak: 19, trend: 'down', countryFlag: '🇮🇹' },
  { id: 'u-5', name: 'Kenji T.', avatarEmoji: '🐲', xp: 540, streak: 7, trend: 'up', countryFlag: '🇯🇵' },
  { id: 'u-6', name: 'Chloe B.', avatarEmoji: '🐰', xp: 480, streak: 5, trend: 'down', countryFlag: '🇬🇧' },
  { id: 'u-7', name: 'Maxime L.', avatarEmoji: '🐶', xp: 410, streak: 3, trend: 'same', countryFlag: '🇫🇷' },
  { id: 'u-8', name: 'Liam S.', avatarEmoji: '🤖', xp: 320, streak: 2, trend: 'down', countryFlag: '🇺🇸' },
  { id: 'u-9', name: 'Maya P.', avatarEmoji: '🦉', xp: 260, streak: 4, trend: 'same', countryFlag: '🇨🇦' },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  currentUserXP,
  currentStreak,
  currentUserName,
  currentUserAvatarEmoji,
}) => {
  const [activeTier, setActiveTier] = useState<LeagueTier>('gold');

  // Insert current user into leaderboard dynamically
  const currentUser: LeaderboardUser = {
    id: 'current-user',
    name: currentUserName || 'Vous',
    avatarEmoji: currentUserAvatarEmoji || '🌟',
    xp: currentUserXP,
    streak: currentStreak,
    isCurrentUser: true,
    trend: 'up',
    countryFlag: '⭐',
  };

  const allUsers = [...DEFAULT_USERS, currentUser].sort((a, b) => b.xp - a.xp);

  const tiers: { id: LeagueTier; label: string; color: string; icon: string }[] = [
    { id: 'bronze', label: 'Bronze', color: 'from-amber-700 to-amber-900', icon: '🥉' },
    { id: 'silver', label: 'Argent', color: 'from-slate-400 to-slate-600', icon: '🥈' },
    { id: 'gold', label: 'Or', color: 'from-yellow-400 to-amber-500', icon: '🥇' },
    { id: 'sapphire', label: 'Saphir', color: 'from-blue-500 to-indigo-600', icon: '💎' },
    { id: 'ruby', label: 'Rubis', color: 'from-rose-500 to-red-600', icon: '♦️' },
    { id: 'diamond', label: 'Diamant', color: 'from-cyan-400 to-blue-500', icon: '👑' },
  ];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* League Header Card */}
      <div className="bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-500 text-white rounded-3xl p-6 shadow-xl border-4 border-white relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl shadow-inner">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-white/30 px-2.5 py-0.5 rounded-full">
                Ligue Actuelle
              </span>
              <h2 className="text-2xl font-black mt-1">Ligue Or</h2>
              <p className="text-xs font-bold text-amber-100">
                Les 3 premiers accèdent à la Ligue Saphir !
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-100 block">
              Fin dans
            </span>
            <span className="text-base font-black bg-black/20 px-3 py-1 rounded-xl">
              2j 14h
            </span>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl" />
      </div>

      {/* League Selector Pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {tiers.map((t) => (
          <button
            key={t.id}
            onClick={() => {
              soundManager.playPop();
              setActiveTier(t.id);
            }}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition cursor-pointer ${
              activeTier === t.id
                ? 'bg-gray-900 text-white shadow-md scale-105'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <span>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Podium for Top 3 */}
      <div className="grid grid-cols-3 gap-3 pt-6 pb-2 items-end">
        {/* 2nd place */}
        {allUsers[1] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 border-2 border-slate-300 text-2xl flex items-center justify-center shadow-md">
                {allUsers[1].avatarEmoji}
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-300 border border-white text-slate-800 font-black text-xs flex items-center justify-center">
                2
              </span>
            </div>
            <p className="text-xs font-black text-gray-800 truncate max-w-[80px] text-center">
              {allUsers[1].name}
            </p>
            <p className="text-[11px] font-bold text-gray-500">{allUsers[1].xp} XP</p>
            <div className="w-full h-16 bg-gradient-to-t from-slate-200 to-slate-100 rounded-t-2xl mt-2 border-t-4 border-slate-300 flex items-center justify-center font-black text-slate-400">
              2
            </div>
          </div>
        )}

        {/* 1st place */}
        {allUsers[0] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-yellow-500 fill-yellow-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="w-16 h-16 rounded-2xl bg-amber-100 border-4 border-yellow-400 text-3xl flex items-center justify-center shadow-lg">
                {allUsers[0].avatarEmoji}
              </div>
              <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-yellow-400 border-2 border-white text-yellow-900 font-black text-xs flex items-center justify-center shadow-md">
                1
              </span>
            </div>
            <p className="text-xs font-black text-gray-800 truncate max-w-[90px] text-center">
              {allUsers[0].name}
            </p>
            <p className="text-[11px] font-black text-amber-600">{allUsers[0].xp} XP</p>
            <div className="w-full h-24 bg-gradient-to-t from-yellow-300 to-yellow-200 rounded-t-2xl mt-2 border-t-4 border-yellow-400 flex items-center justify-center font-black text-yellow-700 text-lg shadow-inner">
              1
            </div>
          </div>
        )}

        {/* 3rd place */}
        {allUsers[2] && (
          <div className="flex flex-col items-center">
            <div className="relative mb-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-600 text-2xl flex items-center justify-center shadow-md">
                {allUsers[2].avatarEmoji}
              </div>
              <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-600 border border-white text-white font-black text-xs flex items-center justify-center">
                3
              </span>
            </div>
            <p className="text-xs font-black text-gray-800 truncate max-w-[80px] text-center">
              {allUsers[2].name}
            </p>
            <p className="text-[11px] font-bold text-gray-500">{allUsers[2].xp} XP</p>
            <div className="w-full h-12 bg-gradient-to-t from-amber-200 to-amber-100 rounded-t-2xl mt-2 border-t-4 border-amber-600 flex items-center justify-center font-black text-amber-800">
              3
            </div>
          </div>
        )}
      </div>

      {/* Users List with Promotion & Demotion indicators */}
      <div className="bg-white rounded-3xl border-2 border-gray-200 overflow-hidden shadow-sm">
        {/* Promotion banner */}
        <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between text-xs font-black text-emerald-700">
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Zone de promotion (Top 3 vers Ligue Saphir)
          </span>
          <ChevronUp className="w-4 h-4 text-emerald-500" />
        </div>

        <div className="divide-y divide-gray-100">
          {allUsers.map((user, index) => {
            const rank = index + 1;
            const isPromotionZone = rank <= 3;
            const isDemotionZone = rank > allUsers.length - 2;

            return (
              <div
                key={user.id}
                className={`flex items-center justify-between px-4 py-3 transition ${
                  user.isCurrentUser
                    ? 'bg-emerald-50/70 border-l-4 border-l-emerald-500 font-black'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <span
                    className={`w-6 text-center font-black text-sm ${
                      rank === 1
                        ? 'text-yellow-600'
                        : rank === 2
                        ? 'text-slate-500'
                        : rank === 3
                        ? 'text-amber-700'
                        : 'text-gray-400'
                    }`}
                  >
                    {rank}
                  </span>

                  {/* Trend icon */}
                  <span className="text-xs">
                    {user.trend === 'up' && <ChevronUp className="w-4 h-4 text-emerald-500" />}
                    {user.trend === 'down' && <ChevronDown className="w-4 h-4 text-rose-500" />}
                    {user.trend === 'same' && <Minus className="w-3.5 h-3.5 text-gray-300" />}
                  </span>

                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 text-xl flex items-center justify-center border border-gray-200">
                    {user.avatarEmoji}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-gray-800">
                        {user.name} {user.isCurrentUser && '(Vous)'}
                      </span>
                      {user.countryFlag && (
                        <span className="text-xs">{user.countryFlag}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                      <span className="flex items-center gap-0.5 text-orange-500">
                        <Flame className="w-3 h-3 fill-current" />
                        {user.streak}j
                      </span>
                      {isPromotionZone && (
                        <span className="text-[10px] text-emerald-600 font-black">Promotion ✨</span>
                      )}
                      {isDemotionZone && (
                        <span className="text-[10px] text-rose-500 font-black">Danger ⚠️</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right">
                  <span className="text-sm font-black text-gray-800">{user.xp} XP</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
