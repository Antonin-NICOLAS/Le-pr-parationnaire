import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, Grid3X3, List } from 'lucide-react'
import SearchBar from '../components/Articles/SearchBar'
import CategoryFilter from '../components/Articles/CategoryFilters'
import HeroSection from '../components/Articles/HeroSection'
import ArticleGrid from '../components/Articles/ArticleGrid'
import PrimaryButton from '../components/ui/PrimaryButton'
import type { Article, ArticleCategory, ArticleFilters } from '../types/article'
import { filterArticles, sortArticles } from '../utils/articleHelpers'

// Mock data - replace with actual API calls
const mockCategories: ArticleCategory[] = [
  {
    id: '1',
    name: 'Mathématiques',
    slug: 'maths',
    color: 'blue',
    description: 'Cours et exercices de mathématiques',
  },
  {
    id: '2',
    name: 'Physique',
    slug: 'physique',
    color: 'purple',
    description: 'Physique et sciences',
  },
  {
    id: '3',
    name: 'Méthodes',
    slug: 'methodes',
    color: 'green',
    description: 'Méthodes de travail et organisation',
  },
  {
    id: '4',
    name: 'Orientation',
    slug: 'orientation',
    color: 'orange',
    description: "Conseils d'orientation",
  },
  {
    id: '5',
    name: 'Bien-être',
    slug: 'bien-etre',
    color: 'pink',
    description: 'Santé et bien-être étudiant',
  },
]

const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Les secrets des intégrales : maîtriser le calcul intégral',
    excerpt:
      'Découvrez les techniques essentielles pour résoudre les intégrales les plus complexes et réussir vos examens de mathématiques.',
    content: "Contenu complet de l'article...",
    coverImage:
      'https://images.pexels.com/photos/6256065/pexels-photo-6256065.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: {
      id: '1',
      name: 'Marie Dubois',
      avatar:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100',
    },
    publishedAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    readingTime: 8,
    tags: ['intégrales', 'calcul', 'mathématiques'],
    category: mockCategories[0],
    isBookmarked: false,
    isFavorited: true,
    viewCount: 1250,
  },
  {
    id: '2',
    title: 'Physique quantique : comprendre les bases',
    excerpt:
      'Une introduction accessible aux concepts fondamentaux de la physique quantique pour les étudiants en prépa.',
    content: "Contenu complet de l'article...",
    coverImage:
      'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: { id: '2', name: 'Pierre Martin' },
    publishedAt: '2024-01-12T14:30:00Z',
    updatedAt: '2024-01-12T14:30:00Z',
    readingTime: 12,
    tags: ['quantique', 'physique', 'théorie'],
    category: mockCategories[1],
    isBookmarked: true,
    isFavorited: false,
    viewCount: 890,
  },
  {
    id: '3',
    title: 'Organiser ses révisions efficacement',
    excerpt:
      'Méthodes éprouvées pour planifier et optimiser ses révisions en classe préparatoire.',
    content: "Contenu complet de l'article...",
    author: { id: '3', name: 'Sophie Laurent' },
    publishedAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z',
    readingTime: 6,
    tags: ['révisions', 'planning', 'organisation'],
    category: mockCategories[2],
    isBookmarked: false,
    isFavorited: false,
    viewCount: 2100,
  },
  {
    id: '4',
    title: 'Choisir sa voie après la prépa',
    excerpt:
      "Guide complet pour s'orienter après les classes préparatoires : écoles, universités, et alternatives.",
    content: "Contenu complet de l'article...",
    coverImage:
      'https://images.pexels.com/photos/1181675/pexels-photo-1181675.jpeg?auto=compress&cs=tinysrgb&w=800',
    author: { id: '4', name: 'Thomas Rousseau' },
    publishedAt: '2024-01-08T16:45:00Z',
    updatedAt: '2024-01-08T16:45:00Z',
    readingTime: 15,
    tags: ['orientation', 'écoles', 'carrière'],
    category: mockCategories[3],
    isBookmarked: false,
    isFavorited: true,
    viewCount: 1680,
  },
  {
    id: '5',
    title: 'Gérer le stress en prépa',
    excerpt:
      'Techniques de relaxation et conseils pratiques pour maintenir un équilibre mental en classe préparatoire.',
    content: "Contenu complet de l'article...",
    author: { id: '5', name: 'Dr. Anne Moreau' },
    publishedAt: '2024-01-05T11:20:00Z',
    updatedAt: '2024-01-05T11:20:00Z',
    readingTime: 10,
    tags: ['stress', 'bien-être', 'santé mentale'],
    category: mockCategories[4],
    isBookmarked: true,
    isFavorited: false,
    viewCount: 1420,
  },
  {
    id: '6',
    title: 'Algorithmes de tri : comparaison et optimisation',
    excerpt:
      'Analyse détaillée des principaux algorithmes de tri avec exemples pratiques et complexité temporelle.',
    content: "Contenu complet de l'article...",
    author: { id: '6', name: 'Jean Dupont' },
    publishedAt: '2024-01-03T13:10:00Z',
    updatedAt: '2024-01-03T13:10:00Z',
    readingTime: 9,
    tags: ['algorithmes', 'informatique', 'optimisation'],
    category: mockCategories[0],
    isBookmarked: false,
    isFavorited: false,
    viewCount: 750,
  },
]

const ArticlesPage: React.FC = () => {
  const [filters, setFilters] = useState<ArticleFilters>({
    search: '',
    categories: [],
    tags: [],
    sortBy: 'newest',
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockArticles.forEach((article) => {
      counts[article.category.slug] = (counts[article.category.slug] || 0) + 1
    })
    return counts
  }, [])

  // Filter and sort articles
  const filteredAndSortedArticles = useMemo(() => {
    const filtered = filterArticles(mockArticles, filters)
    return sortArticles(filtered, filters.sortBy)
  }, [filters])

  // Get featured articles (latest 3)
  const featuredArticles = useMemo(() => {
    return sortArticles(mockArticles, 'newest').slice(0, 3)
  }, [])

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search }))
  }

  const handleCategoryToggle = (categorySlug: string) => {
    if (categorySlug === 'all') {
      setFilters((prev) => ({ ...prev, categories: [] }))
      return
    }

    setFilters((prev) => ({
      ...prev,
      categories: prev.categories.includes(categorySlug)
        ? prev.categories.filter((c) => c !== categorySlug)
        : [...prev.categories, categorySlug],
    }))
  }

  const handleSortChange = (sortBy: ArticleFilters['sortBy']) => {
    setFilters((prev) => ({ ...prev, sortBy }))
  }

  const handleBookmark = (articleId: string) => {
    // Implement bookmark functionality
    console.log('Bookmark article:', articleId)
  }

  const handleFavorite = (articleId: string) => {
    // Implement favorite functionality
    console.log('Favorite article:', articleId)
  }

  const handleArticleClick = (article: Article) => {
    // Navigate to article page
    console.log('Navigate to article:', article.id)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: 'beforeChildren' as const,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut' as const,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='min-h-screen bg-background'
    >
      {/* Header */}
      <motion.div
        variants={itemVariants}
        className='sticky top-[5rem] right-0 left-0 z-40 rounded-2xl shadow-lg bg-deg-gray-100'
      >
        <div className='px-6 h-[4.5rem]'>
          <div className='h-full flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='flex-1 lg:max-w-md'>
              <SearchBar
                value={filters.search}
                onChange={handleSearchChange}
                placeholder='Rechercher des articles...'
              />
            </div>

            <div className='flex items-center gap-3'>
              {/* Sort Dropdown */}
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  handleSortChange(e.target.value as ArticleFilters['sortBy'])
                }
                className='rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
              >
                <option value='newest'>Plus récents</option>
                <option value='oldest'>Plus anciens</option>
                <option value='popular'>Plus populaires</option>
                <option value='reading-time'>Temps de lecture</option>
              </select>

              {/* View Mode Toggle */}
              <div className='flex rounded-lg border border-gray-200 dark:border-gray-600'>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${
                    viewMode === 'grid'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <Grid3X3 size={18} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${
                    viewMode === 'list'
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                >
                  <List size={18} />
                </button>
              </div>

              {/* Filters Toggle */}
              <PrimaryButton
                variant='outline'
                size='sm'
                onClick={() => setShowFilters(!showFilters)}
                icon={SlidersHorizontal}
              >
                Filtres
              </PrimaryButton>
            </div>
          </div>

          {/* Category Filters */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className='mb-6 overflow-hidden'
            >
              <CategoryFilter
                categories={mockCategories}
                selectedCategories={filters.categories}
                onCategoryToggle={handleCategoryToggle}
                categoryCounts={categoryCounts}
              />
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Main Content */}
      <div className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'>
        {/* Hero Section - only show when no filters are active */}
        {filters.search === '' && filters.categories.length === 0 && (
          <motion.div variants={itemVariants}>
            <HeroSection
              featuredArticles={featuredArticles}
              onBookmark={handleBookmark}
              onFavorite={handleFavorite}
              onArticleClick={handleArticleClick}
            />
          </motion.div>
        )}

        {/* Results Summary */}
        <motion.div variants={itemVariants} className='mb-6'>
          <div className='flex items-center justify-between'>
            <p className='text-gray-600 dark:text-gray-400'>
              {filteredAndSortedArticles.length} article
              {filteredAndSortedArticles.length !== 1 ? 's' : ''} trouvé
              {filteredAndSortedArticles.length !== 1 ? 's' : ''}
              {filters.search && (
                <span className='ml-1'>
                  pour "
                  <span className='font-medium text-gray-900 dark:text-gray-100'>
                    {filters.search}
                  </span>
                  "
                </span>
              )}
            </p>
          </div>
        </motion.div>

        {/* Articles Grid */}
        <motion.div variants={itemVariants}>
          <ArticleGrid
            articles={filteredAndSortedArticles}
            onBookmark={handleBookmark}
            onFavorite={handleFavorite}
            onArticleClick={handleArticleClick}
          />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default ArticlesPage
