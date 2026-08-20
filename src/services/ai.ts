import mcmCatalog from "@/mcm_catalog.json";
import type { ClosetItem, ClosetAttributes, McmBag, StylingRecommendation, ClosetCategory, Season } from "@/types";

export const CATALOG: McmBag[] = (mcmCatalog as { bags: McmBag[] }).bags;
export const CATEGORY_OPTIONS: ClosetCategory[] = ["Top", "Bottom", "Outerwear", "Shoes", "Bag", "Accessory"];
export const SEASON_OPTIONS: Season[] = ["Spring", "Summer", "Fall", "Winter", "All-Season"];
export const QUICK_TAGS = ["비 오는 날 카페", "주말 데이트", "편안한 캐주얼", "오피스 미팅"];

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cadi-ai`;
const HEADERS = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
};

const MOCK_ANALYSIS_POOL: ClosetAttributes[] = [
  { category: "Outerwear", sub_category: "오버사이즈 트렌치코트", primary_color: "베이지", style: ["미니멀", "클래식"], season: ["Fall", "Spring"], pattern: "무지" },
  { category: "Top", sub_category: "와이드 니트", primary_color: "아이보리", style: ["캐주얼", "편안한"], season: ["Fall", "Winter"], pattern: "무지" },
  { category: "Bottom", sub_category: "스트레이트 데님", primary_color: "블랙", style: ["캐주얼", "데일리"], season: ["All-Season"], pattern: "무지" },
];

export async function analyzeClosetImage(imageDataUrl: string): Promise<ClosetAttributes> {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ action: "analyze-closet", payload: { imageDataUrl } }),
    });
    if (!res.ok) throw new Error(`Edge Function 오류: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data as ClosetAttributes;
  } catch (err) {
    console.warn("[Cadi] 분석 호출 실패, mock으로 대체합니다:", err);
    await new Promise((r) => setTimeout(r, 500));
    return { ...MOCK_ANALYSIS_POOL[Math.floor(Math.random() * MOCK_ANALYSIS_POOL.length)] };
  }
}

export function mockGenerateStyling(closet: ClosetItem[], prompt: string): StylingRecommendation {
  const outfitSource = closet.slice(0, 2);
  const lowerPrompt = prompt.toLowerCase();
  const scored = CATALOG.map((bag) => ({
    bag,
    score: bag.style_keywords.reduce((acc, kw) => acc + (lowerPrompt.includes(kw.toLowerCase()) ? 1 : 0), 0),
  })).sort((a, b) => b.score - a.score);
  const matchedBag = scored[0]?.bag ?? CATALOG[0];

  return {
    context_analysis: {
      weather: prompt.includes("비") ? "비" : "맑음",
      place: prompt.includes("카페") ? "카페" : prompt.includes("데이트") ? "레스토랑" : "외출",
      tpo: prompt, mood: "편안하지만 신경 쓴 듯한",
    },
    outfit: outfitSource.map((item) => ({
      closet_item_id: item.id,
      reason: `${item.sub_category}은(는) "${prompt}" 상황에 잘 어울리는 편안한 아이템이에요.`,
    })),
    matched_bag: { bag_id: matchedBag.id, bag_name: matchedBag.name, reason: matchedBag.coordination_tips },
    styling_intent: `"${prompt}"에 맞춰 ${outfitSource[0]?.sub_category ?? "기본 아이템"} 중심의 편안한 조합을 추천해요. 과하지 않으면서도 완성도 있는 룩을 위해 "${matchedBag.name}"을(를) 함께 매칭했어요.`,
  };
}

export async function generateStyling(closet: ClosetItem[], prompt: string): Promise<StylingRecommendation> {
  try {
    const res = await fetch(FUNCTION_URL, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        action: "generate-styling",
        payload: {
          closet: closet.map(({ id, category, sub_category, primary_color, style, season, pattern }) => ({ id, category, sub_category, primary_color, style, season, pattern })),
          prompt,
          catalog: CATALOG.map((b) => ({
            id: b.id, name: b.name, category: b.category,
            color_kor: b.color_kor, color: b.color, material: b.material,
            style_keywords: b.style_keywords, coordination_tips: b.coordination_tips,
          })),
        },
      }),
    });
    if (!res.ok) throw new Error(`Edge Function 오류: ${res.status}`);
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data as StylingRecommendation;
  } catch (err) {
    console.warn("[Cadi] 스타일링 호출 실패:", err);
    throw err instanceof Error ? err : new Error("스타일링을 생성하지 못했습니다.");
  }
}
