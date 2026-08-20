import { useState } from "react";
import { Onboarding } from "@/components/Onboarding";
import { LandingOpening } from "@/components/LandingOpening";
import StylingApp from "@/MainService";

type Stage = "landing" | "onboarding" | "app";

export default function App() {
  const [stage, setStage] = useState<Stage>("landing");

  return (
    <div className="min-h-screen bg-neutral-200 flex items-center justify-center py-6 px-4">
      <div className="w-full max-w-[390px] h-[844px] bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-neutral-300 relative text-neutral-900">
        {stage === "landing" && <LandingOpening onEnter={() => setStage("onboarding")} />}
        {stage === "onboarding" && <Onboarding onComplete={() => setStage("app")} />}
        {stage === "app" && <StylingApp />}
      </div>
    </div>
  );
}
