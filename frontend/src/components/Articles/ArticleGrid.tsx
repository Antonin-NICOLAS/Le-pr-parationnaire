import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ArticleCard from './ArticleCard'
import type { Article } from '../../types/article'

interface ArticleGridProps {
  articles: Article[]
  loading?: boolean
  onBookmark?: (articleId: string) => void
  onFavorite?: (articleId: string) => void
  onArticleClick?: (article: Article) => void
}

const ArticleGrid: React.FC<ArticleGridProps> = ({
  articles,
  loading = false,
  onBookmark,
  onFavorite,
  onArticleClick,
}) => {
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
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  }

  if (loading) {
    return (
      <div className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className='overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800'
          >
            <div className='aspect-[4/3] animate-pulse bg-gray-200 dark:bg-gray-700' />
            <div className='p-6'>
              <div className='mb-3 flex space-x-4'>
                <div className='h-4 w-16 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                <div className='h-4 w-12 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
              <div className='mb-2 h-6 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              <div className='mb-4 space-y-2'>
                <div className='h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
                <div className='h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700' />
              </div>
              <div className='flex space-x-2'>
                <div className='h-6 w-16 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
                <div className='h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700' />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (articles.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='flex flex-col items-center justify-center py-16 text-center'
      >
        <div className='mb-4 rounded-full bg-gray-100 p-6 dark:bg-gray-800'>
          <svg
            className='h-12 w-12 text-gray-400'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={1.5}
              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
            />
          </svg>
        </div>
        <h3 className='mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100'>
          Aucun article trouvé
        </h3>
        <p className='text-gray-600 dark:text-gray-400'>
          Essayez de modifier vos filtres ou votre recherche
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
    >
      <AnimatePresence mode='popLayout'>
        {articles.map((article) => (
          <motion.div
            key={article.id}
            variants={itemVariants}
            layout
            exit='exit'
          >
            <ArticleCard
              article={article}
              onBookmark={onBookmark}
              onFavorite={onFavorite}
              onClick={onArticleClick}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default ArticleGrid
