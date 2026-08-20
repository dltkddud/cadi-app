type LogoVariant = "mark" | "lockup";
type LogoTone = "brand" | "white";

const SOURCES: Record<LogoVariant, string> = {
  mark: "/logo-mark.png",
  lockup: "/logo-lockup.png",
};

/**
 * Cadi 브랜드 로고.
 * - variant "mark": 행어 심볼만. 좁은 헤더/네비게이션용.
 * - variant "lockup": 심볼 + 워드마크 세로 조합. 스플래시/히어로용.
 * - tone "white": 어두운 배경 위에서 흰색 단색으로 표시.
 */
export function Logo({
  variant = "lockup",
  tone = "brand",
  className = "",
}: {
  variant?: LogoVariant;
  tone?: LogoTone;
  className?: string;
}) {
  return (
    <img
      src={SOURCES[variant]}
      alt="Cadi"
      className={`${tone === "white" ? "brightness-0 invert" : ""} ${className}`.trim()}
    />
  );
}
