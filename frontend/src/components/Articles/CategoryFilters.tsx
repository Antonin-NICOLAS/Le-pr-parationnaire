import React from 'react'
import { motion } from 'framer-motion'
import type { ArticleCategory } from '../../types/article'
import { categoryColors } from '../../utils/articleHelpers'

interface CategoryFilterProps {
  categories: ArticleCategory[]
  selectedCategories: string[]
  onCategoryToggle: (categorySlug: string) => void
  categoryCounts: Record<string, number>
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryToggle,
  categoryCounts,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='flex flex-wrap gap-3'
    >
      <motion.button
        variants={itemVariants}
        onClick={() => onCategoryToggle('all')}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
          selectedCategories.length === 0
            ? 'bg-primary-500 text-white shadow-md'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
        }`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Tous les articles
        <span className='ml-2 text-xs opacity-75'>
          (
          {Object.values(categoryCounts).reduce((sum, count) => sum + count, 0)}
          )
        </span>
      </motion.button>

      {categories.map((category) => {
        const isSelected = selectedCategories.includes(category.slug)
        const count = categoryCounts[category.slug] || 0

        return (
          <motion.button
            key={category.id}
            variants={itemVariants}
            onClick={() => onCategoryToggle(category.slug)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              isSelected
                ? `${categoryColors[category.slug] || categoryColors.general} shadow-md ring-2 ring-primary-500/20`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {category.name}
            <span className='ml-2 text-xs opacity-75'>({count})</span>
          </motion.button>
        )
      })}
    </motion.div>
  )
}

export default CategoryFilter
