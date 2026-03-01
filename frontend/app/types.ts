export interface Trace {
  id: string;
  user_message: string;
  bot_response: string;
  category: Category;
  timestamp: string;
  response_time_ms: number;
}

export type Category =
  | "Billing"
  | "Refund"
  | "Account Access"
  | "Cancellation"
  | "General Inquiry";

export interface CategoryStat {
  category: Category;
  count: number;
  percentage: number;
}

export interface Analytics {
  total_traces: number;
  average_response_time_ms: number;
  category_breakdown: CategoryStat[];
}

export const CATEGORY_COLORS: Record<Category, string> = {
  Billing: "#6c63ff",
  Refund: "#ff6584",
  "Account Access": "#ffd166",
  Cancellation: "#ff6b6b",
  "General Inquiry": "#00d9a3",
};

export const CATEGORY_BG: Record<Category, string> = {
  Billing: "rgba(108,99,255,0.15)",
  Refund: "rgba(255,101,132,0.15)",
  "Account Access": "rgba(255,209,102,0.15)",
  Cancellation: "rgba(255,107,107,0.15)",
  "General Inquiry": "rgba(0,217,163,0.15)",
};
