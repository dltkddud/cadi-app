import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const CATEGORY_OPTIONS = ["Top", "Bottom", "Outerwear", "Shoes", "Bag", "Accessory"];
const SEASON_OPTIONS = ["Spring", "Summer", "Fall", "Winter", "All-Season"];

interface ClosetItem {
  id: string;
  category: string;
  sub_category: string;
  primary_color: string;
  style: string[];
  season: string[];
  pattern: string;
}

interface McmBag {
  id: string;
  name: string;
  category: string;
  color_kor?: string;
  color?: string;
  material: string;
  style_keywords: string[];
  coordination_tips: string;
}

function serializeCatalog(catalog: McmBag[]) {
  return JSON.stringify(
    catalog.map((b) => ({
      id: b.id,
      name: b.name,
      category: b.category,
      color: b.color_kor ?? b.color,
      material: b.material,
      style_keywords: b.style_keywords,
      coordination_tips: b.coordination_tips,
    })),
    null,
    2,
  );
}

async function callOpenAI(apiKey: string, body: object) {
  const res = await fetch(OPENAI_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI ${res.status}: ${text}`);
  }
  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI 응답에 content가 없습니다.");
  return JSON.parse(content);
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const apiKey = Deno.env.get("API");
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API 비밀코드가 설정되어 있지 않습니다." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { action, payload } = await req.json();

    if (action === "analyze-closet") {
      const { imageDataUrl } = payload;
      const result = await callOpenAI(apiKey, {
        model: "gpt-4o",
        messages: [
          { role: "system", content: "당신은 Cadi 앱의 패션 이미지 분석 엔진입니다. 이미지 속 옷/가방/신발/액세서리의 속성을 스키마에 맞게 정확히 추출하세요." },
          { role: "user", content: [
            { type: "text", text: "이 이미지 속 아이템의 속성을 분석해주세요." },
            { type: "image_url", image_url: { url: imageDataUrl } },
          ] },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "closet_item_attributes",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                category: { type: "string", enum: CATEGORY_OPTIONS },
                sub_category: { type: "string" },
                primary_color: { type: "string" },
                style: { type: "array", items: { type: "string" }, minItems: 1, maxItems: 4 },
                season: { type: "array", items: { type: "string", enum: SEASON_OPTIONS }, minItems: 1 },
                pattern: { type: "string" },
              },
              required: ["category", "sub_category", "primary_color", "style", "season", "pattern"],
            },
          },
        },
        temperature: 0.2,
        max_tokens: 400,
      });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "generate-styling") {
      const { closet, prompt, catalog } = payload as { closet: ClosetItem[]; prompt: string; catalog: McmBag[] };
      const closetItemIds = closet.map((i) => i.id);
      const bagIds = catalog.map((b) => b.id);

      const result = await callOpenAI(apiKey, {
        model: "gpt-4o",
        messages: [
          { role: "system", content: `당신은 럭셔리 패션 스타일링 앱 "Cadi"의 AI 스타일리스트입니다.\n사용자의 옷장과 아래 MCM 가방 카탈로그를 참고해 상황에 맞는 아웃핏과 가방 1개를 추천하세요.\n옷장/카탈로그에 없는 아이템은 절대 지어내지 마세요.\n\n[MCM 가방 카탈로그]\n${serializeCatalog(catalog)}` },
          { role: "user", content: JSON.stringify({
            userCloset: closet.map(({ id, category, sub_category, primary_color, style, season, pattern }) => ({ id, category, sub_category, primary_color, style, season, pattern })),
            userPrompt: prompt,
          }) },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "cadi_styling_recommendation",
            strict: true,
            schema: {
              type: "object",
              additionalProperties: false,
              properties: {
                context_analysis: { type: "object", additionalProperties: false, properties: { weather: { type: "string" }, place: { type: "string" }, tpo: { type: "string" }, mood: { type: "string" } }, required: ["weather", "place", "tpo", "mood"] },
                outfit: { type: "array", minItems: 1, maxItems: 6, items: { type: "object", additionalProperties: false, properties: { closet_item_id: { type: "string", enum: closetItemIds }, reason: { type: "string" } }, required: ["closet_item_id", "reason"] } },
                matched_bag: { type: "object", additionalProperties: false, properties: { bag_id: { type: "string", enum: bagIds }, bag_name: { type: "string" }, reason: { type: "string" } }, required: ["bag_id", "bag_name", "reason"] },
                styling_intent: { type: "string" },
              },
              required: ["context_analysis", "outfit", "matched_bag", "styling_intent"],
            },
          },
        },
        temperature: 0.4,
        max_tokens: 700,
      });
      return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "알 수 없는 action입니다." }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
