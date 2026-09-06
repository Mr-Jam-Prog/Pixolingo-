import { normalizeText, calculateLevenshteinDistance } from './answerValidator';

export interface MicrophoneSupportInfo {
  hasMediaDevices: boolean;
  hasAudioContext: boolean;
  hasSpeechRecognition: boolean;
  isIframe: boolean;
  browserName: string;
}

export interface PronunciationScore {
  score: number; // 0 - 100
  isMatch: boolean;
  feedback: string;
  transcript: string;
}

export function getMicrophoneSupportInfo(): MicrophoneSupportInfo {
  if (typeof window === 'undefined') {
    return {
      hasMediaDevices: false,
      hasAudioContext: false,
      hasSpeechRecognition: false,
      isIframe: false,
      browserName: 'Inconnu',
    };
  }

  const isIframe = window.self !== window.top;
  const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  const hasAudioContext = !!(window.AudioContext || (window as unknown as { webkitAudioContext: unknown }).webkitAudioContext);
  const hasSpeechRecognition = !!(
    (window as unknown as { SpeechRecognition?: unknown }).SpeechRecognition ||
    (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
  );

  const ua = navigator.userAgent;
  let browserName = 'Navigateur standard';
  if (ua.includes('Firefox')) browserName = 'Mozilla Firefox';
  else if (ua.includes('Edg/')) browserName = 'Microsoft Edge';
  else if (ua.includes('Chrome')) browserName = 'Google Chrome';
  else if (ua.includes('Safari')) browserName = 'Apple Safari';

  return {
    hasMediaDevices,
    hasAudioContext,
    hasSpeechRecognition,
    isIframe,
    browserName,
  };
}

export async function requestMicrophoneAccess(): Promise<{
  granted: boolean;
  stream?: MediaStream;
  error?: string;
  errorType?: 'not-allowed' | 'not-found' | 'not-supported' | 'unknown';
}> {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      granted: false,
      error: "L'API d'enregistrement audio n'est pas prise en charge par ce navigateur.",
      errorType: 'not-supported',
    };
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });
    return {
      granted: true,
      stream,
    };
  } catch (err: unknown) {
    const errorObj = err as Error;
    const name = errorObj.name || '';
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return {
        granted: false,
        error: "Accès au microphone refusé par le navigateur. Cliquez sur l'icône de cadenas ou caméra dans la barre d'adresse pour autoriser le micro.",
        errorType: 'not-allowed',
      };
    }
    if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
      return {
        granted: false,
        error: "Aucun microphone détecté sur votre appareil. Veuillez brancher un casque ou vérifier vos périphériques.",
        errorType: 'not-found',
      };
    }
    return {
      granted: false,
      error: errorObj.message || "Impossible d'accéder au microphone.",
      errorType: 'unknown',
    };
  }
}

/**
 * Creates an audio level meter using Web Audio API to detect real microphone volume (0-100)
 */
export function startAudioLevelMonitor(
  stream: MediaStream,
  onVolumeChange: (volume: number) => void
): () => void {
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextClass) {
    return () => {};
  }

  const audioCtx = new AudioContextClass();
  const source = audioCtx.createMediaStreamSource(stream);
  const analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  analyser.smoothingTimeConstant = 0.5;

  source.connect(analyser);

  const dataArray = new Uint8Array(analyser.frequencyBinCount);
  let isRunning = true;
  let animId: number;

  const checkVolume = () => {
    if (!isRunning) return;

    analyser.getByteFrequencyData(dataArray);
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Normalize to 0-100 with boosted sensitivity for speech
    const normalized = Math.min(100, Math.round((average / 128) * 100 * 1.6));
    onVolumeChange(normalized);

    animId = requestAnimationFrame(checkVolume);
  };

  animId = requestAnimationFrame(checkVolume);

  return () => {
    isRunning = false;
    cancelAnimationFrame(animId);
    try {
      source.disconnect();
      analyser.disconnect();
      audioCtx.close();
    } catch {
      // ignore cleanup errors
    }
  };
}

/**
 * Strips parenthesized pronunciation guides (e.g. "(Ohayō gozaimasu)" or "(Do svidaniya)"),
 * emojis, and extra punctuation from target phrases for accurate speech comparison.
 */
export function cleanTargetForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/\s*\([^)]*\)/g, '') // remove parenthesized romanization/notes
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, '') // remove emojis
    .replace(/[«»"']/g, '') // remove quotes
    .trim();
}

export interface PronunciationOptions {
  alternatives?: string[];
  isEarlyLearner?: boolean;
}

/**
 * Compare spoken transcript to the target phrase and return a similarity score (0 to 100).
 * Tests the primary transcript and any recognition alternatives, picking the best match.
 */
export function evaluatePronunciation(
  spoken: string,
  target: string,
  options?: PronunciationOptions
): PronunciationScore {
  const cleanTarget = cleanTargetForSpeech(target);
  const targetNorm = normalizeText(cleanTarget);

  const rawCandidates = [spoken, ...(options?.alternatives || [])]
    .map((c) => (c || '').trim())
    .filter((c) => c.length > 0);

  if (rawCandidates.length === 0 || !targetNorm) {
    return {
      score: 0,
      isMatch: false,
      feedback: "Aucun mot distinct n'a été capté. Rapproche-toi du micro et répète clairement.",
      transcript: spoken || '',
    };
  }

  let bestResult: PronunciationScore = {
    score: 0,
    isMatch: false,
    feedback: `Presque ! Entendu : « ${rawCandidates[0]} ». Répète : « ${cleanTarget} ».`,
    transcript: rawCandidates[0],
  };

  for (const candidate of rawCandidates) {
    const candidateScore = evaluateSingleCandidate(candidate, targetNorm, cleanTarget, options);
    if (candidateScore.score > bestResult.score) {
      bestResult = candidateScore;
    }
  }

  return bestResult;
}

function evaluateSingleCandidate(
  candidate: string,
  targetNorm: string,
  rawTarget: string,
  options?: PronunciationOptions
): PronunciationScore {
  const candidateNorm = normalizeText(candidate);

  if (!candidateNorm || candidateNorm.length === 0) {
    return {
      score: 0,
      isMatch: false,
      feedback: "Aucune parole distincte détectée.",
      transcript: candidate,
    };
  }

  // Exact match
  if (candidateNorm === targetNorm) {
    return {
      score: 100,
      isMatch: true,
      feedback: "Prononciation parfaite ! 🎯",
      transcript: candidate,
    };
  }

  // Token analysis
  const spokenTokens = candidateNorm.split(' ').filter(Boolean);
  const targetTokens = targetNorm.split(' ').filter(Boolean);

  let matchTokensCount = 0;
  targetTokens.forEach((t) => {
    if (spokenTokens.includes(t)) {
      matchTokensCount += 1;
    } else {
      // Check for close phonetic typos (edit distance <= 1 for words >= 3 chars, <= 2 for words >= 6 chars)
      const maxAllowedDist = t.length >= 6 ? 2 : 1;
      const hasClose = spokenTokens.some((st) => {
        const dist = calculateLevenshteinDistance(st, t);
        return dist <= maxAllowedDist && Math.abs(st.length - t.length) <= 1;
      });
      if (hasClose) {
        matchTokensCount += 0.8;
      }
    }
  });

  const tokenRatio = matchTokensCount / Math.max(1, targetTokens.length);
  const tokenOverlapScore = tokenRatio * 100;

  // Character Levenshtein
  const maxLen = Math.max(candidateNorm.length, targetNorm.length);
  const distance = calculateLevenshteinDistance(candidateNorm, targetNorm);
  const charScore = Math.max(0, Math.round(((maxLen - distance) / maxLen) * 100));

  // Combined score
  const combined = Math.round(tokenOverlapScore * 0.6 + charScore * 0.4);
  const finalScore = Math.min(100, Math.max(0, combined));

  // Strictness rules:
  // For standard: score >= 60 AND at least 50% of the target tokens matched
  // For 3-6 early learners: score >= 48 AND at least 40% of target tokens matched
  const isEarly = !!options?.isEarlyLearner;
  const minThreshold = isEarly ? 48 : 60;
  const minTokenRatio = isEarly ? 0.4 : 0.5;

  const isMatch = finalScore >= minThreshold && tokenRatio >= minTokenRatio;

  let feedback = "Prononciation réussie ! Bravo.";
  if (finalScore >= 90) {
    feedback = "Excellente prononciation ! Très naturel.";
  } else if (finalScore >= 75) {
    feedback = "Très bien articulé ! Bien compris.";
  } else if (isMatch) {
    feedback = "Bien prononcé ! L'effort d'articulation est validé.";
  } else {
    feedback = `Pas tout à fait. Entendu : « ${candidate} ». Répète : « ${rawTarget} ».`;
  }

  return {
    score: finalScore,
    isMatch,
    feedback,
    transcript: candidate,
  };
}
