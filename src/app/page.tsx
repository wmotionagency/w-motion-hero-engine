import { HeroShell } from "@/wmotion/components/HeroShell";
import { demoHero } from "@/wmotion/configs/demo.hero";

export default function Home() {
  return <HeroShell spec={demoHero} />;
}
