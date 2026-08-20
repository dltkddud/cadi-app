export function Chip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
        selected ? "bg-black text-white border-black" : "bg-white text-black border-neutral-200"
      }`}
    >
      {label}
    </button>
  );
}

export function PrimaryButton({
  label, onClick, disabled, loading,
}: {
  label: string; onClick: () => void; disabled?: boolean; loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-md py-3.5 text-base font-semibold text-white bg-black transition-opacity ${
        disabled ? "opacity-40" : "opacity-100 active:opacity-80"
      }`}
    >
      {loading ? "생성 중..." : label}
    </button>
  );
}

export function ScreenHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mt-4 mb-5">
      <p className="text-xs font-bold tracking-widest text-neutral-500 mb-1">{eyebrow}</p>
      <h1 className="text-2xl font-bold text-black mb-1">{title}</h1>
      {subtitle && <p className="text-sm text-neutral-500 leading-relaxed">{subtitle}</p>}
    </div>
  );
}
