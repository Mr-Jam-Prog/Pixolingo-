import React, { useState, useEffect } from 'react';
import { generateMathChallenge, MathChallenge, getStoredParentPin } from '../../utils/kioskLock';
import { ShieldCheck, X, KeyRound, Calculator } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface ParentalLockModalProps {
  title?: string;
  description?: string;
  onSuccess: () => void;
  onClose: () => void;
}

export const ParentalLockModal: React.FC<ParentalLockModalProps> = ({
  title = 'Contrôle Parental',
  description = 'Pour accéder à cette section ou quitter le mode enfant, résous ce calcul ou entre ton code PIN :',
  onSuccess,
  onClose,
}) => {
  const [challenge, setChallenge] = useState<MathChallenge | null>(null);
  const [userInput, setUserInput] = useState('');
  const [mode, setMode] = useState<'math' | 'pin'>('math');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setChallenge(generateMathChallenge());
  }, []);

  const handleKeyClick = (val: string) => {
    soundManager.playPop();
    setErrorMsg(null);
    if (userInput.length < 6) {
      setUserInput((prev) => prev + val);
    }
  };

  const handleBackspace = () => {
    soundManager.playPop();
    setErrorMsg(null);
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleVerify = () => {
    if (mode === 'math' && challenge) {
      if (parseInt(userInput, 10) === challenge.answer) {
        soundManager.playSuccess();
        onSuccess();
      } else {
        soundManager.playWrong();
        setErrorMsg('Réponse incorrecte. Essaie à nouveau !');
        setUserInput('');
        setChallenge(generateMathChallenge());
      }
    } else if (mode === 'pin') {
      const stored = getStoredParentPin();
      if (userInput === stored || userInput === '1234') {
        soundManager.playSuccess();
        onSuccess();
      } else {
        soundManager.playWrong();
        setErrorMsg('Code PIN erroné (Par défaut : 1234)');
        setUserInput('');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border-4 border-emerald-100 p-6 flex flex-col items-center">
        {/* Top Icon */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner mb-3">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-black text-gray-800 text-center">{title}</h3>
        <p className="text-xs text-gray-500 text-center mt-1 mb-4 leading-relaxed">{description}</p>

        {/* Mode Switcher Buttons */}
        <div className="flex w-full bg-gray-100 p-1 rounded-2xl mb-4 text-xs font-black">
          <button
            onClick={() => {
              setMode('math');
              setUserInput('');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'math' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>Calcul adulte</span>
          </button>

          <button
            onClick={() => {
              setMode('pin');
              setUserInput('');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'pin' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Code PIN (1234)</span>
          </button>
        </div>

        {/* Challenge or PIN Display */}
        <div className="w-full bg-gray-50 border-2 border-gray-200 rounded-2xl p-4 text-center mb-4">
          {mode === 'math' && challenge && (
            <div className="text-lg font-black text-gray-800 tracking-wide">
              {challenge.questionText}
            </div>
          )}
          {mode === 'pin' && (
            <div className="text-xs font-bold text-gray-500">
              Entre ton code secret à 4 chiffres :
            </div>
          )}

          <div className="h-10 mt-2 flex items-center justify-center text-2xl font-black tracking-widest text-emerald-600">
            {mode === 'pin'
              ? '•'.repeat(userInput.length) || <span className="text-gray-300">_ _ _ _</span>
              : userInput || <span className="text-gray-300">?</span>}
          </div>
        </div>

        {errorMsg && (
          <p className="text-xs font-bold text-rose-500 mb-3 text-center">{errorMsg}</p>
        )}

        {/* Numpad */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
            <button
              key={key}
              onClick={() => {
                if (key === 'C') setUserInput('');
                else if (key === '⌫') handleBackspace();
                else handleKeyClick(key);
              }}
              className="py-3 rounded-2xl bg-white border-2 border-gray-200 text-gray-800 font-black text-base shadow-sm hover:bg-gray-50 active:scale-95 transition cursor-pointer"
            >
              {key}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-300 text-gray-600 font-black text-sm hover:bg-gray-100 transition cursor-pointer"
          >
            Fermer
          </button>
          <button
            onClick={handleVerify}
            disabled={!userInput}
            className="flex-1 py-3 rounded-2xl bg-emerald-500 disabled:opacity-50 text-white font-black text-sm shadow-3d-green hover:bg-emerald-600 transition cursor-pointer"
          >
            Valider
          </button>
        </div>
      </div>
    </div>
  );
};
