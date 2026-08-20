import { useState } from "react";
import { ArrowLeft, Check, ChevronDown, Image as ImageIcon, RefreshCw } from "lucide-react";
import { analyzeClosetImage, CATEGORY_OPTIONS, SEASON_OPTIONS } from "@/services/ai";
import type { ClosetAttributes, ClosetItem, ClosetCategory, Season } from "@/types";

const CATEGORY_LABELS: Record<ClosetCategory, string> = {
  Top: "상의",
  Bottom: "하의",
  Outerwear: "아우터",
  Shoes: "신발",
  Bag: "가방",
  Accessory: "액세서리",
};

const SEASON_LABELS: Record<Season, string> = {
  Spring: "봄",
  Summer: "여름",
  Fall: "가을",
  Winter: "겨울",
  "All-Season": "사계절",
};

type UploadScreen = "upload" | "error" | "analyzing" | "edit";

export function ClosetUploadFlow({ onBack, onSaved }: { onBack: () => void; onSaved: (item: ClosetItem) => void }) {
  const [screen, setScreen] = useState<UploadScreen>("upload");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [attributes, setAttributes] = useState<ClosetAttributes | null>(null);
  const [errorReason, setErrorReason] = useState("");

  const handleFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!file.type.includes("jpeg") && !file.type.includes("png")) {
      setErrorReason("JPG, PNG 형식의 사진만 등록할 수 있습니다.");
      setScreen("error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorReason("사진 파일은 10MB 이하만 등록할 수 있습니다.");
      setScreen("error");
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      setErrorReason("사진을 읽지 못했습니다. 파일을 확인한 뒤 다시 시도해주세요.");
      setScreen("error");
    };
    reader.onload = () => {
      setImageDataUrl(String(reader.result));
      setFileName(file.name.replace(/\.[^/.]+$/, ""));
    };
    reader.readAsDataURL(file);
  };

  const startAnalysis = async () => {
    if (!imageDataUrl) return;
    setScreen("analyzing");
    const result = await analyzeClosetImage(imageDataUrl);
    setAttributes(result);
    setScreen("edit");
  };

  const updateAttributes = <K extends keyof ClosetAttributes>(key: K, value: ClosetAttributes[K]) => {
    setAttributes((current) => current ? { ...current, [key]: value } : current);
  };

  const saveItem = () => {
    if (!attributes || !imageDataUrl) return;
    onSaved({ ...attributes, id: `closet_${Date.now()}`, imageDataUrl });
  };

  if (screen === "error") {
    return <FlowShell title="업로드 오류 안내 화면" onBack={onBack}><div className="flex flex-1 flex-col items-center pt-8 text-center"><h1 className="text-2xl font-bold">업로드 실패</h1><p className="mt-3 text-sm text-neutral-400">{errorReason}</p><div className="mt-8 w-full rounded-xl border border-neutral-200 p-5 text-left"><p className="mb-3 text-sm font-semibold text-neutral-500">확인 사항</p><ul className="space-y-3 text-xs leading-relaxed text-neutral-400"><li>• JPG, PNG 형식만 지원됩니다</li><li>• 파일 크기는 10MB 이하여야 합니다</li><li>• 인터넷 연결을 확인해주세요</li></ul></div><div className="mt-6 w-full space-y-3"><button onClick={() => setScreen("upload")} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 py-3.5 text-base font-semibold text-white"><RefreshCw size={17} /> 다시 시도</button><button onClick={onBack} className="w-full rounded-xl border border-neutral-300 py-3.5 text-base font-semibold">돌아가기</button></div></div></FlowShell>;
  }

  if (screen === "analyzing") {
    return <FlowShell title="AI 분석 진행 화면" onBack={onBack}><div className="flex flex-1 flex-col items-center pt-10 text-center"><h1 className="text-2xl font-bold">의류 정보 분석 중</h1><p className="mt-3 text-sm text-neutral-400">AI가 업로드한 의류를 분석하고 있습니다</p><div className="relative mt-7 h-48 w-36 overflow-hidden rounded-xl bg-neutral-100"><img src={imageDataUrl} alt="분석 중인 의류" className="h-full w-full object-cover opacity-70" /><div className="absolute inset-x-0 top-0 h-1 bg-neutral-800 shadow-[0_0_16px_4px_rgba(0,0,0,0.25)] animate-[scan_1.8s_ease-in-out_infinite]" /></div><div className="mt-7 space-y-3 text-sm text-neutral-400"><p className="animate-pulse">카테고리 분석</p><p className="animate-pulse [animation-delay:200ms]">색상 분석</p><p className="animate-pulse [animation-delay:400ms]">스타일 분석</p><p className="animate-pulse [animation-delay:600ms]">계절 정보 분석</p></div></div></FlowShell>;
  }

  if (screen === "edit" && attributes) {
    return <FlowShell title="의류 정보 확인·수정" onBack={onBack}><div className="space-y-5"><div><h1 className="text-2xl font-bold">의류 정보 확인·수정</h1><p className="mt-2 text-sm text-neutral-400">AI가 분석한 정보를 확인하고 필요한 항목을 수정해주세요.</p></div><img src={imageDataUrl} alt="등록할 의류" className="h-60 w-full rounded-xl bg-neutral-100 object-cover" /><SelectField label="카테고리" value={CATEGORY_LABELS[attributes.category]} options={CATEGORY_OPTIONS.map((value) => ({ value, label: CATEGORY_LABELS[value] }))} onChange={(value) => updateAttributes("category", value as ClosetCategory)} /><label className="block"><span className="mb-2 block text-sm font-medium text-neutral-500">세부 카테고리</span><input value={attributes.sub_category} onChange={(event) => updateAttributes("sub_category", event.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-neutral-500">색상</span><input value={attributes.primary_color} onChange={(event) => updateAttributes("primary_color", event.target.value)} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black" /></label><label className="block"><span className="mb-2 block text-sm font-medium text-neutral-500">스타일</span><input value={attributes.style.join(", ")} onChange={(event) => updateAttributes("style", event.target.value.split(",").map((value) => value.trim()).filter(Boolean))} className="w-full rounded-xl border border-neutral-200 px-4 py-3 text-sm outline-none focus:border-black" /></label><div><span className="mb-2 block text-sm font-medium text-neutral-500">계절</span><div className="flex flex-wrap gap-2">{SEASON_OPTIONS.filter((season) => season !== "All-Season").map((season) => { const selected = attributes.season.includes(season); return <button key={season} onClick={() => updateAttributes("season", selected ? attributes.season.filter((value) => value !== season) : [...attributes.season, season])} className={`rounded-full border px-4 py-2 text-xs font-medium ${selected ? "border-black bg-black text-white" : "border-neutral-200"}`}>{SEASON_LABELS[season]}</button>; })}</div></div><p className="text-xs text-neutral-400">* AI 분석 결과는 참고용이며 실제 의류와 다를 수 있습니다.</p><button onClick={saveItem} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 py-3.5 text-base font-semibold text-white"><Check size={18} /> 저장하고 옷장에 반영하기</button></div></FlowShell>;
  }

  return <FlowShell title="의류 사진 업로드" onBack={onBack}><div className="space-y-5"><h1 className="text-2xl font-bold">사진 업로드</h1><div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-dashed border-neutral-300 bg-neutral-100">{imageDataUrl ? <img src={imageDataUrl} alt="선택한 의류" className="h-full w-full object-cover" /> : <div className="text-center text-neutral-400"><ImageIcon size={32} className="mx-auto mb-2 stroke-[1.3]" /><p className="text-sm">의류 사진 미리보기</p></div>}</div>{imageDataUrl ? <p className="truncate text-sm text-neutral-500">{fileName}</p> : <p className="text-sm text-neutral-400">등록할 의류 사진을 선택해 주세요</p>}<p className="text-sm text-neutral-400">AI가 카테고리, 색상, 스타일, 계절 정보를 자동으로 분석합니다.</p><label className="block w-full cursor-pointer rounded-xl border border-neutral-300 py-3.5 text-center text-base font-semibold"><input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />사진 선택하기</label><div className="space-y-2 text-xs leading-relaxed text-neutral-400"><p className="font-semibold text-neutral-500">업로드 안내</p><p>선명하게 촬영한 단품 사진을 권장합니다</p><p>배경이 단순할수록 분석 정확도가 높아집니다</p><p>분석 결과는 등록 후 직접 수정할 수 있습니다</p></div><button disabled={!imageDataUrl} onClick={startAnalysis} className={`w-full rounded-xl py-3.5 text-base font-semibold text-white ${imageDataUrl ? "bg-neutral-800" : "cursor-not-allowed bg-neutral-200 text-neutral-400"}`}>AI 분석 시작</button><button onClick={() => { setErrorReason("사진을 업로드하지 못했습니다."); setScreen("error"); }} className="text-left text-sm font-medium text-neutral-500 underline underline-offset-4">업로드 오류가 발생했나요?</button></div></FlowShell>;
}

function FlowShell({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) {
  return <div className="flex h-full flex-col"><header className="relative flex h-14 shrink-0 items-center justify-center border-b border-neutral-100"><button onClick={onBack} className="absolute left-5 text-neutral-700"><ArrowLeft size={22} /></button><span className="font-bold">{title}</span></header><main className="flex-1 overflow-y-auto p-5 pb-8">{children}</main></div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: { value: string; label: string }[]; onChange: (value: string) => void }) {
  return <label className="block"><span className="mb-2 block text-sm font-medium text-neutral-500">{label}</span><div className="relative"><select value={options.find((option) => option.label === value)?.value} onChange={(event) => onChange(event.target.value)} className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm outline-none focus:border-black">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><ChevronDown size={17} className="pointer-events-none absolute right-4 top-3.5 text-neutral-400" /></div></label>;
}
