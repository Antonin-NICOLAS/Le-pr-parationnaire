import { useState, useMemo } from 'react'
import type { Article } from '../types/article'

// Mock data
const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Les secrets des intégrales : maîtriser le calcul intégral',
    excerpt:
      'Découvrez les techniques avancées pour résoudre les intégrales les plus complexes et développer votre intuition mathématique.',
    content:
      "<p>Le calcul intégral est l'une des branches les plus fascinantes des mathématiques...</p>",
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Mathématiques'],
    author: {
      name: 'Dr. Marie Dubois',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-15',
    readingTime: 8,
    isFavorite: false,
  },
  {
    id: '2',
    title: 'Physique quantique : comprendre les fondamentaux',
    excerpt:
      'Une introduction accessible aux concepts de base de la mécanique quantique pour les étudiants en prépa.',
    content:
      "<p>La physique quantique révolutionne notre compréhension de l'univers...</p>",
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Physique'],
    author: {
      name: 'Prof. Jean Martin',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-12',
    readingTime: 12,
    isFavorite: true,
  },
  {
    id: '3',
    title: 'Méthodes de travail efficaces en prépa',
    excerpt:
      'Optimisez votre organisation et vos révisions avec ces techniques éprouvées par les meilleurs étudiants.',
    content:
      '<p>Une bonne méthode de travail est essentielle pour réussir en classe préparatoire...</p>',
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Méthodes'],
    author: {
      name: 'Sarah Chen',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-10',
    readingTime: 6,
    isFavorite: false,
  },
  {
    id: '4',
    title: 'Choisir sa voie après la prépa : guide complet',
    excerpt:
      "Écoles d'ingénieurs, universités, écoles de commerce... Comment faire le bon choix pour votre avenir ?",
    content:
      '<p>Le choix de votre orientation post-prépa est crucial pour votre carrière...</p>',
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Orientation'],
    author: {
      name: 'Antoine Rousseau',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-08',
    readingTime: 10,
    isFavorite: false,
  },
  {
    id: '5',
    title: 'Gérer le stress et maintenir son bien-être',
    excerpt:
      'Techniques de relaxation, gestion du temps et conseils pour préserver votre santé mentale en prépa.',
    content:
      '<p>Le bien-être mental est fondamental pour réussir ses études...</p>',
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Bien-être'],
    author: {
      name: 'Dr. Claire Moreau',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-05',
    readingTime: 7,
    isFavorite: true,
  },
  {
    id: '6',
    title: 'Chimie organique : mécanismes réactionnels',
    excerpt:
      'Maîtrisez les mécanismes fondamentaux de la chimie organique avec des exemples concrets et des exercices.',
    content:
      '<p>La chimie organique repose sur la compréhension des mécanismes...</p>',
    coverImage: '/placeholder.svg?height=300&width=500',
    tags: ['Chimie', 'Méthodes'],
    author: {
      name: 'Prof. Laurent Petit',
      avatar: '/placeholder.svg?height=40&width=40',
    },
    publishedAt: '2024-01-03',
    readingTime: 9,
    isFavorite: false,
  },
]

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>(mockArticles)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const allTags = useMemo(() => {
    const tagCounts: Record<string, number> = {}
    articles.forEach((article) => {
      article.tags.forEach((tag) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    return Object.entries(tagCounts).map(([name, count]) => ({
      name,
      count,
      color: '',
    }))
  }, [articles])

  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      const matchesSearch =
        searchQuery === '' ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase()),
        )

      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => article.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [articles, searchQuery, selectedTags])

  const featuredArticles = useMemo(() => {
    return articles.slice(0, 3)
  }, [articles])

  const toggleFavorite = (id: string) => {
    setArticles((prev) =>
      prev.map((article) =>
        article.id === id
          ? { ...article, isFavorite: !article.isFavorite }
          : article,
      ),
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  return {
    articles: filteredArticles,
    featuredArticles,
    allTags,
    searchQuery,
    setSearchQuery,
    selectedTags,
    toggleTag,
    toggleFavorite,
  }
}
