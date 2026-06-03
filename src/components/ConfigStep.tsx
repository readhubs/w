import { ChevronRight, ChevronLeft } from 'lucide-react';
import type {
  ReelConfig,
  ColorTheme,
  AnimationType,
  TransitionType,
  BackgroundEffect,
} from '../types';
import {
  COLOR_THEMES,
  ANIMATION_LABELS,
  TRANSITION_LABELS,
  BG_EFFECT_LABELS,
} from '../data';

interface ConfigStepProps {
  config: ReelConfig;
  onChange: (partial: Partial<ReelConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{title}</h3>
      {children}
    </div>
  );
}

export default function ConfigStep({ config, onChange, onNext, onBack }: ConfigStepProps) {
  return (
    <div className="flex flex-col gap-8 animate-fadeUp">
      <div>
        <h2 className="text-2xl font-bold text-white">Design Your Reel</h2>
        <p className="text-slate-400 mt-1 text-sm">Choose colors, animations, and visual effects</p>
      </div>

      {/* Color Themes */}
      <Section title="Color Theme">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.entries(COLOR_THEMES) as [ColorTheme, typeof COLOR_THEMES[ColorTheme]][]).map(([key, theme]) => {
            const isSelected = config.colorTheme === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ colorTheme: key })}
                className={`relative flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                  isSelected ? 'border-sky-500 ring-1 ring-sky-500/40' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <div
                  className="w-full h-8 rounded-lg flex items-center justify-center gap-1"
                  style={{ background: theme.bg, border: `1px solid ${theme.border}` }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ background: theme.accent }} />
                  <div className="w-5 h-1.5 rounded" style={{ background: theme.text, opacity: 0.7 }} />
                </div>
                <span className={`text-[10px] font-medium text-center leading-tight ${isSelected ? 'text-sky-400' : 'text-slate-400'}`}>
                  {theme.label}
                </span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-sky-400" />
                )}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Animation Type */}
      <Section title="Text Animation">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {(Object.entries(ANIMATION_LABELS) as [AnimationType, typeof ANIMATION_LABELS[AnimationType]][]).map(([key, anim]) => {
            const isSelected = config.animation === key;
            return (
              <button
                key={key}
                onClick={() => onChange({ animation: key })}
                className={`flex flex-col items-start gap-0.5 p-3 rounded-xl border text-left transition-all ${
                  isSelected ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <span className={`text-xs font-semibold ${isSelected ? 'text-sky-300' : 'text-white'}`}>
                  {anim.label}
                </span>
                <span className="text-[10px] text-slate-500">{anim.desc}</span>
              </button>
            );
          })}
        </div>
      </Section>

      {/* Transition + BG in a row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Section title="Slide Transition">
          <div className="flex flex-col gap-2">
            {(Object.entries(TRANSITION_LABELS) as [TransitionType, typeof TRANSITION_LABELS[TransitionType]][]).map(([key, t]) => {
              const isSelected = config.transition === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ transition: key })}
                  className={`px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Background Effect">
          <div className="flex flex-col gap-2">
            {(Object.entries(BG_EFFECT_LABELS) as [BackgroundEffect, typeof BG_EFFECT_LABELS[BackgroundEffect]][]).map(([key, b]) => {
              const isSelected = config.bgEffect === key;
              return (
                <button
                  key={key}
                  onClick={() => onChange({ bgEffect: key })}
                  className={`px-3 py-2 rounded-lg border text-left text-sm transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-500/10 text-sky-300'
                      : 'border-slate-700 text-slate-300 hover:border-slate-500'
                  }`}
                >
                  {b.label}
                </button>
              );
            })}
          </div>
        </Section>
      </div>

      {/* Nav */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all text-sm"
        >
          <ChevronLeft size={16} /> Back
        </button>
        <button
          onClick={onNext}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-all shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95"
        >
          Preview Reel <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
