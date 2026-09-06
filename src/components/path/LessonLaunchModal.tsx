import React from 'react';
import { Lesson, Unit } from '../../types';
import { X, Play, Sparkles, Volume2, Award } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface LessonLaunchModalProps {
  unit: Unit;
  lesson: Lesson;
  isCompleted: boolean;
  bcp47?: string;
  onStart: () => void;
  onClose: () => void;
}

export const LessonLaunchModal: React.FC<LessonLaunchModalProps> = ({
  unit,
  lesson,
  isCompleted,
  bcp47 = 'es-ES',
  onStart,
  onClose,
}) => {
  const handlePronounce = (text: string) => {
    soundManager.speak(text, bcp47);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border-4 border-emerald-100 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">
              {unit.title}
            </span>
            <h3 className="text-xl font-black text-gray-800">{lesson.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-sm font-bold text-gray-600 leading-relaxed">
            {lesson.description}
          </p>

          {/* Key Words to Learn */}
          <div className="bg-gray-50 border-2 border-gray-100 rounded-2xl p-4">
            <h5 className="text-xs font-black text-gray-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              Mots clés au programme
            </h5>

            <div className="space-y-2">
              {lesson.exercises.slice(0, 3).map((ex) => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ex.imageEmoji || '💬'}</span>
                    <div>
                      <span className="text-sm font-black text-gray-800 block">
                        {ex.targetText || ex.correctAnswer}
                      </span>
                      {ex.nativeText && (
                        <span className="text-xs font-bold text-gray-400 block">
                          {ex.nativeText}
                        </span>
                      )}
                    </div>
                  </div>

                  {ex.targetText && (
                    <button
                      onClick={() => handlePronounce(ex.targetText!)}
                      className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 transition cursor-pointer"
                      title="Écouter la prononciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Rewards Preview */}
          <div className="flex items-center justify-around p-3 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500 text-white">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-900 block">
                  +{lesson.xpReward} XP
                </span>
                <span className="text-[10px] font-bold text-amber-700">Expérience</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500 text-white font-black text-sm">
                💎
              </div>
              <div>
                <span className="text-xs font-black text-cyan-900 block">+5 Gemmes</span>
                <span className="text-[10px] font-bold text-cyan-700">Boutique</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <button
            onClick={() => {
              soundManager.playPop();
              onStart();
            }}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-black text-base shadow-3d-green hover:bg-emerald-600 active:translate-y-1 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>{isCompleted ? 'Réviser la leçon' : 'Commencer la leçon'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
