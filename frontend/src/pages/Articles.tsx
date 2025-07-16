import { useState } from 'react'
import { Search, Filter } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { ArticlePreview } from '../components/articles/ArticlePreview'

// Mock data - à remplacer par de vraies données
const mockArticles = [
    {
        id: '1',
        title: 'Comment organiser ses révisions en MPSI',
        slug: 'organiser-revisions-mpsi',
        excerpt:
            'Découvrez les meilleures stratégies pour optimiser vos révisions et maximiser vos chances de réussite aux concours.',
        content: '',
        imageUrl:
            'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800',
        readingTime: 8,
        publishedAt: '2025-01-15T10:00:00Z',
        updatedAt: '2025-01-15T10:00:00Z',
        authorId: '1',
        author: {
            fullName: 'Alexandre Martin',
            avatarUrl:
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        tags: [
            { id: '1', name: 'Organisation', color: 'blue', category: 'type' },
            { id: '2', name: 'MPSI', color: 'green', category: 'level' },
        ],
        viewCount: 150,
        isPublished: true,
        isPremium: false,
    },
    {
        id: '2',
        title: 'Les erreurs à éviter en mathématiques',
        slug: 'erreurs-mathematiques',
        excerpt:
            'Analyse des erreurs les plus fréquentes en mathématiques et comment les éviter pour améliorer vos notes.',
        content: '',
        imageUrl:
            'https://images.pexels.com/photos/6256/mathematics-computation-mathe-algebra.jpg?auto=compress&cs=tinysrgb&w=800',
        readingTime: 12,
        publishedAt: '2025-01-12T14:30:00Z',
        updatedAt: '2025-01-12T14:30:00Z',
        authorId: '1',
        author: {
            fullName: 'Alexandre Martin',
            avatarUrl:
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        tags: [
            {
                id: '3',
                name: 'Mathématiques',
                color: 'purple',
                category: 'subject',
            },
            { id: '4', name: 'Conseils', color: 'yellow', category: 'type' },
        ],
        viewCount: 151,
        isPublished: true,
        isPremium: true,
    },
    {
        id: '3',
        title: 'Physique : Maîtriser la mécanique',
        slug: 'physique-mecanique',
        excerpt:
            'Guide complet pour comprendre et maîtriser les concepts fondamentaux de la mécanique en prépa.',
        content: '',
        imageUrl:
            'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=800',
        readingTime: 15,
        publishedAt: '2025-01-10T09:15:00Z',
        updatedAt: '2025-01-10T09:15:00Z',
        authorId: '1',
        author: {
            fullName: 'Alexandre Martin',
            avatarUrl:
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        tags: [
            { id: '5', name: 'Physique', color: 'red', category: 'subject' },
            { id: '6', name: 'Mécanique', color: 'indigo', category: 'type' },
        ],
        viewCount: 178,
        isPublished: true,
        isPremium: false,
    },
    {
        id: '4',
        title: 'Chimie organique : Les bases essentielles',
        slug: 'chimie-organique-bases',
        excerpt:
            'Tout ce que vous devez savoir sur la chimie organique pour réussir en PCSI et PC.',
        content: '',
        imageUrl:
            'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=800',
        readingTime: 10,
        publishedAt: '2025-01-08T16:45:00Z',
        updatedAt: '2025-01-08T16:45:00Z',
        authorId: '1',
        author: {
            fullName: 'Alexandre Martin',
            avatarUrl:
                'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
        },
        tags: [
            { id: '7', name: 'Chimie', color: 'green', category: 'subject' },
            { id: '8', name: 'PCSI', color: 'blue', category: 'level' },
        ],
        viewCount: 158,
        isPublished: true,
        isPremium: false,
    },
]

const availableTags = [
    { id: '1', name: 'Organisation', color: 'blue', category: 'type' },
    { id: '2', name: 'MPSI', color: 'green', category: 'level' },
    { id: '3', name: 'Mathématiques', color: 'purple', category: 'subject' },
    { id: '4', name: 'Conseils', color: 'yellow', category: 'type' },
    { id: '5', name: 'Physique', color: 'red', category: 'subject' },
    { id: '6', name: 'Mécanique', color: 'indigo', category: 'type' },
    { id: '7', name: 'Chimie', color: 'green', category: 'subject' },
    { id: '8', name: 'PCSI', color: 'blue', category: 'level' },
]

export function Articles() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedTags, setSelectedTags] = useState<string[]>([])
    const [showFilters, setShowFilters] = useState(false)

    const filteredArticles = mockArticles.filter((article) => {
        const matchesSearch =
            article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesTags =
            selectedTags.length === 0 ||
            selectedTags.some((tagId) =>
                article.tags.some((tag) => tag.id === tagId)
            )

        return matchesSearch && matchesTags
    })

    const toggleTag = (tagId: string) => {
        setSelectedTags((prev) =>
            prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId]
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-all duration-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Tous les articles
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Découvrez tous nos conseils, méthodes et stratégies pour
                        réussir en classes préparatoires
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8">
                    <Card>
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <Search
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Rechercher un article..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Filter Toggle */}
                            <div className="flex justify-between items-center">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="flex items-center space-x-2"
                                >
                                    <Filter size={16} />
                                    <span>Filtres</span>
                                </Button>

                                {selectedTags.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setSelectedTags([])}
                                    >
                                        Effacer les filtres
                                    </Button>
                                )}
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
                                        Filtrer par tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableTags.map((tag) => (
                                            <button
                                                key={tag.id}
                                                onClick={() =>
                                                    toggleTag(tag.id)
                                                }
                                                className={`transition-all ${
                                                    selectedTags.includes(
                                                        tag.id
                                                    )
                                                        ? 'ring-2 ring-blue-500 ring-offset-2'
                                                        : ''
                                                }`}
                                            >
                                                <Tag color={tag.color}>
                                                    {tag.name}
                                                </Tag>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {filteredArticles.length} article
                        {filteredArticles.length > 1 ? 's' : ''} trouvé
                        {filteredArticles.length > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Articles Grid */}
                {filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map((article) => (
                            <ArticlePreview
                                key={article.id}
                                article={article}
                            />
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            <Search className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Aucun article trouvé
                            </h3>
                            <p>
                                Essayez de modifier vos critères de recherche ou
                                vos filtres.
                            </p>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}
