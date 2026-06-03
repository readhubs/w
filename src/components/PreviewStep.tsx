import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play, Pause, ChevronLeft, ChevronRight, SkipBack,
  SkipForward, Download, RotateCcw, Maximize2,
} from 'lucide-react';
import type { ReelConfig } from '../types';
import CanvasRenderer, { renderFrame } from './CanvasRenderer';
import { COLOR_THEMES } from '../data';

interface PreviewStepProps {
  config: ReelConfig;
  onBack: () => void;
}

const CANVAS_W = 540;
const CANVAS_H = 960;

export default function PreviewStep({ config, onBack }: PreviewStepProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedAtRef = useRef<number>(0);
  const rafRef = useRef<number>(0);

  const slideDuration = config.slides[currentSlide]?.duration ?? 3;

  const tick = useCallback(() => {
    if (!startTimeRef.current) return;
    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const p = Math.min(1, elapsed / slideDuration);
    setProgress(p);
    if (p >= 1) {
      if (currentSlide < config.slides.length - 1) {
        setCurrentSlide((s) => s + 1);
        startTimeRef.current = performance.now();
        setProgress(0);
      } else {
        setPlaying(false);
        setProgress(1);
        return;
      }
    }
    rafRef.current = requestAnimationFrame(tick);
  }, [currentSlide, slideDuration, config.slides.length]);

  useEffect(() => {
    if (playing) {
      startTimeRef.current = performance.now() - pausedAtRef.current * 1000 * slideDuration;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(rafRef.current);
      if (startTimeRef.current) {
        pausedAtRef.current = (performance.now() - startTimeRef.current) / 1000 / slideDuration;
      }
    }
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, tick, slideDuration]);

  // Reset on slide change externally
  useEffect(() => {
    startTimeRef.current = performance.now();
    pausedAtRef.current = 0;
  }, [currentSlide]);

  const goTo = (idx: number) => {
    setCurrentSlide(idx);
    setProgress(0);
    startTimeRef.current = performance.now();
    pausedAtRef.current = 0;
  };

  const restart = () => {
    goTo(0);
    setPlaying(true);
    setExportDone(false);
  };

  const exportWebM = async () => {
    const canvas = canvasRef.current;
    if (!canvas || exporting) return;
    setExporting(true);
    setExportDone(false);

    try {
      const stream = canvas.captureStream(30);
      // @ts-ignore
      const recorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 4_000_000,
      });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e: BlobEvent) => { if (e.data.size) chunks.push(e.data); };

      recorder.start();

      // Render each slide for its duration
      let t = 0;
      const fps = 30;
      for (let si = 0; si < config.slides.length; si++) {
        const dur = config.slides[si].duration;
        const frames = Math.ceil(dur * fps);
        for (let f = 0; f < frames; f++) {
          const p = f / frames;
          renderFrame(canvas, config, si, p, t);
          t += 1 / fps;
          await new Promise((r) => setTimeout(r, 1000 / fps));
        }
      }

      recorder.stop();
      await new Promise<void>((res) => { recorder.onstop = () => res(); });

      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.clinicName || 'reel'}_portfoliohubs.webm`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
    } finally {
      setExporting(false);
    }
  };

  const theme = COLOR_THEMES[config.colorTheme];
  const totalDuration = config.slides.reduce((a, s) => a + s.duration, 0);
  const elapsedTotal = config.slides.slice(0, currentSlide).reduce((a, s) => a + s.duration, 0)
    + progress * slideDuration;
  const overallProgress = elapsedTotal / totalDuration;

  return (
    <div className="flex flex-col gap-6 animate-fadeUp">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Preview Your Reel</h2>
          <p className="text-slate-400 mt-1 text-sm">
            {config.slides.length} slides · {totalDuration}s total
          </p>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-all text-sm"
        >
          <ChevronLeft size={14} /> Edit Design
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Canvas */}
        <div className="flex flex-col items-center gap-4">
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: theme.bg, maxWidth: 280 }}
          >
            <CanvasRenderer
              config={config}
              currentSlide={currentSlide}
              progress={progress}
              width={CANVAS_W}
              height={CANVAS_H}
              canvasRef={canvasRef}
            />
            {/* Overlay phone frame */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl border border-white/10" />
          </div>

          {/* Overall progress bar */}
          <div className="w-full max-w-[280px]">
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-sky-500 rounded-full transition-all"
                style={{ width: `${overallProgress * 100}%` }}
              />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-600">
              <span>{elapsedTotal.toFixed(1)}s</span>
              <span>{totalDuration}s</span>
            </div>
          </div>
        </div>

        {/* Controls panel */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Playback controls */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Playback</h3>
            <div className="flex items-center justify-center gap-3">
              <button onClick={restart} className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all">
                <SkipBack size={16} />
              </button>
              <button
                onClick={() => goTo(Math.max(0, currentSlide - 1))}
                className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPlaying((p) => !p)}
                className="p-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95"
              >
                {playing ? <Pause size={20} /> : <Play size={20} />}
              </button>
              <button
                onClick={() => goTo(Math.min(config.slides.length - 1, currentSlide + 1))}
                className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => goTo(config.slides.length - 1)}
                className="p-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-all"
              >
                <SkipForward size={16} />
              </button>
            </div>

            {/* Slide progress */}
            <div className="mt-4">
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden cursor-pointer">
                <div
                  className="h-full bg-sky-500 rounded-full transition-none"
                  style={{ width: `${progress * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-600 mt-1">
                <span>Slide {currentSlide + 1} / {config.slides.length}</span>
                <span>{(progress * slideDuration).toFixed(1)}s / {slideDuration}s</span>
              </div>
            </div>
          </div>

          {/* Slide list */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Slides</h3>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
              {config.slides.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => goTo(idx)}
                  className={`flex items-start gap-3 p-2.5 rounded-lg text-left transition-all ${
                    idx === currentSlide
                      ? 'bg-sky-500/15 border border-sky-500/40'
                      : 'hover:bg-slate-700/50 border border-transparent'
                  }`}
                >
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex-shrink-0 mt-0.5 ${
                    idx === currentSlide ? 'bg-sky-500 text-white' : 'bg-slate-700 text-slate-400'
                  }`}>
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-white truncate">{slide.headline}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">{slide.phase} · {slide.duration}s</div>
                  </div>
                  {idx === currentSlide && playing && (
                    <div className="flex gap-0.5 items-center self-center flex-shrink-0">
                      {[0, 1, 2].map((b) => (
                        <div
                          key={b}
                          className="w-0.5 bg-sky-400 rounded-full animate-pulse"
                          style={{ height: 8 + b * 4, animationDelay: `${b * 150}ms` }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Export */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Export</h3>
            <div className="flex flex-col gap-2">
              <button
                onClick={exportWebM}
                disabled={exporting}
                className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all ${
                  exporting
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : exportDone
                    ? 'bg-green-500/20 border border-green-500/40 text-green-400'
                    : 'bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30 hover:scale-105 active:scale-95'
                }`}
              >
                <Download size={16} />
                {exporting ? 'Rendering...' : exportDone ? 'Downloaded!' : 'Export as WebM Video'}
              </button>
              <button
                onClick={restart}
                className="flex items-center justify-center gap-2 py-2 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-sm transition-all"
              >
                <RotateCcw size={14} /> Replay from Start
              </button>
            </div>
            {exporting && (
              <p className="text-xs text-slate-500 mt-2 text-center">
                Rendering {config.slides.length} slides at 30fps…
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
