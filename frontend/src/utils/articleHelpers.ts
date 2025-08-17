import type { Article } from '../types/article'

// Category color mapping consistent with your theme
export const categoryColors: Record<string, string> = {
  maths: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  physique:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
  methodes:
    'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  orientation:
    'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
  'bien-etre':
    'bg-pink-100 text-pink-800 dark:bg-pink-900/20 dark:text-pink-400',
  general: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
}

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200
  const wordCount = content.trim().split(/\s+/).length
  return Math.ceil(wordCount / wordsPerMinute)
}

export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return "Moins d'1 min"
  return `${minutes} min de lecture`
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export const filterArticles = (
  articles: Article[],
  filters: { search: string; categories: string[]; tags: string[] },
): Article[] => {
  return articles.filter((article) => {
    const matchesSearch =
      !filters.search ||
      article.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(filters.search.toLowerCase())

    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(article.category.slug)

    const matchesTags =
      filters.tags.length === 0 ||
      filters.tags.some((tag) => article.tags.includes(tag))

    return matchesSearch && matchesCategory && matchesTags
  })
}

export const sortArticles = (
  articles: Article[],
  sortBy: string,
): Article[] => {
  const sorted = [...articles]

  switch (sortBy) {
    case 'newest':
      return sorted.sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
    case 'oldest':
      return sorted.sort(
        (a, b) =>
          new Date(a.publishedAt).getTime() - new Date(b.publishedAt).getTime(),
      )
    case 'popular':
      return sorted.sort((a, b) => b.viewCount - a.viewCount)
    case 'reading-time':
      return sorted.sort((a, b) => a.readingTime - b.readingTime)
    default:
      return sorted
  }
}
