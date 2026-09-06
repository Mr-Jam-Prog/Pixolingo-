import React, { useState, useEffect } from 'react';
import {
  UserProfile,
  Course,
  Unit,
  Lesson,
  ShopItem,
  Exercise,
  LanguageCode,
  FamilyProfile,
  CustomAvatarConfig,
} from './types';
import { COURSES_DATA } from './data/coursesData';
import {
  getStoredFamilyMembers,
  saveFamilyMembers,
  getStoredActiveFamilyMemberId,
  saveActiveFamilyMemberId,
} from './data/familyData';
import { TopBar } from './components/navigation/TopBar';
import { Sidebar } from './components/navigation/Sidebar';
import { MobileTabBar } from './components/navigation/MobileTabBar';
import { LearningPath } from './components/path/LearningPath';
import { LessonEngine } from './components/lesson/LessonEngine';
import { ShopView } from './components/shop/ShopView';
import { ProfileView } from './components/profile/ProfileView';
import { LeaderboardView } from './components/leaderboard/LeaderboardView';
import { UnitGuideModal } from './components/path/UnitGuideModal';
import { MistakesReviewModal } from './components/profile/MistakesReviewModal';
import { StudioModal } from './components/studio/StudioModal';
import { ParentTeacherStudio } from './components/family/ParentTeacherStudio';
import { FamilyProfileSwitcherModal } from './components/family/FamilyProfileSwitcherModal';
import { FamilyMemberEditorModal } from './components/family/FamilyMemberEditorModal';
import { ParentalLockModal } from './components/kids/ParentalLockModal';
import { KidsModeFloatingBar } from './components/kids/KidsModeFloatingBar';
import { KidsSafeGuideModal } from './components/kids/KidsSafeGuideModal';
import { AvatarCustomizerModal } from './components/avatar/AvatarCustomizerModal';
import { MicrophoneTestModal } from './components/modals/MicrophoneTestModal';
import { InteractiveAvatar } from './components/avatar/InteractiveAvatar';
import { soundManager } from './utils/sound';
import { checkKioskExitPermission } from './utils/kioskLock';
import { Users, ShieldCheck, Sparkles, Clock, Flame, Award, Plus, Edit2 } from 'lucide-react';
import confetti from 'canvas-confetti';

export const App: React.FC = () => {
  // Courses state with all 12 languages (merges localStorage with latest COURSES_DATA)
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem('app_courses');
      if (!saved) return COURSES_DATA;
      const parsed: Course[] = JSON.parse(saved);
      if (!Array.isArray(parsed) || parsed.length === 0) return COURSES_DATA;

      const mergedMap = new Map<string, Course>();
      COURSES_DATA.forEach((c) => mergedMap.set(c.language, c));

      parsed.forEach((savedC) => {
        if (savedC && savedC.language) {
          if (mergedMap.has(savedC.language)) {
            const baseCourse = mergedMap.get(savedC.language)!;
            const baseUnitIds = new Set(baseCourse.units.map((u) => u.id));
            const customUnits = (savedC.units || []).filter((u: Unit) => !baseUnitIds.has(u.id));
            mergedMap.set(savedC.language, {
              ...baseCourse,
              units: [...baseCourse.units, ...customUnits],
            });
          } else {
            mergedMap.set(savedC.language, savedC);
          }
        }
      });
      return Array.from(mergedMap.values());
    } catch {
      return COURSES_DATA;
    }
  });

  // Ensure all 12 courses from COURSES_DATA are immediately registered in state and localStorage
  useEffect(() => {
    setCourses((current) => {
      const currentLangs = new Set(current.map((c) => c.language));
      const missing = COURSES_DATA.filter((c) => !currentLangs.has(c.language));
      if (missing.length > 0) {
        const updated = [...current, ...missing];
        try {
          localStorage.setItem('app_courses', JSON.stringify(updated));
        } catch {
          // ignore
        }
        return updated;
      }
      return current;
    });
  }, []);

  // Family profiles state
  const [familyMembers, setFamilyMembers] = useState<FamilyProfile[]>(() => {
    return getStoredFamilyMembers();
  });

  const [activeMemberId, setActiveMemberId] = useState<string>(() => {
    return getStoredActiveFamilyMemberId();
  });

  const activeFamilyMember =
    familyMembers.find((m) => m.id === activeMemberId) || familyMembers[0];

  // User Profile synchronized with active family member
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const mem = activeFamilyMember;
    return {
      id: mem.id,
      name: mem.name,
      avatarEmoji: mem.avatarEmoji,
      avatarConfig: {
        style: 'big-smile',
        seed: mem.name,
        hairColor: 'brown',
        skinColor: 'light',
      },
      gems: mem.gems,
      xp: mem.xp,
      energy: 5,
      maxEnergy: 5,
      streak: mem.streak,
      equippedOutfit: 'outfit-super',
      ownedItems: ['outfit-super', 'streak-freeze'],
      streakFreezeCount: 1,
      currentLanguage: mem.currentLanguage,
      completedLessonIds: mem.completedLessonIds || ['es-u1-l1'],
      mistakeBank: mem.mistakeBank || [],
      dailyGoals: mem.dailyGoals || {
        targetXP: 40,
        currentXP: 20,
      },
    };
  });

  // Navigation tab state
  const [currentTab, setCurrentTab] = useState<
    'path' | 'leaderboard' | 'shop' | 'profile' | 'family'
  >('path');

  // Modals state
  const [activeLesson, setActiveLesson] = useState<{ unit: Unit; lesson: Lesson } | null>(null);
  const [activeGuideUnit, setActiveGuideUnit] = useState<Unit | null>(null);
  const [isShopModalOpen, setIsShopModalOpen] = useState(false);
  const [isMistakesOpen, setIsMistakesOpen] = useState(false);
  const [isStudioOpen, setIsStudioOpen] = useState(false);

  // Family & Kids Modals state
  const [isFamilySwitcherOpen, setIsFamilySwitcherOpen] = useState(false);
  const [editingFamilyMember, setEditingFamilyMember] = useState<FamilyProfile | null>(null);
  const [isCreatingNewMember, setIsCreatingNewMember] = useState(false);
  const [isParentalLockOpen, setIsParentalLockOpen] = useState(false);
  const [parentalLockPendingAction, setParentalLockPendingAction] = useState<(() => void) | null>(
    null
  );
  const [isKidsSafeGuideOpen, setIsKidsSafeGuideOpen] = useState(false);
  const [isAvatarCustomizerOpen, setIsAvatarCustomizerOpen] = useState(false);
  const [isMicrophoneModalOpen, setIsMicrophoneModalOpen] = useState(false);

  // Sync family members to localStorage
  useEffect(() => {
    saveFamilyMembers(familyMembers);
  }, [familyMembers]);

  // Sync active member id to localStorage
  useEffect(() => {
    saveActiveFamilyMemberId(activeMemberId);
  }, [activeMemberId]);

  // Sync courses to localStorage
  useEffect(() => {
    localStorage.setItem('app_courses', JSON.stringify(courses));
  }, [courses]);

  // When active family member changes, sync to userProfile
  useEffect(() => {
    const mem = activeFamilyMember;
    setUserProfile((prev) => ({
      ...prev,
      id: mem.id,
      name: mem.name,
      avatarEmoji: mem.avatarEmoji,
      gems: mem.gems,
      xp: mem.xp,
      streak: mem.streak,
      currentLanguage: mem.currentLanguage,
      completedLessonIds: mem.completedLessonIds || [],
      mistakeBank: mem.mistakeBank || [],
      dailyGoals: mem.dailyGoals || { targetXP: 40, currentXP: 0 },
    }));
  }, [activeMemberId]);

  const currentCourse =
    courses.find((c) => c.language === userProfile.currentLanguage) || courses[0];

  // Helper to update active family member and userProfile concurrently
  const updateActiveMemberStats = (updates: Partial<FamilyProfile>) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === activeMemberId ? { ...m, ...updates } : m))
    );
  };

  // Switch family profile with Parental Lock check if currently in Kids Mode
  const handleRequestSwitchProfile = (memberId: string) => {
    if (activeFamilyMember.isKidsModeEnabled && memberId !== activeMemberId) {
      setParentalLockPendingAction(() => () => {
        setActiveMemberId(memberId);
        setIsFamilySwitcherOpen(false);
        soundManager.playLevelUp();
      });
      setIsParentalLockOpen(true);
    } else {
      setActiveMemberId(memberId);
      setIsFamilySwitcherOpen(false);
      soundManager.playPop();
    }
  };

  // Exit Kids Mode with Parental Lock Gate
  const handleRequestExitKidsMode = () => {
    setParentalLockPendingAction(() => () => {
      updateActiveMemberStats({ isKidsModeEnabled: false });
      soundManager.playSuccess();
    });
    setIsParentalLockOpen(true);
  };

  // Toggle Kids Mode for current member
  const handleToggleKidsMode = () => {
    if (activeFamilyMember.isKidsModeEnabled) {
      handleRequestExitKidsMode();
    } else {
      updateActiveMemberStats({ isKidsModeEnabled: true });
      soundManager.playLevelUp();
    }
  };

  // Actions
  const handleSelectLanguage = (lang: LanguageCode) => {
    setUserProfile((prev) => ({ ...prev, currentLanguage: lang }));
    updateActiveMemberStats({ currentLanguage: lang });
  };

  const handleStartLesson = (unit: Unit, lesson: Lesson) => {
    setActiveLesson({ unit, lesson });
  };

  const handleFinishLesson = (results: {
    xpGained: number;
    gemsGained: number;
    mistakes: Exercise[];
  }) => {
    if (!activeLesson) return;

    const isNewCompletion = !userProfile.completedLessonIds.includes(activeLesson.lesson.id);
    const newCompleted = isNewCompletion
      ? [...userProfile.completedLessonIds, activeLesson.lesson.id]
      : userProfile.completedLessonIds;

    const newMistakes = [...userProfile.mistakeBank];
    results.mistakes.forEach((m) => {
      if (!newMistakes.some((item) => item.exercise.id === m.id)) {
        newMistakes.push({ exercise: m, timestamp: Date.now() });
      }
    });

    const nextXP = userProfile.xp + results.xpGained;
    const nextGems = userProfile.gems + results.gemsGained;

    setUserProfile((prev) => ({
      ...prev,
      xp: nextXP,
      gems: nextGems,
      completedLessonIds: newCompleted,
      mistakeBank: newMistakes,
      dailyGoals: {
        ...prev.dailyGoals,
        currentXP: prev.dailyGoals.currentXP + results.xpGained,
      },
    }));

    updateActiveMemberStats({
      xp: nextXP,
      gems: nextGems,
      completedLessonIds: newCompleted,
      mistakeBank: newMistakes,
    });

    setActiveLesson(null);
  };

  const handleLoseEnergy = () => {
    setUserProfile((prev) => ({
      ...prev,
      energy: Math.max(0, prev.energy - 1),
    }));
  };

  const handleBuyItem = (item: ShopItem) => {
    if (userProfile.gems < item.price) return;

    setUserProfile((prev) => {
      const updatedOwned = prev.ownedItems.includes(item.id)
        ? prev.ownedItems
        : [...prev.ownedItems, item.id];

      let newEnergy = prev.energy;
      let newFreezes = prev.streakFreezeCount;
      let boostUntil = prev.activeBoostUntil;

      if (item.category === 'hearts') {
        newEnergy = prev.maxEnergy;
      } else if (item.category === 'freeze') {
        newFreezes += 1;
      } else if (item.category === 'boost') {
        boostUntil = Date.now() + 15 * 60 * 1000;
      }

      const nextGems = prev.gems - item.price;
      updateActiveMemberStats({ gems: nextGems });

      return {
        ...prev,
        gems: nextGems,
        ownedItems: updatedOwned,
        energy: newEnergy,
        streakFreezeCount: newFreezes,
        activeBoostUntil: boostUntil,
      };
    });
  };

  const handleEquipOutfit = (outfitId: string) => {
    setUserProfile((prev) => ({
      ...prev,
      equippedOutfit: prev.equippedOutfit === outfitId ? undefined : outfitId,
    }));
  };

  const handleCorrectMistake = (exerciseId: string) => {
    const updated = userProfile.mistakeBank.filter((item) => item.exercise.id !== exerciseId);
    setUserProfile((prev) => ({
      ...prev,
      mistakeBank: updated,
      energy: Math.min(prev.maxEnergy, prev.energy + 1),
    }));
    updateActiveMemberStats({ mistakeBank: updated });
  };

  const handleSaveAvatarConfig = (config: CustomAvatarConfig) => {
    updateActiveMemberStats({ customAvatar: config });
    setIsAvatarCustomizerOpen(false);
    soundManager.playSuccess();
    confetti({ particleCount: 50, spread: 60 });
  };

  const handleSaveFamilyMember = (member: FamilyProfile) => {
    setFamilyMembers((prev) => {
      const exists = prev.some((m) => m.id === member.id);
      if (exists) {
        return prev.map((m) => (m.id === member.id ? member : m));
      }
      return [...prev, member];
    });
    setEditingFamilyMember(null);
    setIsCreatingNewMember(false);
    soundManager.playSuccess();
  };

  const handleDeleteFamilyMember = (memberId: string) => {
    if (familyMembers.length <= 1) return;
    setFamilyMembers((prev) => prev.filter((m) => m.id !== memberId));
    if (activeMemberId === memberId) {
      const nextMember = familyMembers.find((m) => m.id !== memberId);
      if (nextMember) setActiveMemberId(nextMember.id);
    }
  };

  const handleAddCustomLesson = (lesson: Lesson) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.language === userProfile.currentLanguage) {
          const firstUnit = c.units[0];
          const updatedUnits = [
            {
              ...firstUnit,
              lessons: [...firstUnit.lessons, lesson],
            },
            ...c.units.slice(1),
          ];
          return { ...c, units: updatedUnits };
        }
        return c;
      })
    );
    setIsStudioOpen(false);
    soundManager.playSuccess();
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex flex-col pb-20 sm:pb-0 sm:pl-64">
      {/* Sidebar for Desktop */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenStudio={() => setIsStudioOpen(true)}
        activeFamilyMember={activeFamilyMember}
        onOpenFamilySwitcher={() => setIsFamilySwitcherOpen(true)}
      />

      {/* Mobile Bottom Tab Bar */}
      <MobileTabBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenStudio={() => setIsStudioOpen(true)}
      />

      {/* Main Top Header */}
      <TopBar
        userProfile={userProfile}
        courses={courses}
        activeFamilyMember={activeFamilyMember}
        onSelectLanguage={handleSelectLanguage}
        onOpenShop={() => setIsShopModalOpen(true)}
        onOpenMistakes={() => setIsMistakesOpen(true)}
        onOpenFamilySwitcher={() => setIsFamilySwitcherOpen(true)}
        onOpenMicrophoneTest={() => setIsMicrophoneModalOpen(true)}
      />

      {/* Floating Kids Mode Bar (when kids mode is active) */}
      {activeFamilyMember.isKidsModeEnabled && (
        <KidsModeFloatingBar
          currentProfile={activeFamilyMember}
          onExitKidsModeClick={handleRequestExitKidsMode}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-2 sm:p-4">
        {/* 1. Path View */}
        {currentTab === 'path' && (
          <LearningPath
            course={currentCourse}
            userProfile={userProfile}
            allCourses={courses}
            onSelectLanguage={handleSelectLanguage}
            onStartLesson={handleStartLesson}
            onOpenGuidebook={(unit) => setActiveGuideUnit(unit)}
          />
        )}

        {/* 2. Leaderboard View */}
        {currentTab === 'leaderboard' && (
          <LeaderboardView
            currentUserXP={userProfile.xp}
            currentStreak={userProfile.streak}
            currentUserName={userProfile.name}
            currentUserAvatarEmoji={userProfile.avatarEmoji}
          />
        )}

        {/* 3. Shop View */}
        {currentTab === 'shop' && (
          <div className="max-w-xl mx-auto py-4">
            <ShopView
              userProfile={userProfile}
              onBuyItem={handleBuyItem}
              onEquipOutfit={handleEquipOutfit}
              onClose={() => setCurrentTab('path')}
            />
          </div>
        )}

        {/* 4. Profile & Avatar View */}
        {currentTab === 'profile' && (
          <ProfileView
            userProfile={userProfile}
            customAvatar={activeFamilyMember.customAvatar}
            courses={courses}
            onSelectLanguage={handleSelectLanguage}
            onUpdateProfile={(updates) => {
              setUserProfile((prev) => ({ ...prev, ...updates }));
              updateActiveMemberStats({ name: updates.name });
            }}
            onEquipOutfit={handleEquipOutfit}
            onOpenShop={() => setIsShopModalOpen(true)}
            onOpenStudio={() => setIsStudioOpen(true)}
            onOpenAvatarCustomizer={() => setIsAvatarCustomizerOpen(true)}
            onOpenMicrophoneTest={() => setIsMicrophoneModalOpen(true)}
          />
        )}

        {/* 5. Family Hub View */}
        {currentTab === 'family' && (
          <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 text-white rounded-3xl p-6 shadow-xl border-4 border-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
                  👨‍👩‍👧‍👦
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-white/30 text-[10px] font-black uppercase tracking-wider">
                    Espace PolyGlot Famille
                  </span>
                  <h2 className="text-2xl font-black mt-1">Tableau de Bord Familial</h2>
                  <p className="text-xs text-emerald-100 font-bold">
                    Gérez les profils, les limites d'écran et suivez les progrès de chacun
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsFamilySwitcherOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-white text-emerald-800 font-black text-xs shadow-md hover:bg-emerald-50 transition cursor-pointer"
                >
                  Changer de profil
                </button>
                <button
                  onClick={() => setIsCreatingNewMember(true)}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-700 text-white font-black text-xs hover:bg-emerald-800 transition cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
              </div>
            </div>

            {/* Family Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {familyMembers.map((member) => {
                const isActive = member.id === activeMemberId;
                return (
                  <div
                    key={member.id}
                    className={`bg-white rounded-3xl p-5 border-2 transition relative flex flex-col justify-between ${
                      isActive
                        ? 'border-emerald-500 ring-2 ring-emerald-200 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div>
                      {/* Top status */}
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                            member.role === 'kid'
                              ? 'bg-amber-100 text-amber-800'
                              : member.role === 'teen'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {member.role === 'kid'
                            ? 'Enfant'
                            : member.role === 'teen'
                            ? 'Adolescent'
                            : 'Parent'}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingFamilyMember(member)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            title="Modifier ce membre"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Avatar & Name */}
                      <div className="flex items-center gap-3 mb-4">
                        {member.customAvatar ? (
                          <InteractiveAvatar
                            config={member.customAvatar}
                            size="sm"
                            interactive={false}
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 text-2xl flex items-center justify-center border border-gray-200">
                            {member.avatarEmoji}
                          </div>
                        )}
                        <div>
                          <h4 className="text-base font-black text-gray-800 flex items-center gap-1.5">
                            <span>{member.name}</span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                            )}
                          </h4>
                          <span className="text-xs font-bold text-gray-400">
                            {member.age ? `${member.age} ans` : 'Apprenant'}
                          </span>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-2xl mb-4 text-center">
                        <div>
                          <span className="text-xs font-black text-amber-600 block">
                            {member.xp}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">XP</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-orange-500 block">
                            {member.streak}j
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">Série</span>
                        </div>
                        <div>
                          <span className="text-xs font-black text-cyan-600 block">
                            {member.gems}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">Gemmes</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleRequestSwitchProfile(member.id)}
                      className={`w-full py-2.5 rounded-xl font-black text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {isActive ? '✓ Profil Actif' : 'Sélectionner ce profil'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Kids Mode & Safety Info Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl">
                  🛡️
                </div>
                <div>
                  <h4 className="text-base font-black text-gray-800">
                    Mode Sécurité Enfant & Contrôle Parental
                  </h4>
                  <p className="text-xs font-bold text-gray-500">
                    Protège les jeunes apprenants avec une limitation d'écran, zéro publicité et un sas
                    sécurisé par calcul mathématique.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleKidsMode}
                  className={`px-4 py-2.5 rounded-2xl font-black text-xs transition cursor-pointer ${
                    activeFamilyMember.isKidsModeEnabled
                      ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                      : 'bg-amber-500 text-white shadow-md hover:bg-amber-600'
                  }`}
                >
                  {activeFamilyMember.isKidsModeEnabled
                    ? 'Désactiver Mode Enfant'
                    : 'Activer Mode Enfant'}
                </button>
                <button
                  onClick={() => setIsKidsSafeGuideOpen(true)}
                  className="px-3 py-2.5 rounded-2xl border border-gray-200 text-xs font-black text-gray-600 hover:bg-gray-50 transition cursor-pointer"
                >
                  En savoir plus
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- MODALS --- */}

      {/* 1. Lesson Engine Modal */}
      {activeLesson && (
        <LessonEngine
          lesson={activeLesson.lesson}
          course={currentCourse}
          userProfile={userProfile}
          onFinish={handleFinishLesson}
          onClose={() => setActiveLesson(null)}
          onLoseEnergy={handleLoseEnergy}
        />
      )}

      {/* 2. Shop Modal */}
      {isShopModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl p-4">
            <ShopView
              userProfile={userProfile}
              onBuyItem={handleBuyItem}
              onEquipOutfit={handleEquipOutfit}
              onClose={() => setIsShopModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 3. Guide Unit Modal */}
      {activeGuideUnit && (
        <UnitGuideModal unit={activeGuideUnit} onClose={() => setActiveGuideUnit(null)} />
      )}

      {/* 4. Mistakes Review Modal */}
      {isMistakesOpen && (
        <MistakesReviewModal
          mistakes={userProfile.mistakeBank}
          onCorrectMistake={handleCorrectMistake}
          onClose={() => setIsMistakesOpen(false)}
        />
      )}

      {/* 5. Studio Modal / Parent-Teacher Studio */}
      {isStudioOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl p-6 relative">
            <button
              onClick={() => setIsStudioOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 transition cursor-pointer"
            >
              ✕
            </button>
            <ParentTeacherStudio
              currentLanguage={userProfile.currentLanguage}
              onAddCustomLesson={handleAddCustomLesson}
              onClose={() => setIsStudioOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 6. Family Profile Switcher Modal */}
      {isFamilySwitcherOpen && (
        <FamilyProfileSwitcherModal
          familyMembers={familyMembers}
          activeMemberId={activeMemberId}
          onSelectMember={handleRequestSwitchProfile}
          onAddNewMember={() => {
            setIsFamilySwitcherOpen(false);
            setIsCreatingNewMember(true);
          }}
          onEditMember={(member) => {
            setIsFamilySwitcherOpen(false);
            setEditingFamilyMember(member);
          }}
          onOpenParentSettings={handleToggleKidsMode}
          onClose={() => setIsFamilySwitcherOpen(false)}
        />
      )}

      {/* 7. Family Member Editor Modal */}
      {(editingFamilyMember || isCreatingNewMember) && (
        <FamilyMemberEditorModal
          member={editingFamilyMember}
          onSave={(memberData) => {
            handleSaveFamilyMember({
              id: editingFamilyMember?.id || `fam-${Date.now()}`,
              name: memberData.name || 'Nouveau Membre',
              role: memberData.role || 'kid',
              age: memberData.age,
              avatarEmoji: memberData.avatarEmoji || '🦊',
              gems: editingFamilyMember?.gems || 200,
              xp: editingFamilyMember?.xp || 0,
              streak: editingFamilyMember?.streak || 1,
              currentLanguage: memberData.currentLanguage || 'es',
              isKidsModeEnabled: memberData.isKidsModeEnabled ?? true,
              screenTimeLimitMinutes: memberData.screenTimeLimitMinutes || 30,
              screenTimeUsedMinutes: editingFamilyMember?.screenTimeUsedMinutes || 0,
              completedLessonIds: editingFamilyMember?.completedLessonIds || ['es-u1-l1'],
              mistakeBank: editingFamilyMember?.mistakeBank || [],
              dailyGoals: editingFamilyMember?.dailyGoals || { targetXP: 30, currentXP: 0 },
              ...memberData,
            } as FamilyProfile);
          }}
          onDelete={editingFamilyMember ? () => handleDeleteFamilyMember(editingFamilyMember.id) : undefined}
          onClose={() => {
            setEditingFamilyMember(null);
            setIsCreatingNewMember(false);
          }}
        />
      )}

      {/* 8. Parental Lock Modal */}
      {isParentalLockOpen && (
        <ParentalLockModal
          onSuccess={() => {
            setIsParentalLockOpen(false);
            if (parentalLockPendingAction) {
              parentalLockPendingAction();
              setParentalLockPendingAction(null);
            }
          }}
          onClose={() => {
            setIsParentalLockOpen(false);
            setParentalLockPendingAction(null);
          }}
        />
      )}

      {/* 9. Kids Safe Guide Modal */}
      {isKidsSafeGuideOpen && (
        <KidsSafeGuideModal onClose={() => setIsKidsSafeGuideOpen(false)} />
      )}

      {/* 10. Avatar Customizer Modal */}
      {isAvatarCustomizerOpen && (
        <AvatarCustomizerModal
          currentConfig={activeFamilyMember.customAvatar}
          onSave={handleSaveAvatarConfig}
          onClose={() => setIsAvatarCustomizerOpen(false)}
        />
      )}

      {/* 11. Microphone Test & Diagnostics Modal */}
      {isMicrophoneModalOpen && (
        <MicrophoneTestModal
          currentLanguage={currentCourse.language}
          onClose={() => setIsMicrophoneModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
