import { Link } from 'react-router-dom'
import { Clock, Calendar, Heart } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Card } from '../ui/Card'
import { Tag } from '../ui/Tag'
import { UserAvatar } from '../ui/UserAvatar'
import type { Article } from '../../types'

interface ArticlePreviewProps {
    article: Article
    showAuthor?: boolean
    showFavorite?: boolean
    onToggleFavorite?: (articleId: string) => void
    isFavorited?: boolean
}

export function ArticlePreview({
    article,
    showAuthor = true,
    showFavorite = false,
    onToggleFavorite,
    isFavorited = false,
}: ArticlePreviewProps) {
    return (
        <Card hover className="h-full flex flex-col">
            {article.imageUrl && (
                <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                </div>
            )}

            <div className="flex-1 flex flex-col p-6">
                {/* Tags */}
                {article.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {article.tags.slice(0, 3).map((tag) => (
                            <Tag key={tag.id} color={tag.color} size="sm">
                                {tag.name}
                            </Tag>
                        ))}
                        {article.tags.length > 3 && (
                            <Tag color="gray" size="sm">
                                +{article.tags.length - 3}
                            </Tag>
                        )}
                    </div>
                )}

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                    <Link
                        to={`/articles/${article.slug}`}
                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        {article.title}
                    </Link>
                </h3>

                {/* Excerpt */}
                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                </p>

                {/* Meta information */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center space-x-4">
                        {showAuthor && (
                            <div className="flex items-center space-x-2">
                                <UserAvatar
                                    src={article.author.avatarUrl}
                                    alt={article.author.fullName}
                                    size="sm"
                                />
                                <span>{article.author.fullName}</span>
                            </div>
                        )}

                        <div className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>
                                {format(
                                    new Date(article.publishedAt),
                                    'dd MMM yyyy',
                                    { locale: fr }
                                )}
                            </span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Clock size={14} />
                            <span>{article.readingTime} min</span>
                        </div>
                    </div>

                    {showFavorite && onToggleFavorite && (
                        <button
                            onClick={() => onToggleFavorite(article.id)}
                            className={`p-1 rounded-full transition-colors ${
                                isFavorited
                                    ? 'text-red-500 hover:text-red-600'
                                    : 'text-gray-400 hover:text-red-500'
                            }`}
                        >
                            <Heart
                                size={16}
                                fill={isFavorited ? 'currentColor' : 'none'}
                            />
                        </button>
                    )}
                </div>

                {/* Premium badge */}
                {article.isPremium && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Tag color="yellow" size="sm">
                            Premium
                        </Tag>
                    </div>
                )}
            </div>
        </Card>
    )
}
