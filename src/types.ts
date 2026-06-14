export interface Transaction {
  id: string;
  vendor: string;
  amount: number;
  currency: string;
  category: "Food" | "Hotel" | "Transport" | "Other";
  date: string;
  type: "Business" | "Personal";
  status: "Eligible" | "Pending" | "N/A";
  convertedAmountUSD?: number; // based on user conversion rate
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  tags: string[];
  imgUrl: string;
  isRecommended?: boolean;
  isChoice?: boolean;
  subImgUrl?: string;
  district?: string;
  attractions?: string[];
  transport?: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  citations?: string[];
}

export interface Trip {
  id: string;
  city: string;
  country: string;
  dates: string;
  flightCode?: string;
  status: "In Progress" | "Confirmed" | "Awaiting Confirmation" | "Completed";
  imgUrl: string;
  reason?: string;
  arrTime?: string;
  weatherTemp?: string;
}

export interface Recipe {
  id: string;
  title: string;
  country: string;
  durationMinutes: number;
  ingredients: string[];
  instructions: string[];
  dietaryCategory: "Standard" | "Vegetarian" | "Vegan" | "Halal" | "Gluten-Free";
}

