export type AnimationType =
  | 'cinematicSlide'
  | 'maskReveal'
  | 'elasticBounce'
  | 'scalePop'
  | 'fadeUp'
  | 'glitchReveal'
  | 'typewriter'
  | 'splitFlap';

export type TransitionType =
  | 'crossfade'
  | 'swipeLeft'
  | 'swipeUp'
  | 'zoomIn'
  | 'flash'
  | 'wipe';

export type BackgroundEffect =
  | 'particles'
  | 'gradient'
  | 'noise'
  | 'grid'
  | 'clean';

export type ColorTheme =
  | 'minimalLight'
  | 'elegantDark'
  | 'royalBlue'
  | 'forestGreen'
  | 'warmCoral'
  | 'slateGray'
  | 'goldPremium'
  | 'oceanTeal'
  | 'carbonBlack'
  | 'snowWhite';

export type NarrativeFormula =
  | 'aidaClassic'
  | 'emotionalStory'
  | 'growthHacking'
  | 'authorityPositioning';

export type SpecialtyTemplate =
  | 'generalDentist'
  | 'endodontics'
  | 'pediatrics'
  | 'surgery'
  | 'implants'
  | 'orthodontics'
  | 'cosmetic'
  | 'periodontics'
  | 'prosthodontics'
  | 'emergency';

export type Language = 'en' | 'ar';

export interface StorySlide {
  id: string;
  phase: string;
  headline: string;
  subtext: string;
  duration: number; // seconds
}

export interface ReelConfig {
  specialty: SpecialtyTemplate;
  narrative: NarrativeFormula;
  colorTheme: ColorTheme;
  animation: AnimationType;
  transition: TransitionType;
  bgEffect: BackgroundEffect;
  language: Language;
  doctorName: string;
  clinicName: string;
  city: string;
  phone: string;
  slides: StorySlide[];
}

export type Step = 'template' | 'customize' | 'config' | 'preview';
