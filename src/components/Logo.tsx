type LogoVariant = "mark" | "lockup";
type LogoTone = "brand" | "white";

const FILES: Record<LogoVariant, string> = {
  mark: "logo-mark.png",
  lockup: "logo-lockup.png",
};

/**
 * Cadi 브랜드 로고.
 * - variant "mark": 행어 심볼만. 좁은 헤더/네비게이션용.
 * - variant "lockup": 심볼 + 워드마크 세로 조합. 스플래시/히어로용.
 * - tone "white": 어두운 배경 위에서 흰색 단색으로 표시.
 *
 * 경로 앞에 BASE_URL을 붙이는 이유: JSX에 문자열로 적은 "/logo-mark.png"는
 * Vite가 빌드 시 재작성하지 않는다. GitHub Pages처럼 하위 경로(/cadi-app/)로
 * 서빙되면 그대로 도메인 루트를 가리켜 404가 난다. BASE_URL은 dev에서 "/",
 * 빌드에서 "/cadi-app/"이 되므로 양쪽 모두에서 올바르게 해석된다.
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
      src={`${import.meta.env.BASE_URL}${FILES[variant]}`}
      alt="Cadi"
      className={`${tone === "white" ? "brightness-0 invert" : ""} ${className}`.trim()}
    />
  );
}
