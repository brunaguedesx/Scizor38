export interface SearchDemand {
  recent_searches: number;
  previous_searches: number;
  interested_customers: number;
  products: {
    product_id: string;
    name: string;
    category: string;
    availability: string;
    searches: number;
    previous_searches: number;
    last_searched_at: string | null;
    favorites: number;
    requests: number;
    confirmed_requests: number;
    interested_customers: number;
  }[];
}
