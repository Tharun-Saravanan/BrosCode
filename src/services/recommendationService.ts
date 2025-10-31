import type { Product } from '../types/product';

// Use HTTPS endpoint for recommendations to avoid mixed content errors
// If you haven't set up HTTPS yet, see ai/HTTPS_SETUP_GUIDE.md
const RECO_BASE_URL = import.meta.env.VITE_RECOMMENDATION_API_URL || 'https://3.145.158.194:5000';

export interface RecommendationItem {
  product_id: string;
  name: string;
  price: number;
  category?: string;
  description: string;
  image_url?: string;
}

export interface RecommendationsResponse {
  user_id: string;
  recommendation_count: number;
  recommendations: RecommendationItem[];
}

export class RecommendationService {
  static async getUserRecommendations(userId: string, limit: number = 4): Promise<Product[]> {
    const url = `${RECO_BASE_URL}/api/recommendations/${encodeURIComponent(userId)}?limit=${limit}`;

    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Recommendation API error: ${res.status}`);
    }

    const data: RecommendationsResponse = await res.json();
    const now = new Date().toISOString();

    // Map API items to Product shape used in the app
    return (data.recommendations || []).map((r) => ({
      products_id: r.product_id,
      id: r.product_id,
      name: r.name,
      price: typeof r.price === 'string' ? parseFloat(r.price as unknown as string) : r.price,
      description: r.description || '',
      imageUrl: r.image_url,
      images: r.image_url ? [r.image_url] : [],
      imageKeys: [],
      createdAt: now,
      updatedAt: now,
    }));
  }
}
