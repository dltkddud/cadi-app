import { Logo } from "@/components/Logo";

export function LandingOpening({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="relative flex h-full flex-col items-center justify-between overflow-hidden bg-neutral-900 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-neutral-700 blur-3xl" />
        <div className="absolute -right-16 bottom-24 h-80 w-80 rounded-full bg-neutral-800 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full items-center justify-center pt-6">
        <Logo variant="mark" tone="white" className="h-5 w-auto opacity-80" />
      </div>

      <div className="relative z-10 flex flex-col items-center px-8 text-center">
        <div className="mb-8 flex h-44 w-44 items-center justify-center overflow-hidden rounded-3xl bg-white p-6 shadow-2xl">
          <Logo variant="lockup" className="h-full w-auto object-contain" />
        </div>
        <h1 className="text-3xl font-bold leading-tight tracking-tight">
          나의 옷장에서<br />시작하는 스타일링
        </h1>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-neutral-300">
          보유한 의류 사진을 등록하면 AI가 상황에 맞는 착장과 어울리는 MCM 가방을 추천해드려요.
        </p>

        <div className="mt-10 flex items-center gap-3 text-neutral-400">
          <span className="h-px w-8 bg-neutral-600" />
          <span className="text-[11px] tracking-[0.2em]">AI STYLIST</span>
          <span className="h-px w-8 bg-neutral-600" />
        </div>
      </div>

      <div className="relative z-10 w-full px-6 pb-10">
        <button
          onClick={onEnter}
          className="w-full rounded-2xl bg-white py-4 text-base font-bold text-neutral-900 transition hover:bg-neutral-100"
        >
          시작하기
        </button>
        <p className="mt-4 text-center text-[11px] leading-relaxed text-neutral-500">
          가입하여 나만의 옷장을 구성하고<br />AI 스타일링 추천을 받아보세요
        </p>
      </div>
    </div>
  );
}
