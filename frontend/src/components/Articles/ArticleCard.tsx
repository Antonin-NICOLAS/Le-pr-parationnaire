import React from 'react'
import { motion } from 'framer-motion'
import { Clock, Eye, Bookmark, Heart, User } from 'lucide-react'
import type { Article } from '../../types/article'
import {
  categoryColors,
  formatReadingTime,
  formatDate,
} from '../../utils/articleHelpers'

interface ArticleCardProps {
  article: Article
  variant?: 'default' | 'hero' | 'secondary'
  onBookmark?: (articleId: string) => void
  onFavorite?: (articleId: string) => void
  onClick?: (article: Article) => void
}

const ArticleCard: React.FC<ArticleCardProps> = ({
  article,
  variant = 'default',
  onBookmark,
  onFavorite,
  onClick,
}) => {
  const cardVariants = {
    default: 'aspect-[4/3]',
    hero: 'aspect-[16/9] md:aspect-[2/1]',
    secondary: 'aspect-[4/3]',
  }

  const containerVariants = {
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

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation()
    onBookmark?.(article.id)
  }

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onFavorite?.(article.id)
  }

  return (
    <motion.article
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`group cursor-pointer overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800 ${
        variant === 'hero' ? 'md:col-span-2' : ''
      }`}
      onClick={() => onClick?.(article)}
    >
      {/* Cover Image */}
      <div className={`relative overflow-hidden ${cardVariants[variant]}`}>
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.title}
            className='h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
          />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/20 dark:to-primary-800/20'>
            <div className='text-center'>
              <div className='mx-auto mb-2 h-12 w-12 rounded-full bg-primary-500/20 flex items-center justify-center'>
                <User className='h-6 w-6 text-primary-600 dark:text-primary-400' />
              </div>
              <p className='text-sm text-primary-600 dark:text-primary-400'>
                {article.category.name}
              </p>
            </div>
          </div>
        )}

        {/* Overlay with actions */}
        <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100' />

        {/* Action buttons */}
        <div className='absolute right-3 top-3 flex space-x-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100'>
          <motion.button
            onClick={handleBookmark}
            className={`rounded-full p-2 backdrop-blur-sm transition-colors ${
              article.isBookmarked
                ? 'bg-primary-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-primary-500 hover:text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Bookmark
              size={16}
              className={article.isBookmarked ? 'fill-current' : ''}
            />
          </motion.button>

          <motion.button
            onClick={handleFavorite}
            className={`rounded-full p-2 backdrop-blur-sm transition-colors ${
              article.isFavorited
                ? 'bg-red-500 text-white'
                : 'bg-white/90 text-gray-700 hover:bg-red-500 hover:text-white'
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart
              size={16}
              className={article.isFavorited ? 'fill-current' : ''}
            />
          </motion.button>
        </div>

        {/* Category badge */}
        <div className='absolute bottom-3 left-3'>
          <span
            className={`rounded-full px-3 py-1 text-xs font-medium ${categoryColors[article.category.slug] || categoryColors.general}`}
          >
            {article.category.name}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        <div className='mb-3 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400'>
          <div className='flex items-center space-x-1'>
            <Clock size={14} />
            <span>{formatReadingTime(article.readingTime)}</span>
          </div>
          <div className='flex items-center space-x-1'>
            <Eye size={14} />
            <span>{article.viewCount}</span>
          </div>
          <span>{formatDate(article.publishedAt)}</span>
        </div>

        <h3
          className={`mb-2 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors ${
            variant === 'hero' ? 'text-xl md:text-2xl' : 'text-lg'
          }`}
        >
          {article.title}
        </h3>

        <p className='mb-4 text-gray-600 dark:text-gray-300 line-clamp-3'>
          {article.excerpt}
        </p>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div className='flex flex-wrap gap-2'>
            {article.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300'
              >
                #{tag}
              </span>
            ))}
            {article.tags.length > 3 && (
              <span className='rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300'>
                +{article.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Author info */}
        <div className='mt-4 flex items-center space-x-3 border-t border-gray-100 pt-4 dark:border-gray-700'>
          {article.author.avatar ? (
            <img
              src={article.author.avatar}
              alt={article.author.name}
              className='h-8 w-8 rounded-full object-cover'
            />
          ) : (
            <div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/20'>
              <User
                size={16}
                className='text-primary-600 dark:text-primary-400'
              />
            </div>
          )}
          <span className='text-sm text-gray-600 dark:text-gray-400'>
            {article.author.name}
          </span>
        </div>
      </div>
    </motion.article>
  )
}

export default ArticleCard
