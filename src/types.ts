export type ClosetCategory = "Top" | "Bottom" | "Outerwear" | "Shoes" | "Bag" | "Accessory";
export type Season = "Spring" | "Summer" | "Fall" | "Winter" | "All-Season";

export interface ClosetAttributes {
  category: ClosetCategory;
  sub_category: string;
  primary_color: string;
  style: string[];
  season: Season[];
  pattern: string;
}

export interface ClosetItem extends ClosetAttributes {
  id: string;
  imageDataUrl: string;
}

export interface McmBag {
  id: string;
  name: string;
  category: string;
  price?: string;
  color?: string;
  color_kor?: string;
  material: string;
  dimensions: string;
  capacity_level: string;
  style_keywords: string[];
  coordination_tips: string;
  image_url: string;
  product_url?: string;
}

export interface StylingRecommendation {
  context_analysis: { weather: string; place: string; tpo: string; mood: string };
  outfit: { closet_item_id: string; reason: string }[];
  matched_bag: { bag_id: string; bag_name: string; reason: string };
  styling_intent: string;
}
