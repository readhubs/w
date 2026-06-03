import { useState } from 'react';
import { Sparkles, Zap } from 'lucide-react';
import type { ReelConfig, Step } from './types';
import { generateDefaultSlides, NARRATIVE_FORMULAS, SPECIALTY_TEMPLATES } from './data';
import StepBar from './components/StepBar';
import TemplateStep from './components/TemplateStep';
import CustomizeStep from './components/CustomizeStep';
import ConfigStep from './components/ConfigStep';
import PreviewStep from './components/PreviewStep';

const DEFAULT_CONFIG: ReelConfig = {
  specialty: 'generalDentist',
  narrative: 'aidaClassic',
  colorTheme: 'elegantDark',
  animation: 'cinematicSlide',
  transition: 'swipeLeft',
  bgEffect: 'particles',
  language: 'en',
  doctorName: '',
  clinicName: '',
  city: '',
  phone: '',
  slides: [],
};

function initConfig(): ReelConfig {
  const cfg = { ...DEFAULT_CONFIG };
  cfg.slides = generateDefaultSlides(cfg.narrative, cfg.specialty, cfg.doctorName, cfg.clinicName);
  return cfg;
}

export default function App() {
  const [config, setConfig] = useState<ReelConfig>(initConfig);
  const [step, setStep] = useState<Step>('template');
  const [completed, setCompleted] = useState<Set<Step>>(new Set());

  const updateConfig = (partial: Partial<ReelConfig>) => {
    setConfig((prev) => {
      const next = { ...prev, ...partial };
      // Regenerate slides if narrative or specialty changed and slides exist
      if (
        (partial.narrative || partial.specialty) &&
        prev.slides.length > 0
      ) {
        const newSlides = generateDefaultSlides(
          next.narrative,
          next.specialty,
          next.doctorName,
          next.clinicName
        );
        // Only overwrite if user hasn't customized headlines meaningfully
        const specDefault = SPECIALTY_TEMPLATES[prev.specialty].tagline;
        const firstHeadline = prev.slides[0]?.headline ?? '';
        const seemsDefault = !firstHeadline || firstHeadline.includes('visible') || firstHeadline.includes('invisible') || firstHeadline.includes(specDefault);
        if (seemsDefault) next.slides = newSlides;
      }
      return next;
    });
  };

  const complete = (s: Step) => setCompleted((prev) => new Set([...prev, s]));

  const goNext = (from: Step, to: Step) => {
    complete(from);
    setStep(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#080C14]">
      {/* Header */}
      <header className="border-b border-slate-800/60 bg-[#080C14]/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/40">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <span className="font-bold text-white text-sm">PortfolioHubs</span>
              <span className="text-slate-500 text-xs ml-1 hidden sm:inline">Reel Generator</span>
            </div>
          </div>

          <StepBar
            current={step}
            onNavigate={setStep}
            completed={completed}
          />

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Zap size={12} className="text-amber-400" />
            <span className="hidden sm:inline">Rank on Google in 48h</span>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {step === 'template' && (
          <TemplateStep
            config={config}
            onChange={updateConfig}
            onNext={() => {
              // Regenerate slides with updated specialty/narrative
              setConfig((prev) => ({
                ...prev,
                slides: generateDefaultSlides(prev.narrative, prev.specialty, prev.doctorName, prev.clinicName),
              }));
              goNext('template', 'customize');
            }}
          />
        )}

        {step === 'customize' && (
          <CustomizeStep
            config={config}
            onChange={updateConfig}
            onNext={() => goNext('customize', 'config')}
            onBack={() => setStep('template')}
          />
        )}

        {step === 'config' && (
          <ConfigStep
            config={config}
            onChange={updateConfig}
            onNext={() => goNext('config', 'preview')}
            onBack={() => setStep('customize')}
          />
        )}

        {step === 'preview' && (
          <PreviewStep
            config={config}
            onBack={() => setStep('config')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/60 mt-16 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between text-xs text-slate-600">
          <span>© 2025 PortfolioHubs · Dental Reel Generator</span>
          <span>500+ dentists growing with us</span>
        </div>
      </footer>
    </div>
  );
}
