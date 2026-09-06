import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Info,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import {
  getMicrophoneSupportInfo,
  requestMicrophoneAccess,
  startAudioLevelMonitor,
  evaluatePronunciation,
  MicrophoneSupportInfo,
} from '../../utils/speechRecognition';
import { soundManager } from '../../utils/sound';
import { LanguageCode } from '../../types';

interface MicrophoneTestModalProps {
  currentLanguage: LanguageCode;
  onClose: () => void;
}

export const MicrophoneTestModal: React.FC<MicrophoneTestModalProps> = ({
  currentLanguage,
  onClose,
}) => {
  const [supportInfo, setSupportInfo] = useState<MicrophoneSupportInfo | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<
    'idle' | 'prompting' | 'granted' | 'denied' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [audioVolume, setAudioVolume] = useState<number>(0);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [detectedDevices, setDetectedDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeTab, setActiveTab] = useState<'test' | 'troubleshoot'>('test');

  // Speech Recognition test states
  const [testSpeechStatus, setTestSpeechStatus] = useState<'idle' | 'listening' | 'success' | 'failed'>('idle');
  const [testTranscript, setTestTranscript] = useState<string>('');
  const [testScore, setTestScore] = useState<number | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);
  const stopMonitorRef = useRef<(() => void) | null>(null);
  const recognitionRef = useRef<any>(null);

  const testPhrases: Record<LanguageCode, { text: string; label: string; bcp47: string }> = {
    fr: { text: 'Bonjour', label: 'Bonjour', bcp47: 'fr-FR' },
    en: { text: 'Hello', label: 'Hello', bcp47: 'en-US' },
    es: { text: 'Hola', label: 'Hola', bcp47: 'es-ES' },
    de: { text: 'Hallo', label: 'Hallo', bcp47: 'de-DE' },
    it: { text: 'Ciao', label: 'Ciao', bcp47: 'it-IT' },
    pt: { text: 'Olá', label: 'Olá', bcp47: 'pt-PT' },
    nl: { text: 'Hallo', label: 'Hallo', bcp47: 'nl-NL' },
    ru: { text: 'Привет', label: 'Privet', bcp47: 'ru-RU' },
    zh: { text: '你好', label: 'Nǐ hǎo', bcp47: 'zh-CN' },
    ja: { text: 'こんにちは', label: 'Konnichiwa', bcp47: 'ja-JP' },
    ko: { text: '안녕하세요', label: 'Annyeonghaseyo', bcp47: 'ko-KR' },
    ar: { text: 'مرحبا', label: 'Marhaban', bcp47: 'ar-SA' },
  };

  const currentTestPhrase = testPhrases[currentLanguage] || testPhrases.fr;

  useEffect(() => {
    const info = getMicrophoneSupportInfo();
    setSupportInfo(info);

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const audioInputs = devices.filter((d) => d.kind === 'audioinput');
          setDetectedDevices(audioInputs);
        })
        .catch(() => {});
    }

    return () => {
      stopTest();
    };
  }, []);

  const startMicrophoneTest = async () => {
    soundManager.playPop();
    setPermissionStatus('prompting');
    setErrorMessage(null);

    const result = await requestMicrophoneAccess();

    if (result.granted && result.stream) {
      activeStreamRef.current = result.stream;
      setPermissionStatus('granted');
      setIsRecording(true);
      soundManager.playSuccess();

      // Start live volume monitoring
      const stop = startAudioLevelMonitor(result.stream, (volume) => {
        setAudioVolume(volume);
      });
      stopMonitorRef.current = stop;

      // Re-query audio devices with permissions granted to show real names
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          setDetectedDevices(devices.filter((d) => d.kind === 'audioinput'));
        });
      }
    } else {
      setPermissionStatus(result.errorType === 'not-allowed' ? 'denied' : 'error');
      setErrorMessage(result.error || 'Accès au microphone impossible.');
      soundManager.playWrong();
    }
  };

  const stopTest = () => {
    if (stopMonitorRef.current) {
      stopMonitorRef.current();
      stopMonitorRef.current = null;
    }
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach((t) => t.stop());
      activeStreamRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsRecording(false);
    setAudioVolume(0);
    setTestSpeechStatus('idle');
  };

  const handleTestSpeechRecognition = () => {
    soundManager.playPop();
    const SpeechRecognitionClass =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setTestSpeechStatus('failed');
      setTestTranscript("L'API Web Speech Recognition n'est pas disponible sur ce navigateur.");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRecognitionClass();
      rec.lang = currentTestPhrase.bcp47;
      rec.continuous = false;
      rec.interimResults = true;
      rec.maxAlternatives = 1;

      setTestSpeechStatus('listening');
      setTestTranscript('Écoute en cours... Prononcez : ' + currentTestPhrase.text);
      setTestScore(null);

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setTestTranscript(transcript);

        if (event.results[0].isFinal) {
          const evalResult = evaluatePronunciation(transcript, currentTestPhrase.text);
          setTestScore(evalResult.score);
          if (evalResult.isMatch) {
            setTestSpeechStatus('success');
            soundManager.playSuccess();
          } else {
            setTestSpeechStatus('failed');
          }
        }
      };

      rec.onerror = (event: any) => {
        setTestSpeechStatus('failed');
        if (event.error === 'not-allowed') {
          setTestTranscript('Permission de reconnaissance vocale refusée par le navigateur.');
        } else if (event.error === 'no-speech') {
          setTestTranscript('Aucune parole détectée. Rapprochez-vous du micro et réessayez.');
        } else {
          setTestTranscript(`Erreur : ${event.error}. Le mode secours reste actif.`);
        }
      };

      rec.onend = () => {
        // finished session
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err: any) {
      setTestSpeechStatus('failed');
      setTestTranscript("Impossible d'initialiser la reconnaissance vocale.");
    }
  };

  const openInNewTab = () => {
    soundManager.playPop();
    window.open(window.location.href, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border-2 border-gray-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-3d-green">
              <Mic className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">Diagnostic & Test du Microphone</h2>
              <p className="text-xs font-bold text-gray-500">
                Vérifie l'accès matériel, le volume audio et la reconnaissance vocale
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopTest();
              onClose();
            }}
            className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-gray-100 bg-gray-50 px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('test')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition cursor-pointer ${
              activeTab === 'test'
                ? 'bg-white text-emerald-600 border-t-2 border-x-2 border-gray-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🎙️ Test en Direct
          </button>
          <button
            onClick={() => setActiveTab('troubleshoot')}
            className={`px-4 py-2 text-xs font-black rounded-t-xl transition cursor-pointer ${
              activeTab === 'troubleshoot'
                ? 'bg-white text-emerald-600 border-t-2 border-x-2 border-gray-200'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            🛠️ Guide de Résolution & Permissions
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 space-y-5 overflow-y-auto flex-1">
          {activeTab === 'test' && (
            <div className="space-y-5">
              {/* Iframe detection notice */}
              {supportInfo?.isIframe && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-800 font-bold">
                  <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span>
                      L'application est exécutée dans un aperçu intégré (iframe). Certains navigateurs (Safari, Firefox, Chrome) bloquent l'accès au micro dans une iframe tierce.
                    </span>
                    <button
                      onClick={openInNewTab}
                      className="mt-1 flex items-center gap-1 text-emerald-700 underline font-black hover:text-emerald-900 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir dans un nouvel onglet pour autoriser à 100%</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Status Summary Checklist */}
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 space-y-2 text-xs">
                <div className="font-black text-gray-700 uppercase tracking-wider text-[11px] mb-1">
                  État de compatibilité système
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">Navigateur détecté :</span>
                  <span className="font-extrabold text-gray-800">{supportInfo?.browserName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">Capteur audio (Web Audio) :</span>
                  <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Prise en charge OK
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">Moteur reconnaissance vocale :</span>
                  {supportInfo?.hasSpeechRecognition ? (
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Web Speech API actif
                    </span>
                  ) : (
                    <span className="font-extrabold text-amber-600 flex items-center gap-1">
                      <Info className="w-3.5 h-3.5" /> Mode secours vocal actif
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-bold">Périphériques micro :</span>
                  <span className="font-extrabold text-gray-800">
                    {detectedDevices.length > 0
                      ? `${detectedDevices.length} détecté(s)`
                      : 'Par défaut'}
                  </span>
                </div>
              </div>

              {/* Live Audio Level Tester */}
              <div className="bg-white p-4 rounded-2xl border-2 border-emerald-200 text-center space-y-4 shadow-xs">
                <div className="text-xs font-black uppercase tracking-wider text-gray-500">
                  Étape 1 : Vérifier la capture audio
                </div>

                {/* Big mic button */}
                <div className="relative inline-block">
                  <button
                    onClick={isRecording ? stopTest : startMicrophoneTest}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      isRecording
                        ? 'bg-rose-500 text-white shadow-3d-rose animate-pulse scale-105'
                        : 'bg-emerald-500 text-white shadow-3d-green hover:brightness-105'
                    }`}
                  >
                    {isRecording ? <Mic className="w-9 h-9" /> : <MicOff className="w-9 h-9" />}
                  </button>
                  {isRecording && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                    </span>
                  )}
                </div>

                <div>
                  <div className="text-sm font-black text-gray-800">
                    {isRecording
                      ? '🎙️ Microphone ouvert — Parlez maintenant !'
                      : 'Cliquez pour tester et autoriser le micro'}
                  </div>
                  <div className="text-xs text-gray-500 font-bold mt-0.5">
                    {isRecording
                      ? 'Observez les barres de volume réagir à votre voix ci-dessous'
                      : "Le navigateur vous demandera l'autorisation d'accès"}
                  </div>
                </div>

                {/* Live Volume Waveform Visualizer */}
                {isRecording && (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-center gap-1.5 h-12 bg-gray-50 rounded-2xl px-4 border border-gray-200">
                      {[15, 30, 45, 60, 80, 100, 70, 50, 40, 60, 90, 75, 45, 30].map((h, i) => {
                        // Scaled height based on live audioVolume
                        const barHeight = Math.max(
                          6,
                          Math.min(42, Math.round((audioVolume / 100) * (h / 100) * 44 + 4))
                        );
                        const isSpeaking = audioVolume > 15;
                        return (
                          <div
                            key={i}
                            className={`w-2 rounded-full transition-all duration-75 ${
                              isSpeaking
                                ? audioVolume > 60
                                  ? 'bg-emerald-500'
                                  : 'bg-teal-400'
                                : 'bg-gray-300'
                            }`}
                            style={{ height: `${barHeight}px` }}
                          />
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-xs font-extrabold px-1">
                      <span className="text-gray-400">Volume : {audioVolume}%</span>
                      {audioVolume > 15 ? (
                        <span className="text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Voix bien captée !
                        </span>
                      ) : (
                        <span className="text-gray-400">Parlez plus fort ou approchez-vous</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {errorMessage && (
                  <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-2xl text-left space-y-1">
                    <div className="flex items-center gap-2 text-xs font-black text-rose-800">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Permission ou périphérique bloqué</span>
                    </div>
                    <p className="text-xs font-medium text-rose-700">{errorMessage}</p>
                    <button
                      onClick={openInNewTab}
                      className="mt-2 text-xs font-black text-emerald-700 underline flex items-center gap-1 hover:text-emerald-900 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Tester dans un nouvel onglet sans restrictions iframe</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Step 2: Test Speech Recognition */}
              <div className="bg-sky-50 p-4 rounded-2xl border-2 border-sky-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-sky-800">
                    Étape 2 : Tester la reconnaissance vocale
                  </div>
                  <span className="text-xs font-bold text-sky-700">
                    Langue : {currentTestPhrase.text} ({currentLanguage.toUpperCase()})
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleTestSpeechRecognition}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-extrabold text-xs shadow-3d-blue active:translate-y-0.5 transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>Prononcer « {currentTestPhrase.text} »</span>
                  </button>
                </div>

                {testSpeechStatus !== 'idle' && (
                  <div
                    className={`p-3 rounded-xl border text-xs font-bold ${
                      testSpeechStatus === 'success'
                        ? 'bg-emerald-100 border-emerald-300 text-emerald-900'
                        : testSpeechStatus === 'listening'
                        ? 'bg-sky-100 border-sky-300 text-sky-900 animate-pulse'
                        : 'bg-rose-100 border-rose-300 text-rose-900'
                    }`}
                  >
                    <div>{testTranscript}</div>
                    {testScore !== null && (
                      <div className="mt-1 font-black text-emerald-800">
                        Score de prononciation : {testScore}%
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'troubleshoot' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <h3 className="font-extrabold text-emerald-900 text-sm mb-1">
                  Comment débloquer le microphone en 3 clics :
                </h3>
                <p className="text-emerald-700 font-medium">
                  Les navigateurs exigent que vous autorisiez explicitement l'accès au microphone pour chaque site.
                </p>
              </div>

              {/* Browser Instructions Accordion */}
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-black text-gray-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px]">
                      1
                    </span>
                    <span>Google Chrome & Microsoft Edge :</span>
                  </div>
                  <ul className="list-disc pl-7 text-gray-600 space-y-1 font-medium">
                    <li>Regardez à gauche de la barre d'adresse (où est écrit l'URL).</li>
                    <li>Cliquez sur l'icône de <strong>cadenas 🔒</strong> ou de <strong>paramètres du site</strong>.</li>
                    <li>Réglez <strong>Microphone</strong> sur <strong>Autoriser</strong>.</li>
                    <li>Actualisez la page avec F5 ou Cmd+R.</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-black text-gray-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center text-[10px]">
                      2
                    </span>
                    <span>Apple Safari (Mac / iPhone / iPad) :</span>
                  </div>
                  <ul className="list-disc pl-7 text-gray-600 space-y-1 font-medium">
                    <li>Menu Safari &gt; <strong>Réglages pour ce site web...</strong></li>
                    <li>Vérifiez que le <strong>Microphone</strong> est réglé sur <strong>Demander</strong> ou <strong>Autoriser</strong>.</li>
                    <li>Sur iPhone/iPad : Réglages iOS &gt; Safari &gt; Microphone &gt; Autoriser.</li>
                  </ul>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-1.5">
                  <div className="font-black text-gray-800 flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-[10px]">
                      3
                    </span>
                    <span>Si vous êtes dans une fenêtre intégrée (Aperçu) :</span>
                  </div>
                  <p className="text-gray-600 font-medium pl-7">
                    Certains environnements d'aperçu de code restreignent la politique d'iframe. Utilisez le bouton ci-dessous pour ouvrir l'application dans un onglet dédié :
                  </p>
                  <div className="pl-7 pt-1">
                    <button
                      onClick={openInNewTab}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs flex items-center gap-1.5 shadow-3d-green transition cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ouvrir en plein écran dans un nouvel onglet</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-sky-50 border border-sky-200 rounded-xl space-y-1">
                  <div className="font-black text-sky-900">
                    💡 Bon à savoir : Mode "Je ne peux pas parler"
                  </div>
                  <p className="text-sky-800 font-medium">
                    Dans toutes les leçons de prononciation, un bouton <strong>« Passer (Je ne peux pas parler) »</strong> vous permet de valider l'exercice sans perdre de points ni de cœurs, si vous êtes dans les transports ou sans micro.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <button
            onClick={() => {
              stopTest();
              startMicrophoneTest();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Relancer le test</span>
          </button>

          <button
            onClick={() => {
              stopTest();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs shadow-3d-green transition cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
