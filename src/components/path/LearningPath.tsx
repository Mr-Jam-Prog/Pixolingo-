import React, { useState, useEffect } from 'react';
import { Course, UserProfile, Unit, Lesson, LanguageCode } from '../../types';
import { BookOpen, Trophy, Sparkles, Globe, ChevronRight, Volume2, Mic, Headphones } from 'lucide-react';
import { DuoMascot } from '../mascot/DuoMascot';
import { LessonNode } from './LessonNode';
import { LessonLaunchModal } from './LessonLaunchModal';
import { soundManager, speakInstruction } from '../../utils/sound';

interface LearningPathProps {
  course: Course;
  userProfile: UserProfile;
  allCourses?: Course[];
  onSelectLanguage?: (lang: LanguageCode) => void;
  onStartLesson: (unit: Unit, lesson: Lesson) => void;
  onOpenGuidebook?: (unit: Unit) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
  course,
  userProfile,
  allCourses,
  onSelectLanguage,
  onStartLesson,
  onOpenGuidebook,
}) => {
  const [selectedLaunchLesson, setSelectedLaunchLesson] = useState<{
    unit: Unit;
    lesson: Lesson;
    isCompleted: boolean;
  } | null>(null);

  const isNoahOrToddler =
    userProfile.name.toLowerCase().includes('noah') ||
    userProfile.name.includes('3-6');

  const [trackFilter, setTrackFilter] = useState<'all' | 'early' | 'standard'>(
    isNoahOrToddler ? 'early' : 'all'
  );

  useEffect(() => {
    if (isNoahOrToddler) {
      setTrackFilter('early');
    }
  }, [userProfile.name, isNoahOrToddler]);

  const getUnitColorClasses = (color?: string) => {
    switch (color) {
      case 'rose':
        return 'bg-rose-500 shadow-3d-rose text-white';
      case 'blue':
        return 'bg-sky-500 shadow-3d-blue text-white';
      case 'purple':
        return 'bg-purple-500 shadow-3d-purple text-white';
      case 'amber':
        return 'bg-amber-500 shadow-3d-amber text-white';
      case 'emerald':
      default:
        return 'bg-emerald-500 shadow-3d-green text-white';
    }
  };

  const displayedUnits = course.units.filter((unit) => {
    if (trackFilter === 'early') return !!unit.isEarlyLearner;
    if (trackFilter === 'standard') return !unit.isEarlyLearner;
    return true;
  });

  return (
    <div className="py-4 max-w-xl mx-auto px-4 space-y-6">
      {/* Quick Language Switcher Bar at top of path */}
      {allCourses && allCourses.length > 0 && onSelectLanguage && (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-3 shadow-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-gray-500">
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>Changer de langue ({allCourses.length} cours disponibles)</span>
            </div>
            <span className="text-[11px] font-extrabold text-emerald-600">
              Actif : {course.flag} {course.languageName}
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {allCourses.map((c) => {
              const isSelected = c.language === userProfile.currentLanguage;
              return (
                <button
                  key={c.id}
                  onClick={() => {
                    soundManager.playPop();
                    onSelectLanguage(c.language);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-200'
                      : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }`}
                  title={`${c.languageName} (${c.units.length} unités)`}
                >
                  <span className="text-base">{c.flag}</span>
                  <span>{c.languageName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Pedagogical Track Switcher Bar */}
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-2 shadow-xs flex items-center gap-1.5">
        <button
          onClick={() => {
            soundManager.playPop();
            setTrackFilter('early');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            trackFilter === 'early'
              ? 'bg-amber-400 text-amber-950 shadow-sm border border-amber-500 ring-2 ring-amber-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🧸</span>
          <span className="truncate">Éveil 3–6 ans (Images & Sons)</span>
        </button>

        <button
          onClick={() => {
            soundManager.playPop();
            setTrackFilter('standard');
          }}
          className={`flex-1 py-2 px-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
            trackFilter === 'standard'
              ? 'bg-emerald-500 text-white shadow-sm border border-emerald-600 ring-2 ring-emerald-200'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>🎒</span>
          <span className="truncate">Standard (Tous âges)</span>
        </button>

        <button
          onClick={() => {
            soundManager.playPop();
            setTrackFilter('all');
          }}
          className={`px-3 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
            trackFilter === 'all'
              ? 'bg-gray-800 text-white'
              : 'text-gray-500 hover:bg-gray-100'
          }`}
          title="Afficher toutes les unités"
        >
          Tout
        </button>
      </div>

      {/* Early Learner Track Info Callout Banner */}
      {trackFilter === 'early' && (
        <div className="bg-gradient-to-r from-amber-100 via-orange-50 to-amber-100 border-2 border-amber-300 rounded-3xl p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
              <span className="text-xl">👶</span>
              <span>Parcours Éveil 3–6 ans • Zéro Écrit</span>
            </div>
            <button
              onClick={() => {
                soundManager.playPop();
                speakInstruction(
                  "Bienvenue dans le parcours éveil trois six ans ! Regarde les belles images, écoute les sons et répète dans le micro !"
                );
              }}
              className="flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-amber-50 text-amber-800 font-extrabold text-xs rounded-xl border border-amber-300 transition cursor-pointer shadow-xs"
              title="Écouter la présentation vocale"
            >
              <Volume2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Écouter</span>
            </button>
          </div>
          <p className="text-xs text-amber-800 font-bold leading-relaxed">
            Parcours spécialement conçu pour les tout-petits ne maîtrisant ni la lecture ni l'écriture.
            Basé sur <span className="underline">des cartes illustrées</span>, <span className="underline">l'écoute active</span> et <span className="underline">la diction orale au microphone</span> pour entraîner l'oreille et la parole en s'amusant !
          </p>
          <div className="flex items-center gap-3 pt-1 text-[11px] font-black text-amber-900">
            <span className="flex items-center gap-1">
              <Headphones className="w-3.5 h-3.5 text-amber-700" />
              Discrimination sonore
            </span>
            <span className="flex items-center gap-1">
              <Mic className="w-3.5 h-3.5 text-amber-700" />
              Diction & souffle
            </span>
          </div>
        </div>
      )}

      {displayedUnits.map((unit, unitIdx) => {
        return (
          <div key={unit.id} className="relative space-y-6">
            {/* Unit Header Banner */}
            <div className={`rounded-3xl p-5 text-white flex items-center justify-between relative overflow-hidden transition-all ${getUnitColorClasses(unit.color)}`}>
              <div className="space-y-1 z-10">
                {unit.isEarlyLearner && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-black uppercase tracking-wider backdrop-blur-xs mb-1">
                    👶 ÉVEIL 3–6 ANS • ZÉRO ÉCRIT
                  </div>
                )}
                <div className="text-xs uppercase tracking-wider font-extrabold text-white/80">
                  {unit.title}
                </div>
                <div className="text-sm font-bold text-white/95 max-w-xs">
                  {unit.description}
                </div>
              </div>

              <div className="flex items-center gap-2 z-10">
                {unit.isEarlyLearner ? (
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      speakInstruction(unit.description);
                    }}
                    className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-2xl text-xs font-extrabold backdrop-blur-sm transition cursor-pointer"
                    title="Écouter la description"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Écouter</span>
                  </button>
                ) : (
                  unit.guidebook && (
                    <button
                      onClick={() => {
                        soundManager.playPop();
                        if (onOpenGuidebook) onOpenGuidebook(unit);
                      }}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3.5 py-2 rounded-2xl text-xs font-extrabold backdrop-blur-sm transition cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Guide</span>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Serpentine Lesson Nodes */}
            <div className="flex flex-col items-center gap-4 relative py-4">
              {/* Mascot cheering beside path */}
              {unitIdx === 0 && (
                <div className="hidden sm:flex flex-col items-center absolute right-2 top-4 z-10 select-none">
                  <DuoMascot
                    avatarConfig={userProfile.avatarConfig}
                    outfit={userProfile.equippedOutfit}
                    mood={userProfile.streak >= 3 ? 'onFire' : 'happy'}
                    size={76}
                    speechText={unit.isEarlyLearner ? "Touche les images et répète avec moi ! 🌟" : "Prêt à t'entraîner ? 🚀"}
                    onClick={() => soundManager.playPop()}
                  />
                </div>
              )}

              {unit.lessons.map((lesson, lessonIdx) => {
                const isCompleted = userProfile.completedLessonIds.includes(lesson.id);
                const isUnlocked =
                  lessonIdx === 0 ||
                  userProfile.completedLessonIds.includes(unit.lessons[lessonIdx - 1]?.id);
                const isCurrent = isUnlocked && !isCompleted;

                return (
                  <LessonNode
                    key={lesson.id}
                    lesson={lesson}
                    index={lessonIdx}
                    isCompleted={isCompleted}
                    isUnlocked={isUnlocked}
                    isCurrent={isCurrent}
                    unitColor={unit.color}
                    onClick={() => {
                      setSelectedLaunchLesson({ unit, lesson, isCompleted });
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Lesson Launch Preview Modal */}
      {selectedLaunchLesson && (
        <LessonLaunchModal
          unit={selectedLaunchLesson.unit}
          lesson={selectedLaunchLesson.lesson}
          isCompleted={selectedLaunchLesson.isCompleted}
          bcp47={course.bcp47}
          onStart={() => {
            const { unit, lesson } = selectedLaunchLesson;
            setSelectedLaunchLesson(null);
            onStartLesson(unit, lesson);
          }}
          onClose={() => setSelectedLaunchLesson(null)}
        />
      )}
    </div>
  );
};

