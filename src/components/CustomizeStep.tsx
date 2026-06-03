import { ChevronRight, ChevronLeft, Plus, Trash2, GripVertical, RefreshCw } from 'lucide-react';
import type { ReelConfig, StorySlide } from '../types';
import { generateDefaultSlides } from '../data';

interface CustomizeStepProps {
  config: ReelConfig;
  onChange: (partial: Partial<ReelConfig>) => void;
  onNext: () => void;
  onBack: () => void;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-sky-500 transition-colors"
      />
    </div>
  );
}

export default function CustomizeStep({ config, onChange, onNext, onBack }: CustomizeStepProps) {
  const updateSlide = (id: string, partial: Partial<StorySlide>) => {
    onChange({
      slides: config.slides.map((s) => (s.id === id ? { ...s, ...partial } : s)),
    });
  };

  const addSlide = () => {
    const newSlide: StorySlide = {
      id: `slide-${Date.now()}`,
      phase: 'Custom',
      headline: 'Your headline here',
      subtext: 'Supporting message goes here.',
      duration: 3,
    };
    onChange({ slides: [...config.slides, newSlide] });
  };

  const removeSlide = (id: string) => {
    if (config.slides.length <= 2) return;
    onChange({ slides: config.slides.filter((s) => s.id !== id) });
  };

  const regenerate = () => {
    onChange({
      slides: generateDefaultSlides(config.narrative, config.specialty, config.doctorName, config.clinicName),
    });
  };

  const totalDuration = config.slides.reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="flex flex-col gap-8 animate-fadeUp">
      <div>
        <h2 className="text-2xl font-bold text-white">Personalize Your Content</h2>
        <p className="text-slate-400 mt-1 text-sm">Add your clinic details and edit each slide</p>
      </div>

      {/* Clinic details */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
        <h3 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">Clinic Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Doctor Name" value={config.doctorName} onChange={(v) => onChange({ doctorName: v })} placeholder="dr. Ahmed Hassan" />
          <Field label="Clinic Name" value={config.clinicName} onChange={(v) => onChange({ clinicName: v })} placeholder="BrightSmile Dental" />
          <Field label="City" value={config.city} onChange={(v) => onChange({ city: v })} placeholder="Cairo" />
          <Field label="Phone / WhatsApp" value={config.phone} onChange={(v) => onChange({ phone: v })} placeholder="+20 100 000 0000" />
        </div>
      </div>

      {/* Slides */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Story Slides</h3>
            <p className="text-slate-500 text-xs mt-0.5">{config.slides.length} slides · {totalDuration}s total</p>
          </div>
          <button
            onClick={regenerate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 text-xs font-medium transition-all"
          >
            <RefreshCw size={12} /> Regenerate
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {config.slides.map((slide, idx) => (
            <div
              key={slide.id}
              className="group bg-slate-800/50 border border-slate-700 rounded-xl p-4 hover:border-slate-600 transition-all"
            >
              <div className="flex items-start gap-3">
                <GripVertical size={16} className="text-slate-600 mt-1 flex-shrink-0" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2 flex items-center gap-2">
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 font-medium">
                      {idx + 1}. {slide.phase}
                    </span>
                    <div className="flex items-center gap-1 ml-auto">
                      <span className="text-xs text-slate-500">Duration:</span>
                      <select
                        value={slide.duration}
                        onChange={(e) => updateSlide(slide.id, { duration: Number(e.target.value) })}
                        className="bg-slate-700 border border-slate-600 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-sky-500"
                      >
                        {[2, 3, 4, 5, 6].map((d) => (
                          <option key={d} value={d}>{d}s</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <input
                      value={slide.headline}
                      onChange={(e) => updateSlide(slide.id, { headline: e.target.value })}
                      placeholder="Headline"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm font-semibold placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <textarea
                      value={slide.subtext}
                      onChange={(e) => updateSlide(slide.id, { subtext: e.target.value })}
                      placeholder="Supporting text"
                      rows={2}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-xs placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors resize-none"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeSlide(slide.id)}
                  disabled={config.slides.length <= 2}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded text-slate-600 hover:text-red-400 disabled:opacity-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addSlide}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-slate-700 text-slate-500 hover:border-sky-500 hover:text-sky-400 text-sm transition-all"
        >
          <Plus size={14} /> Add Slide
        </button>
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
          Continue to Design <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
