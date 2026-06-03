import { useState } from 'react';
import { ChevronRight, Globe } from 'lucide-react';
import type { ReelConfig, SpecialtyTemplate, NarrativeFormula } from '../types';
import { SPECIALTY_TEMPLATES, NARRATIVE_FORMULAS } from '../data';

interface TemplateStepProps {
  config: ReelConfig;
  onChange: (partial: Partial<ReelConfig>) => void;
  onNext: () => void;
}

export default function TemplateStep({ config, onChange, onNext }: TemplateStepProps) {
  const [hoveredSpec, setHoveredSpec] = useState<SpecialtyTemplate | null>(null);

  return (
    <div className="flex flex-col gap-10 animate-fadeUp">
      {/* Language toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Choose Your Specialty</h2>
          <p className="text-slate-400 mt-1 text-sm">Select the template that matches your dental practice</p>
        </div>
        <button
          onClick={() => onChange({ language: config.language === 'en' ? 'ar' : 'en' })}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:border-sky-500 hover:text-sky-400 transition-all text-sm"
        >
          <Globe size={14} />
          {config.language === 'en' ? 'العربية' : 'English'}
        </button>
      </div>

      {/* Specialty grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {(Object.entries(SPECIALTY_TEMPLATES) as [SpecialtyTemplate, typeof SPECIALTY_TEMPLATES[SpecialtyTemplate]][]).map(
          ([key, spec]) => {
            const isSelected = config.specialty === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ specialty: key })}
                onMouseEnter={() => setHoveredSpec(key)}
                onMouseLeave={() => setHoveredSpec(null)}
                className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 group ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 shadow-lg shadow-sky-500/20'
                    : 'border-slate-700 bg-slate-800/50 hover:border-slate-500 hover:bg-slate-800'
                }`}
              >
                <span className="text-3xl">{spec.icon}</span>
                <span className={`text-xs font-semibold text-center leading-tight ${isSelected ? 'text-sky-400' : 'text-slate-300'}`}>
                  {config.language === 'ar' ? spec.labelAr : spec.label}
                </span>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                )}
              </button>
            );
          }
        )}
      </div>

      {/* Tagline */}
      {hoveredSpec && (
        <p className="text-center text-slate-400 text-sm italic transition-all">
          {config.language === 'ar'
            ? SPECIALTY_TEMPLATES[hoveredSpec].taglineAr
            : SPECIALTY_TEMPLATES[hoveredSpec].tagline}
        </p>
      )}

      {/* Narrative formula */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-1">Narrative Formula</h3>
        <p className="text-slate-400 text-sm mb-4">How do you want to tell your story?</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(NARRATIVE_FORMULAS) as [NarrativeFormula, typeof NARRATIVE_FORMULAS[NarrativeFormula]][]).map(
            ([key, formula]) => {
              const isSelected = config.narrative === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ narrative: key })}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-500'
                  }`}
                >
                  <span className={`font-semibold text-sm ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                    {formula.label}
                  </span>
                  <span className="text-slate-400 text-xs">{formula.desc}</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {formula.phases.map((p) => (
                      <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
                        {p}
                      </span>
                    ))}
                  </div>
                </button>
              );
            }
          )}
        </div>
      </div>

      {/* Next */}
      <div className="flex justify-end">
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all shadow-lg shadow-sky-500/30 hover:shadow-sky-500/50 hover:scale-105 active:scale-95"
        >
          Continue to Content <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
