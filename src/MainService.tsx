import { useEffect, useState } from "react";
import { Database, Plus, RefreshCw, Shirt, Sparkles, X } from "lucide-react";
import { generateStyling, QUICK_TAGS } from "@/services/ai";
import { supabase } from "@/lib/supabase";
import type { ClosetItem, StylingRecommendation } from "@/types";
import { CATALOG } from "@/services/ai";
import { Chip, PrimaryButton, ScreenHeader } from "@/components/ui";
import { ClosetUploadFlow } from "@/components/ClosetUploadFlow";

type Tab = "closet" | "styling" | "data";
type ClosetFilter = "전체" | "상의" | "하의" | "아우터" | "기타";
type ClothesItem = { id: string; category: string; name: string; imageUrl: string };

const CLOSET_FILTERS: ClosetFilter[] = ["전체", "상의", "하의", "아우터", "기타"];

const SAMPLE_CLOTHES: ClothesItem[] = [
  { id: "sample-1", category: "아우터", name: "블랙 캐시미어 코트", imageUrl: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=600&q=80" },
  { id: "sample-2", category: "상의", name: "화이트 셔츠", imageUrl: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&q=80" },
  { id: "sample-3", category: "하의", name: "슬림 슬랙스", imageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&q=80" },
  { id: "sample-4", category: "신발", name: "더비 슈즈", imageUrl: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=600&q=80" },
];

function toClosetItem(item: ClothesItem): ClosetItem {
  return {
    id: item.id,
    imageDataUrl: item.imageUrl,
    category: item.category === "아우터" ? "Outerwear" : item.category === "상의" ? "Top" : item.category === "하의" ? "Bottom" : "Shoes",
    sub_category: item.name,
    primary_color: "미정",
    style: ["데일리"],
    season: ["All-Season"],
    pattern: "무지",
  };
}

export default function StylingApp() {
  const [activeTab, setActiveTab] = useState<Tab>("data");
  const [clothesList, setClothesList] = useState<ClothesItem[]>(SAMPLE_CLOTHES);
  const [deleteTarget, setDeleteTarget] = useState<ClothesItem | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [recommendation, setRecommendation] = useState<StylingRecommendation | null>(null);
  const [showUploadFlow, setShowUploadFlow] = useState(false);
  const [stylingError, setStylingError] = useState("");
  const [closetFilter, setClosetFilter] = useState<ClosetFilter>("전체");

  useEffect(() => {
    const loadClothes = async () => {
      const { data, error } = await supabase.from("closet_items").select("id, category, name, image_url").order("created_at", { ascending: false });
      if (error) {
        setErrorMessage("옷장 데이터를 불러오지 못했습니다. 샘플 화면을 보여드려요.");
      } else if (data && data.length > 0) {
        setClothesList(data.map((item) => ({ id: item.id, category: item.category, name: item.name, imageUrl: item.image_url })));
      }
      setIsLoading(false);
    };
    void loadClothes();
  }, []);

  const handleSavedFromUpload = async (item: ClosetItem) => {
    const categoryLabel = item.category === "Outerwear" ? "아우터" : item.category === "Top" ? "상의" : item.category === "Bottom" ? "하의" : item.category === "Shoes" ? "신발" : item.category === "Bag" ? "가방" : "액세서리";
    const newItem: ClothesItem = { id: item.id, category: categoryLabel, name: item.sub_category, imageUrl: item.imageDataUrl };
    setClothesList((current) => [newItem, ...current]);
    setShowUploadFlow(false);
    const { error } = await supabase.from("closet_items").insert({ id: newItem.id, category: newItem.category, name: newItem.name, image_url: newItem.imageUrl });
    if (error) setErrorMessage("사진은 화면에 추가했지만 저장하지 못했습니다.");
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    setClothesList((current) => current.filter((item) => item.id !== deleteTarget.id));
    const { error } = await supabase.from("closet_items").delete().eq("id", deleteTarget.id);
    if (error) setErrorMessage("화면에서는 삭제했지만 저장된 데이터는 삭제하지 못했습니다.");
    setDeleteTarget(null);
  };

  const deleteAll = async () => {
    setClothesList([]);
    const { error } = await supabase.from("closet_items").delete().neq("id", "");
    if (error) setErrorMessage("화면에서는 삭제했지만 저장된 데이터를 모두 삭제하지 못했습니다.");
    setShowDeleteAllModal(false);
  };

  const createRecommendation = async () => {
    if (!prompt.trim() || clothesList.length === 0) return;
    setIsGenerating(true);
    setErrorMessage("");
    setStylingError("");
    setRecommendation(null);
    try {
      const result = await generateStyling(clothesList.map(toClosetItem), prompt.trim());
      setRecommendation(result);
    } catch {
      setStylingError("스타일링 추천을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (showUploadFlow) {
    return <ClosetUploadFlow onBack={() => setShowUploadFlow(false)} onSaved={handleSavedFromUpload} />;
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      <div className="flex-1 overflow-y-auto p-5 pb-24">
        {errorMessage && <div className="mb-4 rounded-xl bg-neutral-100 px-3 py-2 text-xs text-neutral-600">{errorMessage}</div>}
        {isLoading && <div className="py-16 text-center text-xs text-neutral-400">옷장을 불러오는 중입니다.</div>}

        {!isLoading && activeTab === "closet" && (
          <div className="space-y-5">
            <div className="-mx-5 -mt-5 border-b border-neutral-100 px-5 py-4 text-center text-base font-bold">개인 옷장</div>
            <div className="flex items-end justify-between border-b border-neutral-100 pb-4">
              <div>
                <p className="text-[10px] font-bold tracking-[0.22em] text-neutral-400">MY CLOSET</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">내 옷장</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setActiveTab("data")} className="text-sm font-medium text-neutral-500 underline underline-offset-4 transition hover:text-black">데이터 관리</button>
                <button onClick={() => setShowUploadFlow(true)} aria-label="의류 추가" className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-white transition hover:bg-black"><Plus size={17} /></button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {CLOSET_FILTERS.map((filter) => <button key={filter} onClick={() => setClosetFilter(filter)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition ${closetFilter === filter ? "border-neutral-800 bg-neutral-800 text-white" : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"}`}>{filter}</button>)}
            </div>

            {clothesList.length === 0 ? (
              <div className="space-y-2 py-20 text-center text-neutral-400"><Shirt size={40} className="mx-auto stroke-[1.2]" /><p className="text-sm">등록된 의류가 없습니다.</p><p className="text-xs">오른쪽 상단 + 버튼으로 사진을 등록해 보세요.</p></div>
            ) : clothesList.filter((item) => closetFilter === "전체" || (closetFilter === "기타" ? !["상의", "하의", "아우터"].includes(item.category) : item.category === closetFilter)).length === 0 ? (
              <div className="rounded-2xl border border-dashed border-neutral-200 py-16 text-center text-neutral-400"><Shirt size={34} className="mx-auto mb-3 stroke-[1.2]" /><p className="text-sm">이 카테고리에 등록된 의류가 없습니다.</p></div>
            ) : (
              <div className="space-y-4">
                {clothesList.filter((item) => closetFilter === "전체" || (closetFilter === "기타" ? !["상의", "하의", "아우터"].includes(item.category) : item.category === closetFilter)).map((item) => <ClosetCard key={item.id} item={item} />)}
              </div>
            )}
          </div>
        )}

        {!isLoading && activeTab === "styling" && (
          <div>
            <ScreenHeader eyebrow="AI STYLER" title="오늘의 스타일링" subtitle="상황을 알려주면 옷장과 MCM 가방을 조합해 추천해드려요." />
            {clothesList.length === 0 && <div className="mb-4 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm">먼저 옷장에 의류를 추가해주세요.</div>}
            <textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="예: 친구들과 저녁 먹는데 편하게 입고 싶어" className="min-h-28 w-full rounded-xl border border-neutral-200 px-3 py-3 text-sm outline-none focus:border-black" />
            <p className="mb-2 mt-4 text-xs font-medium text-neutral-500">빠른 추천</p>
            <div className="mb-5 flex flex-wrap gap-1.5">{QUICK_TAGS.map((tag) => <Chip key={tag} label={tag} selected={prompt === tag} onClick={() => setPrompt(tag)} />)}</div>
            <PrimaryButton label="AI 스타일링 생성하기" onClick={createRecommendation} disabled={!prompt.trim() || clothesList.length === 0 || isGenerating} loading={isGenerating} />
            {isGenerating && <StylingLoadingScreen />}
            {stylingError && !isGenerating && <StylingFailureScreen error={stylingError} onRetry={createRecommendation} onEditPrompt={() => { setStylingError(""); setPrompt(""); }} />}
            {recommendation && !isGenerating && !stylingError && <RecommendationCard recommendation={recommendation} clothes={clothesList} />}
          </div>
        )}

        {!isLoading && activeTab === "data" && (
          <div className="space-y-6">
            <div className="border-b border-neutral-100 py-2 text-center text-base font-bold">데이터 관리 화면</div>
            <div><h2 className="text-xl font-bold">데이터 관리</h2><h3 className="mb-1 mt-4 text-base font-bold text-neutral-800">의류 데이터 삭제</h3><p className="mb-4 text-xs text-neutral-400">옷장에 등록된 의류를 개별적으로 삭제할 수 있습니다.</p><div className="space-y-3">{["아우터", "상의", "하의", "신발"].map((category) => { const item = clothesList.find((clothes) => clothes.category === category); return <div key={category} className="flex items-center justify-between rounded-xl border border-neutral-200 p-4"><div><p className="mb-0.5 text-xs text-neutral-400">{category}</p><p className="text-sm font-bold text-neutral-800">{item?.name ?? "등록된 의류 없음"}</p></div><button disabled={!item} onClick={() => item && setDeleteTarget(item)} className={`rounded-lg px-4 py-2 text-xs font-bold ${item ? "bg-neutral-600 text-white hover:bg-neutral-800" : "cursor-not-allowed bg-neutral-200 text-neutral-400"}`}>삭제</button></div>; })}</div></div>
            <div className="pt-2"><h3 className="mb-3 text-base font-bold text-neutral-800">전체 데이터 삭제</h3><div className="space-y-4 rounded-xl border border-neutral-200 p-4"><div><p className="mb-2 text-xs font-bold text-neutral-400">삭제 범위 안내</p><p className="text-xs leading-relaxed text-neutral-500">등록된 모든 의류 사진, AI 분석 정보, 스타일링 기록이 삭제됩니다.</p><p className="mt-1 text-xs text-neutral-400">삭제된 데이터는 복구할 수 없습니다.</p></div><button onClick={() => setShowDeleteAllModal(true)} className="w-full rounded-xl bg-neutral-600 py-3 text-sm font-bold text-white hover:bg-neutral-800">전체 데이터 삭제</button></div></div>
          </div>
        )}
      </div>

      <nav className="absolute bottom-0 flex h-16 w-full items-center justify-around border-t border-neutral-200 bg-white px-4">
        <TabButton active={activeTab === "closet"} icon={<Shirt size={20} />} label="옷장" onClick={() => setActiveTab("closet")} />
        <TabButton active={activeTab === "styling"} icon={<Sparkles size={20} />} label="스타일링" onClick={() => setActiveTab("styling")} />
        <TabButton active={activeTab === "data"} icon={<Database size={20} />} label="내 데이터" onClick={() => setActiveTab("data")} />
      </nav>

      {deleteTarget && <ConfirmModal title="의류 삭제" message={`${deleteTarget.name}을(를) 삭제하시겠습니까? 사진과 분석 정보도 함께 삭제됩니다.`} onCancel={() => setDeleteTarget(null)} onConfirm={deleteItem} />}
      {showDeleteAllModal && <ConfirmModal title="모든 데이터 삭제" message="등록하신 의류 사진, 스타일링 기록, 분석 정보가 모두 삭제됩니다. 이 작업은 되돌릴 수 없습니다." onCancel={() => setShowDeleteAllModal(false)} onConfirm={deleteAll} />}
    </div>
  );
}

function ClosetCard({ item }: { item: ClothesItem }) {
  const color = item.name.includes("블랙") ? "블랙" : item.name.includes("화이트") ? "화이트" : item.name.includes("베이지") ? "베이지" : item.category === "신발" ? "브라운" : "미정";
  const style = item.category === "하의" ? "포멀" : item.category === "아우터" ? "클래식" : "캐주얼";
  const season = item.category === "신발" ? "여름" : item.category === "하의" ? "사계절" : item.category === "아우터" ? "봄·가을" : "사계절";

  return <article className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
    <img src={item.imageUrl} alt={item.name} className="h-28 w-28 shrink-0 rounded-xl bg-neutral-100 object-cover" />
    <div className="min-w-0 flex-1 py-0.5">
      <p className="truncate text-base font-semibold text-neutral-700">{item.name}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {[item.category, color, style, season].map((tag) => <span key={`${item.id}-${tag}`} className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700">{tag}</span>)}
      </div>
    </div>
  </article>;
}

function TabButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return <button onClick={onClick} className={`flex flex-col items-center gap-1 ${active ? "text-neutral-900" : "text-neutral-400"}`}><div className={`rounded-xl p-1.5 ${active ? "bg-neutral-100" : ""}`}>{icon}</div><span className="text-[10px] font-medium">{label}</span></button>;
}

function ConfirmModal({ title, message, onCancel, onConfirm }: { title: string; message: string; onCancel: () => void; onConfirm: () => void }) {
  return <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6 backdrop-blur-sm"><div className="relative w-full space-y-4 rounded-2xl bg-white p-5 shadow-xl"><button onClick={onCancel} className="absolute right-4 top-4 text-neutral-400"><X size={18} /></button><h3 className="text-lg font-bold">{title}</h3><p className="pr-4 text-xs leading-relaxed text-neutral-500">{message}</p><div className="flex gap-2 pt-2"><button onClick={onCancel} className="flex-1 rounded-xl border border-neutral-200 py-2.5 text-xs font-bold text-neutral-600">취소</button><button onClick={onConfirm} className="flex-1 rounded-xl bg-neutral-600 py-2.5 text-xs font-bold text-white hover:bg-neutral-800">삭제</button></div></div></div>;
}

function StylingLoadingScreen() {
  return (
    <div className="mt-6 flex flex-col items-center py-10 text-center">
      <div className="relative mb-6 h-14 w-14">
        <div className="absolute inset-0 rounded-full border-2 border-neutral-200" />
        <div className="absolute inset-0 rounded-full border-2 border-black border-t-transparent animate-spin" />
      </div>
      <h3 className="text-lg font-bold">AI가 스타일링을 고민 중이에요</h3>
      <p className="mt-2 text-sm text-neutral-400">옷장과 MCM 가방 카탈로그를 분석해 최적의 조합을 찾고 있습니다.</p>
      <div className="mt-6 space-y-2 text-sm text-neutral-400">
        <p className="animate-pulse">상황 분석 중...</p>
        <p className="animate-pulse [animation-delay:200ms]">옷장 아이템 매칭 중...</p>
        <p className="animate-pulse [animation-delay:400ms]">MCM 가방 조합 중...</p>
      </div>
    </div>
  );
}

function StylingFailureScreen({ error, onRetry, onEditPrompt }: { error: string; onRetry: () => void; onEditPrompt: () => void }) {
  return (
    <div className="mt-6 flex flex-col items-center py-8 text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-neutral-300">
        <X size={26} className="text-neutral-400" />
      </div>
      <h3 className="text-lg font-bold">스타일링 생성 실패</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-neutral-400">{error}</p>

      <div className="mt-6 w-full rounded-xl border border-neutral-200 p-4 text-left">
        <p className="mb-3 text-xs font-semibold text-neutral-500">실패 원인 확인</p>
        <ul className="space-y-2.5 text-xs leading-relaxed text-neutral-400">
          <li>• 인터넷 연결이 원활한지 확인해주세요</li>
          <li>• 옷장에 의류가 충분히 등록되어 있는지 확인해주세요</li>
          <li>• 입력한 상황이 너무 구체적이거나 모호하지 않은지 확인해주세요</li>
          <li>• 일시적인 서버 오류일 수 있어 잠시 후 다시 시도해주세요</li>
        </ul>
      </div>

      <div className="mt-6 w-full space-y-3">
        <button onClick={onRetry} className="flex w-full items-center justify-center gap-2 rounded-xl bg-neutral-800 py-3.5 text-base font-semibold text-white transition hover:bg-black">
          <RefreshCw size={17} /> 다시 시도
        </button>
        <button onClick={onEditPrompt} className="w-full rounded-xl border border-neutral-300 py-3.5 text-base font-semibold text-neutral-700">
          상황 다시 입력하기
        </button>
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, clothes }: { recommendation: StylingRecommendation; clothes: ClothesItem[] }) {
  const bag = CATALOG.find((item) => item.id === recommendation.matched_bag.bag_id);
  return <div className="mt-6 space-y-4"><div className="flex flex-wrap gap-1.5">{[recommendation.context_analysis.weather, recommendation.context_analysis.place, recommendation.context_analysis.mood].map((value) => <span key={value} className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium">{value}</span>)}</div><div className="rounded-xl border border-neutral-200 p-4"><p className="mb-2 text-xs font-bold tracking-widest text-neutral-500">STYLING INTENT</p><p className="text-sm leading-relaxed">{recommendation.styling_intent}</p></div>{bag && <div className="overflow-hidden rounded-xl border border-black"><img src={bag.image_url} alt={bag.name} className="h-56 w-full object-cover" /><div className="p-4"><p className="font-bold">{bag.name}</p><p className="mt-1 text-sm">₩{bag.price}</p><p className="mt-3 text-xs leading-relaxed text-neutral-500">{bag.coordination_tips}</p><a href={bag.product_url} target="_blank" rel="noreferrer" className="mt-4 block rounded-lg bg-black py-3 text-center text-xs font-bold text-white">MCM 공식몰에서 보기</a></div></div>}{recommendation.outfit.map((outfit) => { const item = clothes.find((clothesItem) => clothesItem.id === outfit.closet_item_id); return item ? <div key={item.id} className="flex gap-3 rounded-xl border border-neutral-200 p-3"><img src={item.imageUrl} alt={item.name} className="h-20 w-16 rounded-lg object-cover" /><div><p className="text-xs font-bold">{item.name}</p><p className="mt-1 text-xs leading-relaxed text-neutral-500">{outfit.reason}</p></div></div> : null; })}</div>;
}
