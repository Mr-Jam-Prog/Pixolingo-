import React, { useState } from 'react';
import { Unit, Lesson, LanguageCode } from '../../types';
import { X, Sparkles, Wand2, Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface StudioModalProps {
  currentLanguage: LanguageCode;
  onAddCustomLesson: (lesson: Lesson) => void;
  onClose: () => void;
}

export const StudioModal: React.FC<StudioModalProps> = ({
  currentLanguage,
  onAddCustomLesson,
  onClose,
}) => {
  const [topic, setTopic] = useState('');
  const [targetAge, setTargetAge] = useState<'kids' | 'teens' | 'adults'>('kids');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);

  const handleGenerate = () => {
    if (!topic.trim()) return;
    setIsGenerating(true);
    soundManager.playPop();

    // Procedural deterministic lesson generator fallback
    setTimeout(() => {
      const newLesson: Lesson = {
        id: `custom-lesson-${Date.now()}`,
        title: topic.trim(),
        description: `Leçon personnalisée créée avec l'IA (${topic.trim()})`,
        xpReward: 30,
        exercises: [
          {
            id: `c-ex-1-${Date.now()}`,
            type: 'multiple_choice',
            prompt: `Quel est le mot principal associé à "${topic}" ?`,
            targetText: topic.trim(),
            nativeText: topic.trim(),
            options: [topic.trim(), 'El gato', 'La casa', 'El agua'],
            correctAnswer: topic.trim(),
            audioPrompt: topic.trim(),
            imageEmoji: '🌟',
          },
          {
            id: `c-ex-2-${Date.now()}`,
            type: 'translation',
            prompt: 'Traduis cette phrase thématique :',
            targetText: `Me gusta ${topic.toLowerCase()}`,
            nativeText: `J'aime ${topic.toLowerCase()}`,
            options: ['Me', 'gusta', topic.toLowerCase(), 'mucho', 'no'],
            correctAnswer: ['Me', 'gusta', topic.toLowerCase()],
            audioPrompt: `Me gusta ${topic.toLowerCase()}`,
            imageEmoji: '✨',
          },
          {
            id: `c-ex-3-${Date.now()}`,
            type: 'listen_repeat',
            prompt: 'Répète à haute voix avec la bonne prononciation :',
            targetText: `¡Excelente ${topic.toLowerCase()}!`,
            nativeText: `Excellent(e) ${topic.toLowerCase()} !`,
            correctAnswer: `excelente ${topic.toLowerCase()}`,
            audioPrompt: `¡Excelente ${topic.toLowerCase()}!`,
            imageEmoji: '🎙️',
          },
        ],
      };

      setGeneratedLesson(newLesson);
      setIsGenerating(false);
      soundManager.playSuccess();
    }, 1500);
  };

  const handleAddAndPlay = () => {
    if (generatedLesson) {
      soundManager.playLevelUp();
      onAddCustomLesson(generatedLesson);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col border-2 border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-gray-800">Studio Pédagogique IA</h2>
              <p className="text-xs text-gray-500 font-bold">Génère un programme sur mesure à partir d'un sujet ou d'un devoir</p>
            </div>
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

        {/* Body */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[70vh]">
          {!generatedLesson ? (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Sujet, Notion ou Devoir scolaire
                </label>
                <input
                  type="text"
                  placeholder="Ex : Les animaux de la forêt, Commander au restaurant, Le passé composé..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 focus:border-purple-500 rounded-2xl font-bold text-sm text-gray-800 outline-none transition"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  Public Cible
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'kids', label: 'Enfants 🧒', desc: 'Ludique' },
                    { id: 'teens', label: 'Collège / Lycée 🎒', desc: 'Devoirs' },
                    { id: 'adults', label: 'Adultes ✈️', desc: 'Pratique' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setTargetAge(p.id as any)}
                      className={`p-2.5 rounded-2xl border-2 font-bold text-xs text-center transition cursor-pointer ${
                        targetAge === p.id
                          ? 'border-purple-500 bg-purple-50 text-purple-800'
                          : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <div>{p.label}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!topic.trim() || isGenerating}
                onClick={handleGenerate}
                className="w-full py-3.5 rounded-2xl font-black text-sm text-white btn-3d-purple transition cursor-pointer flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création du programme par l'IA...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Générer l'Unité Interactive</span>
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-800">{generatedLesson.title}</h3>
                <p className="text-xs text-gray-500 font-medium">{generatedLesson.description}</p>
                <div className="mt-2 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl inline-block border border-emerald-200">
                  ✓ {generatedLesson.exercises.length} Exercices interactifs générés (+{generatedLesson.xpReward} XP)
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => setGeneratedLesson(null)}
                  className="flex-1 py-3 rounded-2xl font-black text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
                >
                  Nouveau sujet
                </button>
                <button
                  onClick={handleAddAndPlay}
                  className="flex-1 py-3 rounded-2xl font-black text-xs text-white btn-3d-green transition"
                >
                  Ajouter au Parcours 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
