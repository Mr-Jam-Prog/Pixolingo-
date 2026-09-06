import React, { useState } from 'react';
import { Exercise, UserProfile } from '../../types';
import { X, CheckCircle2, RotateCcw, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface MistakesReviewModalProps {
  mistakes: { exercise: Exercise; timestamp: number }[];
  onCorrectMistake: (exerciseId: string) => void;
  onClose: () => void;
}

export const MistakesReviewModal: React.FC<MistakesReviewModalProps> = ({
  mistakes,
  onCorrectMistake,
  onClose,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  if (mistakes.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 border-2 border-gray-200">
          <div className="text-5xl">🎉</div>
          <h2 className="text-xl font-extrabold text-gray-800">Cahier d'erreurs vide !</h2>
          <p className="text-sm text-gray-500 font-medium">
            Toutes tes erreurs passées ont été révisées avec succès. Continue comme ça !
          </p>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="w-full py-3 rounded-2xl font-extrabold text-white btn-3d-green transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  const currentItem = mistakes[currentIdx];
  const ex = currentItem.exercise;

  const handleValidate = () => {
    if (!selectedOption) return;
    const isCorrect = selectedOption.trim().toLowerCase() === (ex.correctAnswer as string).trim().toLowerCase();

    if (isCorrect) {
      soundManager.playSuccess();
      setIsResolved(true);
      setTimeout(() => {
        onCorrectMistake(ex.id);
        setIsResolved(false);
        setSelectedOption(null);
        if (currentIdx >= mistakes.length - 1) {
          setCurrentIdx(0);
        }
      }, 1000);
    } else {
      soundManager.playError();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full flex flex-col border-2 border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 border-b-2 border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🩹</span>
            <div>
              <h2 className="text-lg font-extrabold text-gray-800">Révision des Erreurs</h2>
              <p className="text-xs font-bold text-amber-600">
                Erreur {currentIdx + 1} sur {mistakes.length} • Gagne +1 Énergie par correction
              </p>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <div className="text-sm font-extrabold text-gray-500 uppercase tracking-wider">
              Question à réviser
            </div>
            <div className="text-lg font-extrabold text-gray-800">{ex.prompt}</div>
            {ex.targetText && (
              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 font-bold text-amber-900">
                {ex.targetText}
              </div>
            )}
          </div>

          {ex.options && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {ex.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    soundManager.playPop();
                    setSelectedOption(opt);
                  }}
                  className={`p-3.5 rounded-2xl border-2 font-bold text-sm text-left transition cursor-pointer active:translate-y-0.5 ${
                    selectedOption === opt
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {isResolved && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-800 font-extrabold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Bravo ! Erreur corrigée (+1 Cœur / Énergie récupéré)</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-gray-100 bg-gray-50 flex justify-end">
          <button
            disabled={!selectedOption || isResolved}
            onClick={handleValidate}
            className="px-6 py-3 rounded-2xl font-extrabold text-white btn-3d-green transition cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
          >
            Valider la correction
          </button>
        </div>
      </div>
    </div>
  );
};
