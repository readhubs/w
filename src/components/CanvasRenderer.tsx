import { useEffect, useRef, useCallback } from 'react';
import type { ReelConfig } from '../types';
import { COLOR_THEMES } from '../data';

interface CanvasRendererProps {
  config: ReelConfig;
  currentSlide: number;
  progress: number; // 0–1 within slide
  width?: number;
  height?: number;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

// ─── Background effects ────────────────────────────────────────────────────

function drawBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  bg: string,
  accent: string,
  effect: ReelConfig['bgEffect'],
  t: number
) {
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  if (effect === 'gradient') {
    const grd = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
    grd.addColorStop(0, accent + '18');
    grd.addColorStop(1, 'transparent');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, w, h);
  }

  if (effect === 'particles') {
    const seed = 42;
    for (let i = 0; i < 30; i++) {
      const px = ((seed * (i * 137 + 17)) % w + Math.sin(t * 0.3 + i) * 20 + w) % w;
      const py = ((seed * (i * 97 + 31)) % h + Math.cos(t * 0.2 + i) * 15 + h) % h;
      const radius = 1 + (i % 3);
      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = accent + '40';
      ctx.fill();
    }
  }

  if (effect === 'grid') {
    ctx.strokeStyle = accent + '12';
    ctx.lineWidth = 1;
    const spacing = 40;
    for (let x = 0; x < w; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let y = 0; y < h; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
  }

  if (effect === 'noise') {
    for (let i = 0; i < 400; i++) {
      const nx = Math.random() * w;
      const ny = Math.random() * h;
      ctx.fillStyle = `rgba(255,255,255,0.015)`;
      ctx.fillRect(nx, ny, 1, 1);
    }
  }
}

// ─── Animated text helpers ─────────────────────────────────────────────────

function easeOutExpo(t: number) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

function easeOutElastic(t: number) {
  const c4 = (2 * Math.PI) / 3;
  return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
}

function drawAnimatedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  progress: number,
  anim: ReelConfig['animation'],
  color: string,
  font: string,
  maxWidth: number
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const p = Math.min(1, progress * 1.5); // entrance is fast

  if (anim === 'fadeUp') {
    const e = easeOutExpo(p);
    ctx.globalAlpha = e;
    ctx.translate(0, (1 - e) * 30);
    ctx.fillText(text, x, y, maxWidth);

  } else if (anim === 'cinematicSlide') {
    const e = easeOutExpo(p);
    ctx.globalAlpha = e;
    ctx.translate((1 - e) * -60, 0);
    ctx.fillText(text, x, y, maxWidth);

  } else if (anim === 'scalePop') {
    const e = easeOutExpo(p);
    ctx.globalAlpha = e;
    ctx.translate(x, y);
    ctx.scale(0.5 + e * 0.5, 0.5 + e * 0.5);
    ctx.fillText(text, 0, 0, maxWidth);
    ctx.restore();
    return;

  } else if (anim === 'elasticBounce') {
    const e = easeOutElastic(p);
    ctx.globalAlpha = Math.min(1, p * 3);
    ctx.translate(x, y);
    ctx.scale(e, e);
    ctx.fillText(text, 0, 0, maxWidth);
    ctx.restore();
    return;

  } else if (anim === 'maskReveal') {
    const e = easeOutExpo(p);
    ctx.globalAlpha = 1;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x - maxWidth / 2, y - 60, maxWidth * e, 120);
    ctx.clip();
    ctx.fillText(text, x, y, maxWidth);
    ctx.restore();
    ctx.restore();
    return;

  } else if (anim === 'glitchReveal') {
    const e = easeOutExpo(p);
    if (p < 0.7) {
      for (let g = 0; g < 3; g++) {
        ctx.fillStyle = g === 0 ? '#ff000044' : g === 1 ? '#00ff0044' : color;
        ctx.globalAlpha = e;
        const ox = g === 0 ? -3 : g === 1 ? 3 : 0;
        ctx.fillText(text, x + ox, y, maxWidth);
      }
    } else {
      ctx.globalAlpha = 1;
      ctx.fillStyle = color;
      ctx.fillText(text, x, y, maxWidth);
    }
    ctx.restore();
    return;

  } else if (anim === 'typewriter') {
    const chars = Math.floor(p * text.length);
    ctx.globalAlpha = 1;
    ctx.fillText(text.slice(0, chars) + (chars < text.length && Math.floor(Date.now() / 400) % 2 === 0 ? '|' : ''), x, y, maxWidth);

  } else if (anim === 'splitFlap') {
    const e = easeOutExpo(p);
    ctx.globalAlpha = e;
    ctx.translate(0, (1 - e) * -20);
    ctx.fillText(text, x, y, maxWidth);

  } else {
    ctx.globalAlpha = easeOutExpo(p);
    ctx.fillText(text, x, y, maxWidth);
  }

  ctx.restore();
}

// ─── Phase badge ───────────────────────────────────────────────────────────

function drawPhaseBadge(
  ctx: CanvasRenderingContext2D,
  phase: string,
  x: number,
  y: number,
  accent: string,
  progress: number
) {
  const alpha = Math.min(1, progress * 3);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = 'bold 11px Inter, system-ui, sans-serif';
  ctx.textAlign = 'center';
  const tw = ctx.measureText(phase.toUpperCase()).width;
  const pad = 10;
  const bw = tw + pad * 2;
  const bh = 22;
  const bx = x - bw / 2;
  const by = y - bh / 2;
  ctx.fillStyle = accent + '30';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 5);
  ctx.fill();
  ctx.strokeStyle = accent + '80';
  ctx.lineWidth = 1;
  ctx.stroke();
  ctx.fillStyle = accent;
  ctx.fillText(phase.toUpperCase(), x, y);
  ctx.restore();
}

// ─── Accent line ───────────────────────────────────────────────────────────

function drawAccentLine(
  ctx: CanvasRenderingContext2D,
  cx: number,
  y: number,
  accent: string,
  progress: number
) {
  const p = Math.min(1, progress * 2);
  const length = 60 * p;
  ctx.save();
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.globalAlpha = p;
  ctx.beginPath();
  ctx.moveTo(cx - length / 2, y);
  ctx.lineTo(cx + length / 2, y);
  ctx.stroke();
  ctx.restore();
}

// ─── Slide counter dots ────────────────────────────────────────────────────

function drawSlideCounter(
  ctx: CanvasRenderingContext2D,
  total: number,
  current: number,
  cx: number,
  y: number,
  accent: string
) {
  const dotSize = 4;
  const gap = 10;
  const totalW = total * dotSize + (total - 1) * gap;
  let sx = cx - totalW / 2;
  for (let i = 0; i < total; i++) {
    ctx.beginPath();
    ctx.arc(sx + dotSize / 2, y, dotSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = i === current ? accent : accent + '40';
    ctx.fill();
    sx += dotSize + gap;
  }
}

// ─── Main renderer ─────────────────────────────────────────────────────────

export function renderFrame(
  canvas: HTMLCanvasElement,
  config: ReelConfig,
  slideIdx: number,
  progress: number,
  t: number
) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = canvas.width;
  const h = canvas.height;
  const theme = COLOR_THEMES[config.colorTheme];
  const slide = config.slides[slideIdx];
  if (!slide) return;

  ctx.clearRect(0, 0, w, h);

  // Background
  drawBackground(ctx, w, h, theme.bg, theme.accent, config.bgEffect, t);

  const cx = w / 2;

  // Phase badge
  drawPhaseBadge(ctx, slide.phase, cx, h * 0.22, theme.accent, progress);

  // Accent line
  drawAccentLine(ctx, cx, h * 0.32, theme.accent, progress);

  // Headline
  const headlineFontSize = w > 500 ? 36 : 28;
  drawAnimatedText(
    ctx,
    slide.headline,
    cx,
    h * 0.44,
    progress,
    config.animation,
    theme.text,
    `bold ${headlineFontSize}px Inter, system-ui, sans-serif`,
    w * 0.85
  );

  // Subtext
  const subtextFontSize = w > 500 ? 15 : 12;
  ctx.save();
  ctx.font = `${subtextFontSize}px Inter, system-ui, sans-serif`;
  ctx.fillStyle = theme.text + 'AA';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.globalAlpha = Math.min(1, Math.max(0, (progress - 0.15) * 2));

  // Word-wrap subtext
  const words = slide.subtext.split(' ');
  const lineH = subtextFontSize * 1.6;
  const maxW = w * 0.78;
  let line = '';
  const lines: string[] = [];
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);

  const totalTextH = lines.length * lineH;
  const startY = h * 0.6 - totalTextH / 2 + lineH / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx, startY + i * lineH, maxW));
  ctx.restore();

  // Bottom info (doctor + clinic)
  if (config.doctorName || config.clinicName) {
    ctx.save();
    const fontSize = w > 500 ? 12 : 10;
    ctx.font = `${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.accent;
    ctx.globalAlpha = Math.min(1, Math.max(0, (progress - 0.3) * 2));
    const info = [config.doctorName, config.clinicName, config.city].filter(Boolean).join(' · ');
    ctx.fillText(info, cx, h * 0.82);
    ctx.restore();
  }

  // Phone
  if (config.phone) {
    ctx.save();
    ctx.font = `bold ${w > 500 ? 13 : 11}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillStyle = theme.text + '80';
    ctx.globalAlpha = Math.min(1, Math.max(0, (progress - 0.4) * 2));
    ctx.fillText(config.phone, cx, h * 0.88);
    ctx.restore();
  }

  // Slide counter
  drawSlideCounter(ctx, config.slides.length, slideIdx, cx, h * 0.94, theme.accent);

  // Branding watermark
  ctx.save();
  ctx.font = `bold ${w > 500 ? 11 : 9}px Inter, system-ui, sans-serif`;
  ctx.textAlign = 'right';
  ctx.fillStyle = theme.accent + '60';
  ctx.globalAlpha = 0.5;
  ctx.fillText('PortfolioHubs', w - 16, h - 12);
  ctx.restore();
}

// ─── React component ───────────────────────────────────────────────────────

export default function CanvasRenderer({
  config,
  currentSlide,
  progress,
  width = 540,
  height = 960,
  canvasRef: externalRef,
}: CanvasRendererProps) {
  const internalRef = useRef<HTMLCanvasElement>(null);
  const ref = externalRef ?? internalRef;
  const animRef = useRef<number>(0);
  const tRef = useRef(0);
  const startRef = useRef<number | null>(null);

  const draw = useCallback(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!startRef.current) startRef.current = performance.now();
    tRef.current = (performance.now() - startRef.current) / 1000;
    renderFrame(canvas, config, currentSlide, progress, tRef.current);
    animRef.current = requestAnimationFrame(draw);
  }, [config, currentSlide, progress, ref]);

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animRef.current);
  }, [draw]);

  return (
    <canvas
      ref={ref as React.RefObject<HTMLCanvasElement>}
      width={width}
      height={height}
      className="max-w-full"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
