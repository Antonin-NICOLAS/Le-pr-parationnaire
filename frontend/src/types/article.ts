export interface Article {
  id: string
  title: string
  excerpt: string
  content: string
  coverImage?: string
  author: {
    id: string
    name: string
    avatar?: string
  }
  publishedAt: string
  updatedAt: string
  readingTime: number
  tags: string[]
  category: ArticleCategory
  isBookmarked?: boolean
  isFavorited?: boolean
  viewCount: number
}

export interface ArticleCategory {
  id: string
  name: string
  slug: string
  color: string
  description?: string
}

export interface ArticleFilters {
  search: string
  categories: string[]
  tags: string[]
  sortBy: 'newest' | 'oldest' | 'popular' | 'reading-time'
}

export interface ArticleStats {
  totalArticles: number
  categoryCounts: Record<string, number>
  tagCounts: Record<string, number>
}
