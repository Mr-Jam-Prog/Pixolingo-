import React from 'react';
import { X, ShieldCheck, Heart, Sparkles, Clock, Volume2 } from 'lucide-react';

interface KidsSafeGuideModalProps {
  onClose: () => void;
}

export const KidsSafeGuideModal: React.FC<KidsSafeGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border-4 border-amber-200 p-6 flex flex-col max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-black">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-800">Engagement Mode Enfant</h2>
              <p className="text-xs text-gray-500 font-bold">Un environnement d'apprentissage 100% protégé</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Benefits list */}
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
            <div className="p-2 rounded-xl bg-emerald-500 text-white mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-emerald-800">Zéro Publicité & Zéro Lien Externe</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                Aucune sollicitation commerciale ni redirection web. L'enfant reste concentré sur son apprentissage.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50 border border-blue-100">
            <div className="p-2 rounded-xl bg-blue-500 text-white mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-blue-800">Gestion du Temps d'Écran</h4>
              <p className="text-xs text-blue-700 mt-0.5">
                Fixez un quota quotidien (ex: 20 minutes). Une fois atteint, l'application félicite l'enfant et l'invite à faire une pause.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-purple-50 border border-purple-100">
            <div className="p-2 rounded-xl bg-purple-500 text-white mt-0.5">
              <Heart className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-purple-800">Pédagogie Positive & Bienveillante</h4>
              <p className="text-xs text-purple-700 mt-0.5">
                Pas de pénalité frustrante. Les erreurs sont vues comme des opportunités de progrès avec la mascotte encourageante.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-2xl bg-amber-50 border border-amber-100">
            <div className="p-2 rounded-xl bg-amber-500 text-white mt-0.5">
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-800">Audio Haute Qualité BCP-47</h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Prononciation authentique par synthèse vocale native pour habituer l'oreille de l'enfant aux vrais accents.
              </p>
            </div>
          </div>
        </div>

        {/* Action */}
        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-emerald-500 text-white font-black text-sm shadow-3d-green hover:bg-emerald-600 transition cursor-pointer mt-2"
        >
          J'ai compris, c'est parfait !
        </button>
      </div>
    </div>
  );
};
