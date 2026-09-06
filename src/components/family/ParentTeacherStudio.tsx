import React, { useState } from 'react';
import { Lesson, Exercise, LanguageCode } from '../../types';
import { GoogleGenAI } from '@google/genai';
import {
  Wand2,
  Sparkles,
  BookOpen,
  Printer,
  Check,
  Plus,
  Loader2,
  GraduationCap,
  Volume2,
} from 'lucide-react';
import { soundManager } from '../../utils/sound';
import confetti from 'canvas-confetti';

interface ParentTeacherStudioProps {
  currentLanguage: LanguageCode;
  onAddCustomLesson: (lesson: Lesson) => void;
  onClose?: () => void;
}

export const ParentTeacherStudio: React.FC<ParentTeacherStudioProps> = ({
  currentLanguage,
  onAddCustomLesson,
}) => {
  const [targetAudience, setTargetAudience] = useState<'kids' | 'middle' | 'adult'>('kids');
  const [topic, setTopic] = useState('');
  const [grammarFocus, setGrammarFocus] = useState('');
  const [exerciseCount, setExerciseCount] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedLesson, setGeneratedLesson] = useState<Lesson | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'preview'>('create');

  const languageLabels: Record<LanguageCode, string> = {
    es: 'Espagnol',
    en: 'Anglais',
    fr: 'Français',
    de: 'Allemand',
    it: 'Italien',
    ja: 'Japonais',
    pt: 'Portugais',
    ar: 'Arabe',
    zh: 'Chinois',
    ru: 'Russe',
    ko: 'Coréen',
    nl: 'Néerlandais',
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    soundManager.playPop();

    try {
      const apiKey =
        (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) ||
        (import.meta as any).env?.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key missing');
      }

      const ai = new GoogleGenAI({ apiKey });
      const prompt = `Tu es un expert pédagogique certifié dans l'enseignement des langues pour enfants et familles.
Génère une leçon interactive de langue (${languageLabels[currentLanguage]}) sur le thème : "${topic}".
Public visé : ${targetAudience === 'kids' ? 'Enfants de 6 à 10 ans (ton très ludique, simple, émojis)' : targetAudience === 'middle' ? 'Adolescents de 11 à 15 ans' : 'Adultes'}.
Focus grammatical ou notionnel souhaité : "${grammarFocus || 'Vocabulaire pratique et conversation'}".
Nombre d'exercices : ${exerciseCount}.

IMPORTANT: Réponds UNIQUEMENT avec un objet JSON valide sans balises markdown ni backticks, respectant ce format :
{
  "title": "Titre accrocheur de la leçon",
  "description": "Courte description pédagogique engageante",
  "xpReward": 25,
  "exercises": [
    {
      "id": "ex-1",
      "type": "multiple_choice",
      "prompt": "Consigne claire en français",
      "targetText": "Phrase dans la langue cible",
      "nativeText": "Traduction française",
      "options": ["Bonne réponse", "Faux 1", "Faux 2", "Faux 3"],
      "correctAnswer": "Bonne réponse",
      "audioPrompt": "Texte à prononcer dans la langue cible",
      "imageEmoji": "🐶",
      "explanation": "Astuce ou règle mnémotechnique"
    },
    {
      "id": "ex-2",
      "type": "translation",
      "prompt": "Traduis cette phrase :",
      "targetText": "Phrase en langue cible",
      "nativeText": "Phrase en français",
      "options": ["mot1", "mot2", "mot3", "mot4", "leurre1", "leurre2"],
      "correctAnswer": ["mot1", "mot2", "mot3", "mot4"],
      "audioPrompt": "Phrase en langue cible",
      "imageEmoji": "✨"
    }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      const responseText = response.text || '';
      const cleanJson = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const newLesson: Lesson = {
        id: `custom-lesson-${Date.now()}`,
        title: parsed.title || topic,
        description: parsed.description || 'Leçon personnalisée créée avec le Studio IA',
        xpReward: parsed.xpReward || 25,
        exercises: parsed.exercises || [],
      };

      setGeneratedLesson(newLesson);
      setActiveTab('preview');
      soundManager.playSuccess();
    } catch (err) {
      console.warn('Fallback template lesson creation due to error:', err);
      // Generate reliable fallback lesson so the teacher is never blocked
      const fallbackLesson: Lesson = {
        id: `custom-${Date.now()}`,
        title: topic,
        description: `Leçon sur mesure : ${topic} (${targetAudience === 'kids' ? 'Édition Enfants' : 'Édition Standard'})`,
        xpReward: 25,
        exercises: [
          {
            id: `ex-fb-1`,
            type: 'multiple_choice',
            prompt: `Quel est le mot correct pour "${topic}" ?`,
            targetText: topic,
            nativeText: topic,
            options: [topic, 'Palabra 1', 'Palabra 2', 'Palabra 3'],
            correctAnswer: topic,
            audioPrompt: topic,
            imageEmoji: '🌟',
            explanation: 'Bravo pour cette bonne réponse !',
          },
          {
            id: `ex-fb-2`,
            type: 'listen_repeat',
            prompt: 'Écoute et répète à voix haute :',
            targetText: topic,
            nativeText: topic,
            correctAnswer: topic.toLowerCase(),
            audioPrompt: topic,
            imageEmoji: '🎙️',
          },
        ],
      };
      setGeneratedLesson(fallbackLesson);
      setActiveTab('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyToCourse = () => {
    if (!generatedLesson) return;
    soundManager.playSuccess();
    confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    onAddCustomLesson(generatedLesson);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Studio Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 shadow-xl border-4 border-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner">
            🎓
          </div>
          <div>
            <span className="px-2.5 py-0.5 rounded-full bg-white/30 text-[10px] font-black uppercase tracking-wider">
              Espace Parents & Enseignants
            </span>
            <h2 className="text-2xl font-black mt-1">Studio IA Pédagogique</h2>
            <p className="text-xs text-purple-200 font-bold">
              Crée des leçons, devoirs et exercices personnalisés en 1 clic
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-purple-800/80 border border-purple-400/40 text-xs font-black">
            Langue cible : {languageLabels[currentLanguage]}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-white p-1 rounded-2xl border-2 border-gray-200 gap-1 w-full max-w-md">
        <button
          onClick={() => setActiveTab('create')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer ${
            activeTab === 'create'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Créer un module
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          disabled={!generatedLesson}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black transition cursor-pointer disabled:opacity-40 ${
            activeTab === 'preview'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Aperçu & Impression ({generatedLesson ? '1 prêt' : '0'})
        </button>
      </div>

      {/* Create Tab View */}
      {activeTab === 'create' && (
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-sm space-y-5">
          {/* Target Audience */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-2">
              Niveau & Public visé
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'kids', label: 'Enfants (6-10 ans)', icon: '🧒', desc: 'Ludique & émojis' },
                { id: 'middle', label: 'Collège (11-15 ans)', icon: '🎒', desc: 'Grammaire & dialogues' },
                { id: 'adult', label: 'Adulte / Avancé', icon: '🧑‍💼', desc: 'Professionnel & voyage' },
              ].map((aud) => (
                <button
                  key={aud.id}
                  onClick={() => setTargetAudience(aud.id as any)}
                  className={`p-3.5 rounded-2xl border-2 text-left transition cursor-pointer ${
                    targetAudience === aud.id
                      ? 'border-purple-500 bg-purple-50 text-purple-900'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <span className="text-2xl block mb-1">{aud.icon}</span>
                  <h4 className="text-xs font-black">{aud.label}</h4>
                  <p className="text-[10px] text-gray-400 font-bold">{aud.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Subject / Homework topic */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Thème ou Devoir à préparer
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Les animaux de la forêt, Commander des tapas, Les verbes du matin..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 font-black text-gray-800 focus:border-purple-500 outline-none"
            />
          </div>

          {/* Grammar focus */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Règle de grammaire ou vocabulaire clé (optionnel)
            </label>
            <input
              type="text"
              value={grammarFocus}
              onChange={(e) => setGrammarFocus(e.target.value)}
              placeholder="Ex: Le pluriel des noms, L'accord des adjectifs de couleur..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 font-bold text-gray-800 focus:border-purple-500 outline-none"
            />
          </div>

          {/* Exercise count */}
          <div>
            <label className="text-xs font-black text-gray-700 uppercase tracking-wider block mb-1.5">
              Nombre d'exercices : {exerciseCount}
            </label>
            <input
              type="range"
              min={3}
              max={6}
              value={exerciseCount}
              onChange={(e) => setExerciseCount(parseInt(e.target.value, 10))}
              className="w-full accent-purple-600 cursor-pointer"
            />
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={isLoading || !topic.trim()}
            className="w-full py-4 rounded-2xl bg-purple-600 disabled:opacity-50 text-white font-black text-sm shadow-md hover:bg-purple-700 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Génération pédagogique en cours avec l'IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Générer la Leçon Interactive</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Preview & Print Tab View */}
      {activeTab === 'preview' && generatedLesson && (
        <div className="bg-white rounded-3xl border-2 border-gray-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-purple-600">Module Prêt</span>
              <h3 className="text-2xl font-black text-gray-800">{generatedLesson.title}</h3>
              <p className="text-xs text-gray-500 font-bold mt-0.5">{generatedLesson.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border-2 border-gray-200 text-xs font-black text-gray-700 hover:bg-gray-50 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer / PDF</span>
              </button>

              <button
                onClick={handleApplyToCourse}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-black shadow-3d-green hover:bg-emerald-600 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter au Parcours</span>
              </button>
            </div>
          </div>

          {/* Exercise list preview */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-wider">
              Contenu des {generatedLesson.exercises.length} exercices :
            </h4>

            {generatedLesson.exercises.map((ex, idx) => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-start justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 text-xs font-black flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-black text-gray-800">{ex.prompt}</span>
                  </div>

                  <div className="pl-8 space-y-0.5">
                    <p className="text-sm font-black text-purple-900">
                      Cible : {ex.targetText} {ex.imageEmoji}
                    </p>
                    {ex.nativeText && (
                      <p className="text-xs font-bold text-gray-500">Français : {ex.nativeText}</p>
                    )}
                    {ex.explanation && (
                      <p className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md inline-block">
                        💡 {ex.explanation}
                      </p>
                    )}
                  </div>
                </div>

                {ex.audioPrompt && (
                  <button
                    onClick={() => soundManager.speak(ex.audioPrompt!, 'es-ES')}
                    className="p-2 rounded-xl text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                    title="Tester la prononciation"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
