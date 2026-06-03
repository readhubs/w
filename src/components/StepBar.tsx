import { Check } from 'lucide-react';
import type { Step } from '../types';

interface StepBarProps {
  current: Step;
  onNavigate: (s: Step) => void;
  completed: Set<Step>;
}

const STEPS: { id: Step; label: string }[] = [
  { id: 'template',  label: 'Specialty' },
  { id: 'customize', label: 'Content' },
  { id: 'config',    label: 'Design' },
  { id: 'preview',   label: 'Preview' },
];

export default function StepBar({ current, onNavigate, completed }: StepBarProps) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, idx) => {
        const isDone = completed.has(step.id);
        const isActive = step.id === current;
        const canClick = isDone || idx <= currentIdx;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => canClick && onNavigate(step.id)}
              disabled={!canClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                isActive
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/30'
                  : isDone
                  ? 'bg-sky-500/20 text-sky-400 hover:bg-sky-500/30 cursor-pointer'
                  : 'text-slate-500 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                  isActive
                    ? 'border-white bg-white text-sky-500'
                    : isDone
                    ? 'border-sky-400 bg-sky-400 text-white'
                    : 'border-slate-600 text-slate-500'
                }`}
              >
                {isDone && !isActive ? <Check size={11} strokeWidth={3} /> : idx + 1}
              </span>
              {step.label}
            </button>

            {idx < STEPS.length - 1 && (
              <div
                className={`w-8 h-px transition-all duration-500 ${
                  idx < currentIdx ? 'bg-sky-500' : 'bg-slate-700'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
