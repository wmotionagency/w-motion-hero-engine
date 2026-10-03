import { HeroShell } from "@/wmotion/components/HeroShell";
import { halleMilanoHero } from "@/wmotion/projects/halle-milano/hero";

export default function HalleMilanoHeroTestPage() {
  return <HeroShell spec={halleMilanoHero} debug={false} />;
}
