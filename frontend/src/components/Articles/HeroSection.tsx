import React from 'react'
import { motion } from 'framer-motion'
import ArticleCard from './ArticleCard'
import type { Article } from '../../types/article'

interface HeroSectionProps {
  featuredArticles: Article[]
  onBookmark?: (articleId: string) => void
  onFavorite?: (articleId: string) => void
  onArticleClick?: (article: Article) => void
}

const HeroSection: React.FC<HeroSectionProps> = ({
  featuredArticles,
  onBookmark,
  onFavorite,
  onArticleClick,
}) => {
  if (featuredArticles.length === 0) return null

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        when: 'beforeChildren',
      },
    },
  }

  const [heroArticle, ...secondaryArticles] = featuredArticles.slice(0, 3)

  return (
    <motion.section
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='mb-12'
    >
      <div className='mb-8 text-center'>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-4 text-3xl font-bold text-gray-900 dark:text-gray-100'
        >
          Articles à la une
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='text-gray-600 dark:text-gray-400'
        >
          Découvrez nos derniers articles pour réussir vos études
        </motion.p>
      </div>

      <div className='grid gap-6 lg:grid-cols-3'>
        {/* Hero Article */}
        <div className='lg:col-span-2'>
          <ArticleCard
            article={heroArticle}
            variant='hero'
            onBookmark={onBookmark}
            onFavorite={onFavorite}
            onClick={onArticleClick}
          />
        </div>

        {/* Secondary Articles */}
        <div className='space-y-6'>
          {secondaryArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant='secondary'
              onBookmark={onBookmark}
              onFavorite={onFavorite}
              onClick={onArticleClick}
            />
          ))}
        </div>
      </div>
    </motion.section>
  )
}

export default HeroSection
