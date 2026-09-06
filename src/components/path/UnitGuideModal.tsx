import React, { useState } from 'react';
import { Unit } from '../../types';
import { X, BookOpen, CheckCircle, Lightbulb } from 'lucide-react';
import { soundManager } from '../../utils/sound';

interface UnitGuideModalProps {
  unit: Unit;
  onClose: () => void;
}

export const UnitGuideModal: React.FC<UnitGuideModalProps> = ({ unit, onClose }) => {
  const guide = unit.guidebook;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col border-2 border-gray-200 shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="p-4 bg-emerald-500 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6" />
            <div>
              <h2 className="text-base font-black">Guide de l'Unité</h2>
              <p className="text-xs text-emerald-100 font-bold">{unit.title}</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playPop();
              onClose();
            }}
            className="text-white/80 hover:text-white p-1 rounded-xl cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {/* Grammar Tips */}
          {guide?.grammarTips && guide.grammarTips.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Règles de Grammaire</span>
              </h3>
              <div className="space-y-2.5">
                {guide.grammarTips.map((tip, idx) => (
                  <div key={idx} className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 space-y-1">
                    <div className="font-extrabold text-xs text-amber-900">{tip.rule}</div>
                    <div className="text-xs text-gray-600 leading-relaxed">{tip.explanation}</div>
                    <div className="text-xs font-bold text-amber-800 bg-white/70 p-2 rounded-xl mt-1">
                      💡 {tip.example}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vocabulary list */}
          {guide?.keyVocabulary && guide.keyVocabulary.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-black text-gray-800 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>Vocabulaire Clé</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {guide.keyVocabulary.map((v, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col">
                    <span className="font-extrabold text-sm text-gray-800">{v.target}</span>
                    <span className="text-xs text-gray-500 font-medium">{v.native}</span>
                    {v.phonetic && <span className="text-[11px] text-emerald-600 font-mono italic">/{v.phonetic}/</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
