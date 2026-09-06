import React, { useState, useEffect, useRef } from 'react';
import { Lesson, Exercise, UserProfile, Course } from '../../types';
import {
  X,
  Volume2,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Wrench,
  RotateCcw,
  VolumeX,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundManager, speakTargetLanguage, speakInstruction } from '../../utils/sound';
import { validateAnswer } from '../../utils/answerValidator';
import {
  requestMicrophoneAccess,
  startAudioLevelMonitor,
  evaluatePronunciation,
  cleanTargetForSpeech,
} from '../../utils/speechRecognition';
import { MicrophoneTestModal } from '../modals/MicrophoneTestModal';

interface LessonEngineProps {
  lesson: Lesson;
  course: Course;
  userProfile: UserProfile;
  onFinish: (results: { xpGained: number; gemsGained: number; mistakes: Exercise[] }) => void;
  onClose: () => void;
  onLoseEnergy: () => void;
}

export const LessonEngine: React.FC<LessonEngineProps> = ({
  lesson,
  course,
  userProfile,
  onFinish,
  onClose,
  onLoseEnergy,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [selectedTokens, setSelectedTokens] = useState<string[]>([]);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'correct' | 'incorrect'>('idle');
  const [correctStreak, setCorrectStreak] = useState(0);
  const [mistakes, setMistakes] = useState<Exercise[]>([]);

  // Speech & Microphone practice states
  const [speechStatus, setSpeechStatus] = useState<
    'idle' | 'listening' | 'evaluating' | 'success' | 'retry' | 'error'
  >('idle');
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [speechScore, setSpeechScore] = useState<number | null>(null);
  const [speechFeedback, setSpeechFeedback] = useState<string | null>(null);
  const [speechErrorMessage, setSpeechErrorMessage] = useState<string | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [isMicDiagOpen, setIsMicDiagOpen] = useState(false);
  const [skippedSpeaking, setSkippedSpeaking] = useState(false);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const stopAudioMonitorRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const latestAlternativesRef = useRef<string[]>([]);

  const stopCurrentMicSession = () => {
    if (stopAudioMonitorRef.current) {
      stopAudioMonitorRef.current();
      stopAudioMonitorRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setMicVolume(0);
  };

  useEffect(() => {
    stopCurrentMicSession();
    setSpeechStatus('idle');
    setSpeechTranscript('');
    setSpeechScore(null);
    setSpeechFeedback(null);
    setSpeechErrorMessage(null);
    setMicVolume(0);
    setSkippedSpeaking(false);
    latestTranscriptRef.current = '';
    latestAlternativesRef.current = [];
  }, [currentIdx]);

  useEffect(() => {
    return () => {
      stopCurrentMicSession();
    };
  }, []);

  const evaluateSpeechInput = (transcript: string, alternatives: string[] = []) => {
    const rawExpected =
      currentExercise.audioPrompt ||
      (Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer.join(' ')
        : currentExercise.correctAnswer) ||
      currentExercise.targetText ||
      '';
    const cleanExpected = cleanTargetForSpeech(rawExpected);

    const evalRes = evaluatePronunciation(transcript, cleanExpected, {
      alternatives,
      isEarlyLearner: !!currentExercise.isEarlyLearner,
    });

    setSpeechScore(evalRes.score);
    setSpeechFeedback(evalRes.feedback);
    setSpeechTranscript(evalRes.transcript || transcript);

    if (evalRes.isMatch) {
      setSpeechStatus('success');
      soundManager.playSuccess();
      stopCurrentMicSession();
    } else {
      setSpeechStatus('retry');
      soundManager.playWrong();
      stopCurrentMicSession();
    }
  };

  const handleStartSpeaking = async () => {
    soundManager.playPop();
    stopCurrentMicSession();
    setSpeechStatus('listening');
    setSpeechErrorMessage(null);
    setSpeechTranscript('');
    setSpeechScore(null);
    setSpeechFeedback(null);
    latestTranscriptRef.current = '';
    latestAlternativesRef.current = [];

    // 1. Check browser speech recognition capability
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechStatus('error');
      setSpeechErrorMessage(
        "La reconnaissance vocale Web Speech n'est pas prise en charge sur ce navigateur. Vous pouvez utiliser Google Chrome, Microsoft Edge ou Safari, ou cliquer sur « Je ne peux pas parler pour l'instant » ci-dessous."
      );
      soundManager.playWrong();
      return;
    }

    // 2. Request hardware microphone stream
    const access = await requestMicrophoneAccess();
    if (!access.granted || !access.stream) {
      setSpeechStatus('error');
      setSpeechErrorMessage(access.error || 'Microphone non accessible.');
      soundManager.playWrong();
      return;
    }

    activeStreamRef.current = access.stream;

    // 3. Start live volume monitor (STRICTLY for visual wave animation - NEVER auto-validates)
    const stopMonitor = startAudioLevelMonitor(access.stream, (volume) => {
      setMicVolume(volume);
    });
    stopAudioMonitorRef.current = stopMonitor;

    // 4. Web Speech Recognition API with actual linguistic evaluation
    try {
      const rec = new SpeechRecognitionClass();
      rec.lang = course.bcp47;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 3;

      rec.onresult = (event: any) => {
        let finalStr = '';
        let interimStr = '';
        const alts: string[] = [];

        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            finalStr += res[0].transcript + ' ';
          } else {
            interimStr += res[0].transcript + ' ';
          }
          for (let a = 1; a < res.length; a++) {
            if (res[a]?.transcript) {
              alts.push(res[a].transcript);
            }
          }
        }

        const candidateText = (finalStr || interimStr).trim();
        if (candidateText) {
          latestTranscriptRef.current = candidateText;
          latestAlternativesRef.current = alts;
          setSpeechTranscript(candidateText);
        }

        const hasFinal = Array.from(event.results as any[]).some((r: any) => r.isFinal);
        if (hasFinal && candidateText) {
          evaluateSpeechInput(candidateText, alts);
        }
      };

      rec.onerror = (event: any) => {
        if (event.error === 'not-allowed') {
          setSpeechStatus('error');
          setSpeechErrorMessage('Permission de reconnaissance vocale refusée par le navigateur.');
          stopCurrentMicSession();
        } else if (event.error === 'no-speech') {
          if (!latestTranscriptRef.current) {
            setSpeechStatus('retry');
            setSpeechFeedback("Aucune parole claire détectée. Rapproche-toi du micro et réessaie.");
            soundManager.playWrong();
            stopCurrentMicSession();
          }
        }
      };

      rec.onend = () => {
        setSpeechStatus((prev) => {
          if (prev === 'listening') {
            if (latestTranscriptRef.current) {
              evaluateSpeechInput(latestTranscriptRef.current, latestAlternativesRef.current);
            } else {
              setSpeechFeedback("Aucune parole détectée. Répète la phrase à voix haute.");
              soundManager.playWrong();
              stopCurrentMicSession();
              return 'retry';
            }
          }
          return prev;
        });
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setSpeechStatus('error');
      setSpeechErrorMessage(err?.message || "Erreur d'initialisation de la reconnaissance vocale.");
      stopCurrentMicSession();
    }
  };

  const handleStopSpeakingManually = () => {
    if (latestTranscriptRef.current) {
      evaluateSpeechInput(latestTranscriptRef.current, latestAlternativesRef.current);
    } else {
      stopCurrentMicSession();
      setSpeechStatus('idle');
    }
  };

  const currentExercise = lesson.exercises[currentIdx];
  const progressPercent = Math.round(((currentIdx + (feedbackStatus !== 'idle' ? 1 : 0)) / lesson.exercises.length) * 100);

  const handlePlayAudio = (rate: number = 0.95) => {
    if (currentExercise.audioPrompt || currentExercise.targetText) {
      speakTargetLanguage(currentExercise.audioPrompt || currentExercise.targetText!, course.bcp47, rate);
    }
  };

  const handlePlaySlowAudio = () => {
    soundManager.playPop();
    const slowPrompt =
      currentExercise.slowAudioPrompt ||
      currentExercise.audioPrompt ||
      currentExercise.targetText ||
      (Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer.join(' ')
        : (currentExercise.correctAnswer as string));
    if (slowPrompt) {
      speakTargetLanguage(slowPrompt, course.bcp47, 0.65);
    }
  };

  useEffect(() => {
    if (currentExercise?.isEarlyLearner) {
      const timer = setTimeout(() => {
        speakInstruction(currentExercise.spokenPrompt || currentExercise.prompt);
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, currentExercise]);

  const handleCheckAnswer = () => {
    if (feedbackStatus !== 'idle') {
      // Move to next exercise or finish
      if (currentIdx + 1 < lesson.exercises.length) {
        setCurrentIdx((prev) => prev + 1);
        setSelectedOption(null);
        setSelectedTokens([]);
        setFeedbackStatus('idle');
      } else {
        // Complete lesson
        soundManager.playLevelUp();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
        const isBoosted = userProfile.activeBoostUntil && userProfile.activeBoostUntil > Date.now();
        const baseXP = lesson.xpReward;
        const finalXP = isBoosted ? baseXP * 2 : baseXP;
        const gemsGained = mistakes.length === 0 ? 15 : 5;

        onFinish({
          xpGained: finalXP,
          gemsGained,
          mistakes,
        });
      }
      return;
    }

    let isCorrect = false;

    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
      const res = validateAnswer(selectedOption || '', currentExercise.correctAnswer as string);
      isCorrect = res.isCorrect;
    } else if (currentExercise.type === 'translation') {
      const constructed = selectedTokens.join(' ');
      const expected = Array.isArray(currentExercise.correctAnswer)
        ? currentExercise.correctAnswer.join(' ')
        : (currentExercise.correctAnswer as string);
      const res = validateAnswer(constructed, expected);
      isCorrect = res.isCorrect;
    } else if (currentExercise.type === 'listen_repeat') {
      isCorrect = speechStatus === 'success' || skippedSpeaking;
    }

    if (isCorrect) {
      const nextStreak = correctStreak + 1;
      setCorrectStreak(nextStreak);

      if (nextStreak >= 3 && nextStreak % 3 === 0) {
        soundManager.playCombo(nextStreak);
        confetti({
          particleCount: 35,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#ff9600', '#58cc02', '#1cb0f6', '#ffc800'],
        });
      } else {
        soundManager.playSuccess(nextStreak);
      }
      setFeedbackStatus('correct');
    } else {
      soundManager.playError();
      setFeedbackStatus('incorrect');
      setCorrectStreak(0);
      setMistakes((prev) => [...prev, currentExercise]);
      if (!currentExercise.isEarlyLearner) {
        onLoseEnergy();
      }
    }
  };

  const isAnswerReady = () => {
    if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
      return selectedOption !== null;
    }
    if (currentExercise.type === 'translation') {
      return selectedTokens.length > 0;
    }
    if (currentExercise.type === 'listen_repeat') {
      return speechStatus === 'success' || skippedSpeaking;
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between select-none">
      {/* Top Navigation & Progress Bar */}
      <div className="px-4 py-3 border-b-2 border-gray-100 flex items-center justify-between gap-4 max-w-2xl mx-auto w-full">
        <button
          onClick={() => {
            soundManager.playPop();
            onClose();
          }}
          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-xl transition cursor-pointer"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Progress bar */}
        <div className="flex-1 bg-gray-200 h-3.5 rounded-full overflow-hidden relative">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Energy hearts */}
        <div className="flex items-center gap-1 text-emerald-600 font-extrabold text-sm">
          <Zap className="w-5 h-5 fill-emerald-500 text-emerald-500" />
          <span>{userProfile.energy}</span>
        </div>
      </div>

      {/* Main Exercise Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 max-w-xl mx-auto w-full flex flex-col justify-center">
        <div className="space-y-6">
          {/* Prompt header */}
          <div className="space-y-3">
            {currentExercise.isEarlyLearner && (
              <div className="flex items-center justify-between bg-amber-50 border-2 border-amber-200 px-3.5 py-2.5 rounded-2xl shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🧸</span>
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wide">
                    Éveil 3–6 ans • Zéro Écrit
                  </span>
                </div>
                <button
                  onClick={() => {
                    soundManager.playPop();
                    speakInstruction(currentExercise.spokenPrompt || currentExercise.prompt);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs transition cursor-pointer"
                  title="Écouter la consigne"
                >
                  <Volume2 className="w-4 h-4 animate-pulse" />
                  <span>Écouter 🔊</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-800">
                {currentExercise.prompt}
              </h2>
              {currentExercise.isEarlyLearner && (
                <button
                  onClick={() => {
                    soundManager.playPop();
                    speakInstruction(currentExercise.spokenPrompt || currentExercise.prompt);
                  }}
                  className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 transition cursor-pointer shrink-0"
                  title="Réécouter la consigne"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Exercise challenge card - NEVER leak the answer before submitting */}
            {(() => {
              // 1. Listen & Repeat: Show target phrase with audio for oral practice
              if (currentExercise.type === 'listen_repeat') {
                return (
                  <div className="p-4 bg-sky-50/80 border-2 border-sky-200 rounded-3xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePlayAudio(0.95)}
                        className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-3d-blue hover:brightness-105 active:translate-y-1 transition cursor-pointer shrink-0"
                        title="Écouter"
                      >
                        <Volume2 className="w-6 h-6" />
                      </button>
                      <div>
                        <div className="text-lg sm:text-xl font-extrabold text-sky-950 flex items-center gap-2">
                          <span>{currentExercise.targetText}</span>
                          {currentExercise.imageEmoji && <span>{currentExercise.imageEmoji}</span>}
                        </div>
                        {currentExercise.nativeText && (
                          <div className="text-xs font-bold text-sky-700">
                            🇫🇷 {currentExercise.nativeText}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handlePlaySlowAudio}
                        className="px-2.5 py-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs transition cursor-pointer flex items-center gap-1 shadow-xs"
                        title="Écouter au ralenti (Mode Escargot)"
                      >
                        <span>🐌</span>
                        <span>Lent</span>
                      </button>
                    </div>
                  </div>
                );
              }

              // 2. Translation: Show ONLY the source sentence to translate (never the target answer)
              if (currentExercise.type === 'translation') {
                // Expected answer: usually words in target language
                const expectedStr = Array.isArray(currentExercise.correctAnswer)
                  ? currentExercise.correctAnswer.join(' ')
                  : currentExercise.correctAnswer;
                const isTranslatingToTarget =
                  currentExercise.targetText &&
                  expectedStr.toLowerCase().replace(/[¡!¿?.,]/g, '').trim() ===
                    currentExercise.targetText.toLowerCase().replace(/[¡!¿?.,]/g, '').trim();

                if (isTranslatingToTarget || currentExercise.nativeText) {
                  return (
                    <div className="p-4 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xl shrink-0 shadow-xs">
                        {currentExercise.imageEmoji || '🇫🇷'}
                      </div>
                      <div className="flex-1">
                        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                          Traduire en langue cible
                        </span>
                        <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                          {currentExercise.nativeText || currentExercise.prompt}
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  // Translating from target language to French
                  return (
                    <div className="p-4 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayAudio(0.95)}
                          className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-3d-green hover:brightness-105 active:translate-y-1 transition cursor-pointer shrink-0"
                          title="Écouter"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                        <div>
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                            Phrase à comprendre
                          </span>
                          <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                            {currentExercise.targetText}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              // 3. Multiple Choice & Fill Blank
              if (currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') {
                const answerStr = String(currentExercise.correctAnswer).toLowerCase().trim();
                const targetStr = (currentExercise.targetText || '').toLowerCase().trim();
                const isTargetAnswer =
                  targetStr === answerStr ||
                  targetStr.includes(answerStr) ||
                  answerStr.includes(targetStr);

                if (isTargetAnswer) {
                  // Answer is in target language -> Only show nativeText or visual prompt, NEVER targetText!
                  if (currentExercise.nativeText) {
                    return (
                      <div className="p-4 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xl shrink-0">
                          {currentExercise.imageEmoji || '💬'}
                        </div>
                        <div className="flex-1">
                          <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700 block">
                            Sens en français
                          </span>
                          <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                            {currentExercise.nativeText}
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                } else {
                  // Target phrase is given to translate into French -> Show targetText with audio button
                  return (
                    <div className="p-4 bg-emerald-50/80 border-2 border-emerald-200 rounded-3xl flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handlePlayAudio(0.95)}
                          className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-3d-green hover:brightness-105 active:translate-y-1 transition cursor-pointer shrink-0"
                          title="Écouter"
                        >
                          <Volume2 className="w-6 h-6" />
                        </button>
                        <div className="text-lg sm:text-xl font-extrabold text-gray-900">
                          <span>{currentExercise.targetText}</span>
                          {currentExercise.imageEmoji && (
                            <span className="ml-2">{currentExercise.imageEmoji}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }
              }

              return null;
            })()}
          </div>

          {/* Exercise Types Rendering */}
          {/* 1. Multiple Choice / Fill Blank */}
          {(currentExercise.type === 'multiple_choice' || currentExercise.type === 'fill_blank') && (
            <div
              className={
                currentExercise.isEarlyLearner
                  ? 'grid grid-cols-1 sm:grid-cols-3 gap-4'
                  : 'grid grid-cols-1 sm:grid-cols-2 gap-3'
              }
            >
              {currentExercise.options?.map((opt, idx) => {
                const optData = currentExercise.optionsData?.[idx];
                const isSelected = selectedOption === opt;
                const emojiMatch = opt.match(/[\u{1F300}-\u{1FAFF}]/u);
                const emoji = optData?.emoji || (emojiMatch ? emojiMatch[0] : null);
                const cleanText = opt.replace(/[\u{1F300}-\u{1FAFF}]/gu, '').trim();
                const audioToSpeak = optData?.audioPrompt || cleanText;

                if (currentExercise.isEarlyLearner) {
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedOption(opt);
                        if (audioToSpeak) {
                          speakTargetLanguage(audioToSpeak, course.bcp47, 0.9);
                        }
                      }}
                      className={`relative flex flex-col items-center justify-between p-5 rounded-3xl border-3 transition-all duration-200 cursor-pointer select-none active:scale-95 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-3d-green ring-4 ring-emerald-200'
                          : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/20 shadow-3d-gray'
                      }`}
                    >
                      {/* Individual Audio Preview Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          soundManager.playPop();
                          if (audioToSpeak) {
                            speakTargetLanguage(audioToSpeak, course.bcp47, 0.9);
                          }
                        }}
                        className="self-end p-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition cursor-pointer"
                        title="Écouter ce mot"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>

                      {/* Giant Tactile Emoji */}
                      <div className="text-6xl sm:text-7xl my-2 transform hover:scale-110 transition-transform">
                        {emoji || '🌟'}
                      </div>

                      {/* Word Label */}
                      <div className="text-center font-black text-lg sm:text-xl text-gray-800 mt-2">
                        {cleanText}
                      </div>

                      {optData?.phonetic && (
                        <div className="text-xs font-bold text-gray-400 mt-0.5">
                          /{optData.phonetic}/
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={idx}
                    disabled={feedbackStatus !== 'idle'}
                    onClick={() => {
                      soundManager.playPop();
                      setSelectedOption(opt);
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-base sm:text-lg text-left transition cursor-pointer shadow-3d-gray active:translate-y-1 ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-300'
                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* 2. Translation with word bank */}
          {currentExercise.type === 'translation' && (
            <div className="space-y-4">
              {/* Output sentence box */}
              <div className="min-h-[64px] p-3 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-wrap gap-2 items-center">
                {selectedTokens.length === 0 ? (
                  <span className="text-gray-400 font-bold text-sm">
                    Clique sur les mots ci-dessous pour former la phrase...
                  </span>
                ) : (
                  selectedTokens.map((token, idx) => (
                    <button
                      key={idx}
                      disabled={feedbackStatus !== 'idle'}
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedTokens((prev) => prev.filter((_, i) => i !== idx));
                      }}
                      className="px-3 py-1.5 bg-white border-2 border-emerald-400 rounded-xl font-extrabold text-sm text-emerald-800 shadow-xs active:translate-y-0.5 cursor-pointer"
                    >
                      {token}
                    </button>
                  ))
                )}
              </div>

              {/* Word bank */}
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {currentExercise.options?.map((token, idx) => {
                  const usedCount = selectedTokens.filter((t) => t === token).length;
                  const available = usedCount === 0; // single use or multi
                  return (
                    <button
                      key={idx}
                      disabled={feedbackStatus !== 'idle' || !available}
                      onClick={() => {
                        soundManager.playPop();
                        setSelectedTokens((prev) => [...prev, token]);
                      }}
                      className={`px-3.5 py-2 rounded-xl font-extrabold text-sm border-2 transition cursor-pointer shadow-3d-gray active:translate-y-1 ${
                        available
                          ? 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                          : 'bg-gray-100 border-gray-200 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      {token}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Listen & Repeat (Speech practice with real microphone & audio meter) */}
          {currentExercise.type === 'listen_repeat' && (
            <div className="p-6 bg-gradient-to-b from-sky-50 to-blue-50 border-2 border-sky-200 rounded-3xl text-center space-y-4 shadow-xs">
              <div className="flex items-center justify-between px-2">
                <span className="text-xs font-black uppercase tracking-wider text-sky-800">
                  🎙️ Pratique de prononciation
                </span>
                <button
                  onClick={() => setIsMicDiagOpen(true)}
                  className="flex items-center gap-1 text-[11px] font-bold text-sky-700 hover:text-sky-900 bg-white/80 border border-sky-200 px-2.5 py-1 rounded-xl cursor-pointer"
                  title="Vérifier le micro"
                >
                  <Wrench className="w-3 h-3" />
                  <span>Tester le micro</span>
                </button>
              </div>

              {/* Expected text card */}
              <div className="p-4 bg-white rounded-2xl border border-sky-200 shadow-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayAudio(0.9)}
                    className="w-11 h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center shadow-3d-blue active:translate-y-0.5 transition cursor-pointer shrink-0"
                    title="Écouter le modèle"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                  <div className="text-left">
                    <div className="text-lg font-black text-gray-900">
                      {currentExercise.targetText}
                    </div>
                    {currentExercise.nativeText && (
                      <div className="text-xs font-bold text-gray-500">
                        {currentExercise.nativeText}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Big Interactive Mic Button */}
              <div className="py-2">
                <button
                  disabled={speechStatus === 'success'}
                  onClick={speechStatus === 'listening' ? handleStopSpeakingManually : handleStartSpeaking}
                  className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-lg active:scale-95 ${
                    speechStatus === 'listening'
                      ? 'bg-rose-500 text-white shadow-3d-rose animate-pulse ring-4 ring-rose-200'
                      : speechStatus === 'success'
                      ? 'bg-emerald-500 text-white shadow-3d-green'
                      : speechStatus === 'retry'
                      ? 'bg-amber-500 text-white shadow-3d-amber hover:brightness-105'
                      : 'bg-sky-500 text-white shadow-3d-blue hover:brightness-105'
                  }`}
                >
                  {speechStatus === 'listening' ? (
                    <Mic className="w-10 h-10 animate-bounce" />
                  ) : speechStatus === 'success' ? (
                    <CheckCircle2 className="w-10 h-10" />
                  ) : speechStatus === 'retry' ? (
                    <RotateCcw className="w-10 h-10" />
                  ) : (
                    <Mic className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Real-time volume waveform animation when listening */}
              {speechStatus === 'listening' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-1 h-8 bg-sky-100/60 rounded-xl px-4 max-w-xs mx-auto border border-sky-200">
                    {[20, 40, 70, 100, 60, 30, 80, 90, 50, 30].map((h, i) => {
                      const barH = Math.max(4, Math.round((micVolume / 100) * h * 0.28));
                      return (
                        <div
                          key={i}
                          className="w-1.5 bg-sky-600 rounded-full transition-all duration-75"
                          style={{ height: `${barH}px` }}
                        />
                      );
                    })}
                  </div>
                  <div className="text-xs font-black text-sky-800">
                    🎙️ Parlez maintenant... {speechTranscript && <span className="bg-sky-200/60 px-2 py-0.5 rounded-lg text-sky-950">« {speechTranscript} »</span>}
                  </div>
                  <div className="text-[11px] text-sky-600 font-semibold">
                    Cliquez sur le micro rouge pour valider dès que vous avez fini de parler
                  </div>
                </div>
              )}

              {/* Status & Feedback Pills */}
              {speechStatus === 'idle' && (
                <div className="text-xs font-bold text-sky-700">
                  Appuie sur le micro et répète la phrase à voix haute
                </div>
              )}

              {speechStatus === 'success' && (
                <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 font-extrabold text-xs space-y-1">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Prononciation validée avec succès {speechScore !== null ? `(${speechScore}%)` : ''} !
                    </span>
                  </div>
                  {speechTranscript && (
                    <div className="text-[11px] text-emerald-800 font-semibold">
                      Entendu : « {speechTranscript} »
                    </div>
                  )}
                  {speechFeedback && (
                    <div className="text-[11px] text-emerald-700 font-medium">
                      {speechFeedback}
                    </div>
                  )}
                </div>
              )}

              {speechStatus === 'retry' && (
                <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl text-amber-900 text-xs space-y-2 text-left">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-extrabold flex items-center gap-1.5 text-amber-900">
                      <span>⚠️ Prononciation non reconnue</span>
                      {speechScore !== null && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-200 text-amber-900 font-black">
                          {speechScore}%
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handlePlayAudio(0.85)}
                      className="px-2 py-1 bg-white hover:bg-amber-100 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                      title="Réécouter le modèle"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Réécouter</span>
                    </button>
                  </div>
                  {speechTranscript ? (
                    <div className="text-[11px] text-amber-900 bg-white/80 p-2 rounded-xl border border-amber-200">
                      <span className="font-bold text-gray-600">Entendu : </span>
                      <span className="italic font-bold text-rose-600">« {speechTranscript} »</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-amber-800">
                      Aucune parole distincte reconnue.
                    </div>
                  )}
                  {speechFeedback && (
                    <div className="text-[11px] text-amber-800 font-medium">
                      💡 {speechFeedback}
                    </div>
                  )}
                  <div className="text-[11px] text-amber-700 text-center font-bold pt-0.5">
                    Clique sur le bouton orange pour réessayer l'exercice.
                  </div>
                </div>
              )}

              {speechStatus === 'error' && (
                <div className="p-3 bg-rose-50 border border-rose-300 rounded-2xl text-rose-900 text-xs text-left space-y-2">
                  <div className="flex items-center gap-1.5 font-black text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Problème de microphone détecté</span>
                  </div>
                  <p className="text-[11px] text-rose-700 font-medium">
                    {speechErrorMessage || "Vérifiez que votre navigateur a l'autorisation d'accéder au micro."}
                  </p>
                  <button
                    onClick={() => setIsMicDiagOpen(true)}
                    className="flex items-center gap-1 text-xs font-black text-emerald-700 underline cursor-pointer"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Lancer le diagnostic et voir les solutions</span>
                  </button>
                </div>
              )}

              {/* Skip option (Duolingo pattern: "Je ne peux pas parler pour l'instant") */}
              {!skippedSpeaking && speechStatus !== 'success' && (
                <div className="pt-2 border-t border-sky-200/60">
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      setSkippedSpeaking(true);
                    }}
                    className="text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
                  >
                    Je ne peux pas parler pour l'instant
                  </button>
                </div>
              )}

              {skippedSpeaking && (
                <div className="text-xs font-bold text-amber-700 bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200 inline-block">
                  Exercice vocal ignoré pour cette session. Clique sur « Vérifier » pour continuer.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Footer with Feedback Panel */}
      <div
        className={`p-4 border-t-2 transition-all duration-200 ${
          feedbackStatus === 'correct'
            ? 'bg-emerald-100 border-emerald-300'
            : feedbackStatus === 'incorrect'
            ? 'bg-rose-100 border-rose-300'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
          {/* Feedback details */}
          <div className="flex-1 space-y-1">
            {feedbackStatus === 'correct' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                  <span>Excellent ! {correctStreak > 1 && `🔥 Combo x${correctStreak}`}</span>
                </div>
                {currentExercise.targetText && (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 bg-white/70 px-2.5 py-1 rounded-xl w-fit">
                    <button
                      onClick={() => handlePlayAudio(0.95)}
                      className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                      title="Écouter la prononciation"
                    >
                      <Volume2 className="w-4 h-4 inline" />
                    </button>
                    <span>{currentExercise.targetText}</span>
                    {currentExercise.nativeText && (
                      <span className="text-emerald-700 font-semibold">• 🇫🇷 {currentExercise.nativeText}</span>
                    )}
                  </div>
                )}
                {currentExercise.explanation && (
                  <p className="text-xs text-emerald-800 font-medium">
                    💡 {currentExercise.explanation}
                  </p>
                )}
              </div>
            )}
            {feedbackStatus === 'incorrect' && (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-rose-800 font-extrabold text-base">
                  <AlertCircle className="w-6 h-6 text-rose-600 shrink-0" />
                  <span>
                    {currentExercise.isEarlyLearner ? 'Presque ! Écoute bien le modèle 👂' : 'Pas tout à fait...'}
                  </span>
                </div>
                <div className="text-xs font-extrabold text-rose-700 flex items-center gap-2">
                  <span>{currentExercise.isEarlyLearner ? 'C’était :' : 'Bonne réponse :'}</span>
                  <span className="font-black text-sm text-gray-900">
                    {Array.isArray(currentExercise.correctAnswer) ? currentExercise.correctAnswer.join(' ') : currentExercise.correctAnswer}
                  </span>
                  {currentExercise.imageEmoji && (
                    <span className="text-xl">{currentExercise.imageEmoji}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    onClick={() => {
                      soundManager.playPop();
                      const toSpeak = currentExercise.targetText || (Array.isArray(currentExercise.correctAnswer) ? currentExercise.correctAnswer.join(' ') : currentExercise.correctAnswer);
                      speakTargetLanguage(toSpeak as string, course.bcp47, 0.9);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/90 border border-rose-300 text-rose-800 hover:bg-white text-xs font-black cursor-pointer shadow-xs"
                    title="Écouter la prononciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Écouter 🔊</span>
                  </button>
                  <button
                    onClick={handlePlaySlowAudio}
                    className="flex items-center gap-1 px-2 py-1 rounded-xl bg-amber-100/90 border border-amber-300 text-amber-900 hover:bg-amber-100 text-xs font-black cursor-pointer shadow-xs"
                    title="Écouter lentement (Mode Escargot)"
                  >
                    <span>🐌</span>
                    <span>Lent</span>
                  </button>
                </div>
                {currentExercise.explanation && (
                  <p className="text-xs text-rose-800 font-medium">
                    💡 {currentExercise.explanation}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Action button */}
          <button
            disabled={!isAnswerReady()}
            onClick={handleCheckAnswer}
            className={`px-6 py-3 rounded-2xl font-extrabold text-base transition cursor-pointer active:translate-y-1 ${
              feedbackStatus === 'correct'
                ? 'btn-3d-green text-white'
                : feedbackStatus === 'incorrect'
                ? 'btn-3d-red text-white'
                : isAnswerReady()
                ? 'btn-3d-green text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {feedbackStatus === 'idle' ? 'Vérifier' : 'Continuer'}
          </button>
        </div>
      </div>

      {/* Microphone Diagnostics Modal */}
      {isMicDiagOpen && (
        <MicrophoneTestModal
          currentLanguage={course.language}
          onClose={() => setIsMicDiagOpen(false)}
        />
      )}
    </div>
  );
};
