export interface CalculatorCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  calculator_count: number;
  sort_order: number;
}

export interface CalculatorItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  category_slug: string;
  formula?: string;
  is_featured: boolean;
  is_popular: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  images?: string;
  author: string;
  author_avatar?: string;
  created_at?: string;
  published_at?: string;
  updated_at?: string;
  tags?: string;
  categories?: string;
  read_time: string | number;
  view_count: string | number;
  featured: boolean;
  published: boolean;
  meta_description?: string;
  meta_keywords?: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image?: string;
}

export interface CalculationHistoryItem {
  id: string;
  calculatorSlug: string;
  calculatorName: string;
  summary: string;
  timestamp: number;
}
