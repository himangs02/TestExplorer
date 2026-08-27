import { 
  Layers, 
  GraduationCap, 
  BookOpen, 
  Atom, 
  Stethoscope, 
  Scale, 
  Calculator, 
  Brain, 
  Code, 
  Sparkles, 
  Trophy, 
  Briefcase, 
  Music, 
  Heart, 
  Activity, 
  Compass, 
  Feather, 
  Flame, 
  Target, 
  Zap, 
  Globe, 
  ShieldCheck, 
  Award,
  LucideIcon
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  Layers,
  GraduationCap,
  BookOpen,
  Atom,
  Stethoscope,
  Scale,
  Calculator,
  Brain,
  Code,
  Sparkles,
  Trophy,
  Briefcase,
  Music,
  Heart,
  Activity,
  Compass,
  Feather,
  Flame,
  Target,
  Zap,
  Globe,
  ShieldCheck,
  Award,
};

export function getCategoryIcon(key?: string | null): LucideIcon {
  if (!key) return Layers;
  return ICON_MAP[key] || Layers;
}
