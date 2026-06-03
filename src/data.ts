import type {
  SpecialtyTemplate,
  NarrativeFormula,
  ColorTheme,
  AnimationType,
  TransitionType,
  BackgroundEffect,
  StorySlide,
} from './types';

// ─── Specialty Templates ───────────────────────────────────────────────────

export const SPECIALTY_TEMPLATES: Record<
  SpecialtyTemplate,
  { label: string; labelAr: string; icon: string; tagline: string; taglineAr: string }
> = {
  generalDentist: { label: 'General Dentist', labelAr: 'طبيب أسنان عام', icon: '🦷', tagline: 'Complete oral care for the whole family', taglineAr: 'رعاية شاملة للأسرة' },
  endodontics:    { label: 'Endodontics', labelAr: 'علاج الجذور', icon: '🔬', tagline: 'Expert root canal therapy', taglineAr: 'علاج قناة الجذر باحتراف' },
  pediatrics:     { label: 'Pediatric Dentistry', labelAr: 'طب أسنان الأطفال', icon: '👶', tagline: 'Gentle care for little smiles', taglineAr: 'رعاية لطيفة لابتسامات صغيرة' },
  surgery:        { label: 'Oral Surgery', labelAr: 'جراحة الفم', icon: '⚕️', tagline: 'Precision surgical excellence', taglineAr: 'دقة وتميز جراحي' },
  implants:       { label: 'Dental Implants', labelAr: 'زراعة الأسنان', icon: '🔩', tagline: 'Permanent smile restoration', taglineAr: 'استعادة الابتسامة بشكل دائم' },
  orthodontics:   { label: 'Orthodontics', labelAr: 'تقويم الأسنان', icon: '😬', tagline: 'Align your perfect smile', taglineAr: 'قوّم ابتسامتك المثالية' },
  cosmetic:       { label: 'Cosmetic Dentistry', labelAr: 'تجميل الأسنان', icon: '✨', tagline: 'Transform your smile', taglineAr: 'حوّل ابتسامتك' },
  periodontics:   { label: 'Periodontics', labelAr: 'أمراض اللثة', icon: '🩺', tagline: 'Healthy gums, healthy life', taglineAr: 'لثة صحية، حياة صحية' },
  prosthodontics: { label: 'Prosthodontics', labelAr: 'التعويضات السنية', icon: '🦴', tagline: 'Restore function and beauty', taglineAr: 'استعادة الوظيفة والجمال' },
  emergency:      { label: 'Emergency Dental', labelAr: 'طوارئ الأسنان', icon: '🚨', tagline: '24/7 emergency care', taglineAr: 'رعاية طارئة على مدار الساعة' },
};

// ─── Narrative Formulas ────────────────────────────────────────────────────

export const NARRATIVE_FORMULAS: Record<
  NarrativeFormula,
  { label: string; desc: string; phases: string[] }
> = {
  aidaClassic: {
    label: 'AIDA Classic',
    desc: 'Attention → Interest → Desire → Action',
    phases: ['Hook', 'Problem', 'Solution', 'Proof', 'CTA'],
  },
  emotionalStory: {
    label: 'Emotional Story',
    desc: 'Connect through empathy and transformation',
    phases: ['Pain Point', 'Empathy', 'Journey', 'Transformation', 'Invitation'],
  },
  growthHacking: {
    label: 'Growth Hacking',
    desc: 'Data-driven authority and social proof',
    phases: ['Stats Hook', 'Authority', 'Case Study', 'Results', 'Urgency CTA'],
  },
  authorityPositioning: {
    label: 'Authority Positioning',
    desc: 'Establish expert credibility fast',
    phases: ['Credential Hook', 'Expertise', 'Differentiator', 'Testimonial', 'Book Now'],
  },
};

// ─── Color Themes ──────────────────────────────────────────────────────────

export const COLOR_THEMES: Record<
  ColorTheme,
  { label: string; bg: string; accent: string; text: string; card: string; border: string }
> = {
  minimalLight:        { label: 'Minimal Light',       bg: '#F8F9FA', accent: '#1A73E8', text: '#1A1A2E',  card: '#FFFFFF', border: '#E0E0E0' },
  elegantDark:         { label: 'Elegant Dark',         bg: '#0D0D0D', accent: '#C9A84C', text: '#F5F5F5',  card: '#1A1A1A', border: '#2D2D2D' },
  royalBlue:           { label: 'Royal Blue',           bg: '#0A1628', accent: '#4A9EFF', text: '#E8F0FE',  card: '#122240', border: '#1E3A5F' },
  forestGreen:         { label: 'Forest Green',         bg: '#0A1E0A', accent: '#4CAF50', text: '#E8F5E9',  card: '#0F2A0F', border: '#1B5E20' },
  warmCoral:           { label: 'Warm Coral',           bg: '#FFF8F5', accent: '#E8450A', text: '#2D1A14',  card: '#FFFFFF', border: '#FFD5C5' },
  slateGray:           { label: 'Slate Gray',           bg: '#1C1F26', accent: '#6B9BCC', text: '#CBD5E0',  card: '#252930', border: '#374151' },
  goldPremium:         { label: 'Gold Premium',         bg: '#1A1200', accent: '#D4AF37', text: '#FFF9E6',  card: '#221900', border: '#3D3000' },
  oceanTeal:           { label: 'Ocean Teal',           bg: '#021B1B', accent: '#00B4D8', text: '#E0F7F7',  card: '#032828', border: '#054040' },
  carbonBlack:         { label: 'Carbon Black',         bg: '#050505', accent: '#FF4444', text: '#F0F0F0',  card: '#0F0F0F', border: '#1A1A1A' },
  snowWhite:           { label: 'Snow White',           bg: '#FFFFFF', accent: '#2563EB', text: '#111827',  card: '#F9FAFB', border: '#E5E7EB' },
};

// ─── Animation Labels ──────────────────────────────────────────────────────

export const ANIMATION_LABELS: Record<AnimationType, { label: string; desc: string }> = {
  cinematicSlide:  { label: 'Cinematic Slide',  desc: 'Smooth horizontal pan' },
  maskReveal:      { label: 'Mask Reveal',      desc: 'Text wipes in from a mask' },
  elasticBounce:   { label: 'Elastic Bounce',   desc: 'Springy entrance pop' },
  scalePop:        { label: 'Scale Pop',        desc: 'Zoom-in power entrance' },
  fadeUp:          { label: 'Fade Up',          desc: 'Subtle upward fade' },
  glitchReveal:    { label: 'Glitch Reveal',    desc: 'Digital distortion intro' },
  typewriter:      { label: 'Typewriter',       desc: 'Character-by-character reveal' },
  splitFlap:       { label: 'Split Flap',       desc: 'Airport board flip effect' },
};

export const TRANSITION_LABELS: Record<TransitionType, { label: string }> = {
  crossfade: { label: 'Crossfade' },
  swipeLeft: { label: 'Swipe Left' },
  swipeUp:   { label: 'Swipe Up' },
  zoomIn:    { label: 'Zoom In' },
  flash:     { label: 'Flash Cut' },
  wipe:      { label: 'Wipe' },
};

export const BG_EFFECT_LABELS: Record<BackgroundEffect, { label: string }> = {
  particles: { label: 'Particles' },
  gradient:  { label: 'Gradient Pulse' },
  noise:     { label: 'Film Noise' },
  grid:      { label: 'Grid Lines' },
  clean:     { label: 'Clean' },
};

// ─── Default Slides ────────────────────────────────────────────────────────

export function generateDefaultSlides(
  narrative: NarrativeFormula,
  specialty: SpecialtyTemplate,
  doctorName: string,
  clinicName: string
): StorySlide[] {
  const phases = NARRATIVE_FORMULAS[narrative].phases;
  const spec = SPECIALTY_TEMPLATES[specialty];

  const templates: Record<string, { headline: string; subtext: string }> = {
    Hook:             { headline: `Still invisible online?`, subtext: `${spec.tagline} — patients are searching for you right now.` },
    Problem:          { headline: `The problem is clear`, subtext: `87% of patients choose the first dentist they find on Google.` },
    Solution:         { headline: `There's a better way`, subtext: `A professional reel puts you on Page 1 within 48 hours.` },
    Proof:            { headline: `Proven results`, subtext: `500+ dentists in Egypt already growing with PortfolioHubs.` },
    CTA:              { headline: `Ready to grow?`, subtext: `Book your free strategy call — limited spots available.` },
    'Pain Point':     { headline: `Patients can't find you`, subtext: `Every day without a profile is a lost opportunity.` },
    Empathy:          { headline: `We understand your struggle`, subtext: `You're an expert — your online presence should reflect that.` },
    Journey:          { headline: `Your transformation starts here`, subtext: `From invisible to unmissable in just one week.` },
    Transformation:   { headline: `Look at the difference`, subtext: `Clinics using our reels see 3× more new patient calls.` },
    Invitation:       { headline: `Join the movement`, subtext: `dr. ${doctorName || 'Your Name'} · ${clinicName || 'Your Clinic'} · Growing.` },
    'Stats Hook':     { headline: `93% of dentists are losing patients`, subtext: `Because they don't show up when it matters.` },
    Authority:        { headline: `${clinicName || 'Your Clinic'} — the trusted name`, subtext: `Years of expertise. Hundreds of smiles restored.` },
    'Case Study':     { headline: `Real patient. Real results.`, subtext: `From pain to perfect smile — in 3 visits.` },
    Results:          { headline: `The numbers speak`, subtext: `+240% online visibility. +180% new bookings in 90 days.` },
    'Urgency CTA':    { headline: `Only 5 spots left this month`, subtext: `Get your reel now — before your competitor does.` },
    'Credential Hook':{ headline: `dr. ${doctorName || 'Name'} — Top-rated specialist`, subtext: `${spec.label} · Trusted by hundreds of patients.` },
    Expertise:        { headline: `${spec.tagline}`, subtext: `Advanced training. Modern technology. Exceptional care.` },
    Differentiator:   { headline: `Why choose ${clinicName || 'us'}?`, subtext: `Same-day appointments. Pain-free treatment. Guaranteed results.` },
    Testimonial:      { headline: `"Life-changing experience"`, subtext: `— Real patient, ${clinicName || 'our clinic'}` },
    'Book Now':       { headline: `Your best smile awaits`, subtext: `Call now and mention this reel for a free consultation.` },
  };

  return phases.map((phase, i) => {
    const tpl = templates[phase] ?? { headline: phase, subtext: `Slide ${i + 1} content here.` };
    return {
      id: `slide-${i}`,
      phase,
      headline: tpl.headline,
      subtext: tpl.subtext,
      duration: 3,
    };
  });
}
