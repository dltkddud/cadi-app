import { useState } from "react";
import { ChevronLeft, CheckSquare, Square } from "lucide-react";
import { Logo } from "@/components/Logo";

type Screen = "landing" | "login" | "signup" | "consent";

export function Onboarding({ onComplete }: { onComplete: () => void }) {
  const [screen, setScreen] = useState<Screen>("landing");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree1, setAgree1] = useState(true);
  const [agree2, setAgree2] = useState(true);
  const [agree3, setAgree3] = useState(false);

  const Header = ({ label, onBack }: { label: string; onBack: () => void }) => (
    <div className="relative flex items-center justify-center py-2 border-b border-neutral-100 mb-6">
      <button onClick={onBack} className="absolute left-0 text-neutral-700">
        <ChevronLeft size={24} />
      </button>
      <span className="font-bold text-base">{label}</span>
    </div>
  );

  const ConsentItem = ({
    title, desc, agreed, onToggle,
  }: {
    title: string; desc: string; agreed: boolean; onToggle: () => void;
  }) => (
    <div className="p-4 border border-neutral-200 rounded-xl space-y-3">
      <div>
        <h4 className="text-xs font-bold text-neutral-700 mb-1">{title}</h4>
        <p className="text-[11px] text-neutral-400 leading-normal">{desc}</p>
      </div>
      <button onClick={onToggle} className="flex items-center gap-2 text-xs font-medium text-neutral-700">
        {agreed ? <CheckSquare size={18} className="fill-neutral-800 text-white" /> : <Square size={18} className="text-neutral-300" />}
        위 항목에 동의합니다
      </button>
    </div>
  );

  return (
    <div className="flex flex-col h-full">
      {/* ================= 1. 랜딩 / 서비스 소개 화면 ================= */}
      {screen === "landing" && (
        <div className="flex flex-col justify-between h-full p-6">
          <div className="text-center font-bold text-base py-2 border-b border-neutral-100">
            랜딩/서비스 소개 화면
          </div>

          <div className="my-auto space-y-6">
            <div className="w-full h-64 rounded-2xl overflow-hidden bg-neutral-100 flex items-center justify-center p-8">
              <Logo variant="lockup" className="h-full w-auto object-contain" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-2">나의 옷장에서 시작하는 스타일링</h1>
              <p className="text-sm text-neutral-500 leading-relaxed">
                보유한 의류 사진을 등록하면 Cadi가 당신에게 맞는 착장을 제안합니다.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-xl space-y-1">
              <h3 className="font-bold text-base">AI 착장 추천</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                착용 장소, 방문 목적, 날씨, 시간대를 입력하면 보유 의류 조합을 추천합니다.
              </p>
            </div>

            <div className="p-4 border border-neutral-200 rounded-xl space-y-1">
              <h3 className="font-bold text-base">추천 근거와 럭셔리 제품 탐색</h3>
              <p className="text-xs text-neutral-500 leading-normal">
                의류별 선택 이유와 스타일링 방향을 확인하고 어울리는 MCM 제품 페이지로 이동할 수 있습니다.
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={() => setScreen("signup")}
              className="w-full bg-neutral-800 hover:bg-black text-white font-medium py-3.5 rounded-xl text-base transition-colors"
            >
              개인 옷장 시작하기
            </button>
            <div className="text-center">
              <button
                onClick={() => setScreen("login")}
                className="text-xs text-neutral-500 underline underline-offset-4 hover:text-black"
              >
                이미 계정이 있으신가요? <span className="font-bold text-neutral-800">로그인</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 2. 로그인 화면 ================= */}
      {screen === "login" && (
        <div className="flex flex-col h-full p-6">
          <Header label="로그인 화면" onBack={() => setScreen("landing")} />

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">로그인</h2>
              <p className="text-xs text-neutral-400">Cadi 계정으로 로그인하세요</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">이메일</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">비밀번호</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:border-black text-sm"
                />
              </div>
            </div>

            <button
              onClick={onComplete}
              className="w-full bg-neutral-800 hover:bg-black text-white font-medium py-3.5 rounded-xl text-base transition-colors"
            >
              로그인
            </button>

            <div className="text-center text-xs text-neutral-400">
              계정이 없으신가요?{" "}
              <button onClick={() => setScreen("signup")} className="font-bold text-neutral-800 underline underline-offset-2 ml-1">
                회원가입
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3. 회원가입 화면 ================= */}
      {screen === "signup" && (
        <div className="flex flex-col h-full p-6">
          <Header label="회원가입 화면" onBack={() => setScreen("landing")} />

          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">회원가입</h2>
              <p className="text-xs text-neutral-400">Cadi 계정을 만들어 나만의 스타일링을 시작하세요.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">이메일</label>
                <input type="email" className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">비밀번호</label>
                <input type="password" className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">비밀번호 확인</label>
                <input type="password" className="w-full p-3 border border-neutral-200 rounded-xl outline-none focus:border-black text-sm" />
              </div>
              <p className="text-[11px] text-neutral-400">비밀번호는 8자 이상, 영문·숫자를 포함해야 합니다.</p>
            </div>

            <button
              onClick={() => setScreen("consent")}
              className="w-full bg-neutral-800 hover:bg-black text-white font-medium py-3.5 rounded-xl text-base transition-colors"
            >
              회원가입
            </button>
          </div>
        </div>
      )}

      {/* ================= 4. 데이터 활용 동의 화면 ================= */}
      {screen === "consent" && (
        <div className="flex flex-col justify-between h-full p-6">
          <div>
            <Header label="데이터 활용 동의 화면" onBack={() => setScreen("signup")} />

            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold mb-1">데이터 활용 동의</h2>
                <p className="text-xs text-neutral-400">Cadi는 더 나은 스타일링 추천을 위해 아래 정보를 수집·활용합니다.</p>
              </div>

              <ConsentItem
                title="의류 사진 수집 및 분석 (필수)"
                desc="등록하신 의류 사진은 AI 카테고리·색상·스타일 분석에 사용됩니다. 분석된 정보는 개인 옷장 구성 및 착장 추천에 활용됩니다."
                agreed={agree1}
                onToggle={() => setAgree1(!agree1)}
              />
              <ConsentItem
                title="스타일링 상황 데이터 활용 (필수)"
                desc="입력하신 착용 장소, 날씨, 시간대 등 스타일링 상황 정보는 AI 착장 추천 생성에 사용됩니다."
                agreed={agree2}
                onToggle={() => setAgree2(!agree2)}
              />
              <ConsentItem
                title="MCM 제품 추천 연동 (선택)"
                desc="보유 의류와 스타일 데이터를 바탕으로 관련 MCM 제품을 추천하는데 활용됩니다. 동의하지 않아도 기본 스타일링 서비스는 이용 가능합니다."
                agreed={agree3}
                onToggle={() => setAgree3(!agree3)}
              />
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <p className="text-[10px] text-neutral-400 text-center leading-tight">
              수집된 데이터는 서비스 제공 목적 외에 사용되지 않습니다.<br />
              언제든지 내 데이터 메뉴에서 등록 정보를 삭제할 수 있습니다.
            </p>
            <button
              disabled={!agree1 || !agree2}
              onClick={onComplete}
              className={`w-full font-medium py-3.5 rounded-xl text-base transition-colors ${
                agree1 && agree2 ? "bg-neutral-800 hover:bg-black text-white" : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              동의하고 옷장 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
