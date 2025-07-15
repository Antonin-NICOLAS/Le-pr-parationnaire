import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
    Calendar,
    Clock,
    Heart,
    Share2,
    BookOpen,
    ArrowLeft,
    User,
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'
import { UserAvatar } from '../components/ui/UserAvatar'
import { useAuth } from '../hooks/useAuth'

// Mock article data
const mockArticle = {
    id: '1',
    title: 'Comment organiser ses révisions en MPSI : Guide complet',
    slug: 'organiser-revisions-mpsi',
    excerpt:
        'Découvrez les meilleures stratégies pour optimiser vos révisions et maximiser vos chances de réussite aux concours.',
    content: `# Introduction

Organiser ses révisions en MPSI est crucial pour réussir les concours. Dans cet article, nous allons voir ensemble les meilleures méthodes pour optimiser votre temps et vos efforts.

## 1. Planification générale

### Établir un planning réaliste

La première étape consiste à établir un planning réaliste qui tient compte de :
- Vos cours actuels
- Vos points faibles
- Le temps disponible
- Les échéances importantes

> **Conseil d'expert** : Ne planifiez jamais 100% de votre temps. Gardez toujours 20% de marge pour les imprévus.

### Prioriser les matières

En MPSI, certaines matières ont plus de coefficients que d'autres :

| Matière | Coefficient moyen | Priorité |
|---------|------------------|----------|
| Mathématiques | 8-10 | Très haute |
| Physique | 6-8 | Haute |
| Chimie | 4-6 | Moyenne |
| Français | 4-5 | Moyenne |

## 2. Techniques de révision efficaces

### La méthode Pomodoro adaptée

La technique Pomodoro peut être adaptée pour les révisions en prépa :

\`\`\`
25 min de révision intensive
5 min de pause
Répéter 4 fois
Pause longue de 30 min
\`\`\`

### Révision active vs passive

**Révision passive** (à éviter) :
- Relire ses cours
- Surligner
- Recopier

**Révision active** (recommandée) :
- Faire des exercices
- Expliquer à voix haute
- Créer des fiches de synthèse
- Tester ses connaissances

## 3. Outils recommandés

Pour optimiser vos révisions, je recommande ces outils :

- **Notion** : Pour organiser vos cours et créer des bases de données d'exercices
- **Anki** : Pour la mémorisation avec la répétition espacée
- **Forest** : Pour rester concentré pendant vos sessions de travail

[Lien affilié vers Notion](https://notion.so) - *Ceci est un lien affilié*

## 4. Gestion du stress et de la motivation

### Techniques de relaxation

- Méditation de 10 minutes par jour
- Exercice physique régulier
- Sommeil de qualité (7-8h par nuit)

### Maintenir la motivation

- Fixer des objectifs à court terme
- Célébrer les petites victoires
- Rejoindre des groupes d'étude

## Conclusion

L'organisation des révisions en MPSI demande de la méthode et de la persévérance. En appliquant ces conseils, vous devriez voir une amélioration significative de votre efficacité.

N'hésitez pas à adapter ces méthodes à votre profil personnel. Chaque étudiant est unique !`,
    imageUrl:
        'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1200',
    readingTime: 8,
    publishedAt: '2025-01-15T10:00:00Z',
    updatedAt: '2025-01-15T10:00:00Z',
    authorId: '1',
    author: {
        fullName: 'Alexandre Martin',
        avatarUrl:
            'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200',
        bio: 'Ancien étudiant en MPSI puis MP* au lycée Louis-le-Grand. Diplômé de Polytechnique, je partage mes méthodes et conseils pour réussir en prépa.',
    },
    tags: [
        { id: '1', name: 'Organisation', color: 'blue', category: 'type' },
        { id: '2', name: 'MPSI', color: 'green', category: 'level' },
        { id: '3', name: 'Méthodes', color: 'purple', category: 'type' },
    ],
    isPublished: true,
    isPremium: false,
    viewCount: 2450,
    tableOfContents: [
        { id: 'introduction', title: 'Introduction', level: 1 },
        {
            id: 'planification-generale',
            title: 'Planification générale',
            level: 1,
        },
        {
            id: 'etablir-planning',
            title: 'Établir un planning réaliste',
            level: 2,
        },
        { id: 'prioriser-matieres', title: 'Prioriser les matières', level: 2 },
        {
            id: 'techniques-revision',
            title: 'Techniques de révision efficaces',
            level: 1,
        },
        {
            id: 'methode-pomodoro',
            title: 'La méthode Pomodoro adaptée',
            level: 2,
        },
        {
            id: 'revision-active',
            title: 'Révision active vs passive',
            level: 2,
        },
        { id: 'outils-recommandes', title: 'Outils recommandés', level: 1 },
        {
            id: 'gestion-stress',
            title: 'Gestion du stress et de la motivation',
            level: 1,
        },
        { id: 'conclusion', title: 'Conclusion', level: 1 },
    ],
}

export function ArticleDetail() {
    const { slug } = useParams()
    const { user } = useAuth()
    const [isFavorited, setIsFavorited] = useState(false)
    const [activeSection, setActiveSection] = useState('')

    useEffect(() => {
        // Simuler le chargement de l'article
        // En réalité, on ferait un appel API avec le slug
    }, [slug])

    useEffect(() => {
        // Observer pour la table des matières
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { rootMargin: '-20% 0px -80% 0px' }
        )

        // Observer tous les titres
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6')
        headings.forEach((heading) => observer.observe(heading))

        return () => observer.disconnect()
    }, [])

    const toggleFavorite = () => {
        if (!user) {
            alert('Vous devez être connecté pour ajouter aux favoris')
            return
        }
        setIsFavorited(!isFavorited)
    }

    const shareArticle = () => {
        if (navigator.share) {
            navigator.share({
                title: mockArticle.title,
                url: window.location.href,
            })
        } else {
            navigator.clipboard.writeText(window.location.href)
            alert('Lien copié dans le presse-papiers !')
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <div className="relative bg-white dark:bg-gray-800">
                <div className="absolute inset-0">
                    <img
                        src={mockArticle.imageUrl}
                        alt={mockArticle.title}
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Link
                        to="/articles"
                        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-500 mb-8"
                    >
                        <ArrowLeft className="mr-2" size={16} />
                        Retour aux articles
                    </Link>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {mockArticle.tags.map((tag) => (
                            <Tag key={tag.id} color={tag.color}>
                                {tag.name}
                            </Tag>
                        ))}
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        {mockArticle.title}
                    </h1>

                    <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                        {mockArticle.excerpt}
                    </p>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-2">
                            <UserAvatar
                                src={mockArticle.author.avatarUrl}
                                alt={mockArticle.author.fullName}
                                size="sm"
                            />
                            <span>{mockArticle.author.fullName}</span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Calendar size={16} />
                            <span>
                                {format(
                                    new Date(mockArticle.publishedAt),
                                    'dd MMMM yyyy',
                                    { locale: fr }
                                )}
                            </span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>
                                {mockArticle.readingTime} min de lecture
                            </span>
                        </div>

                        <div className="flex items-center space-x-1">
                            <User size={16} />
                            <span>{mockArticle.viewCount} vues</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Table of Contents - Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <Card>
                                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                                    <BookOpen className="mr-2" size={18} />
                                    Table des matières
                                </h3>
                                <nav className="space-y-2">
                                    {mockArticle.tableOfContents.map((item) => (
                                        <a
                                            key={item.id}
                                            href={`#${item.id}`}
                                            className={`block text-sm transition-colors ${
                                                item.level === 1
                                                    ? 'font-medium'
                                                    : 'ml-4'
                                            } ${
                                                activeSection === item.id
                                                    ? 'text-blue-600 dark:text-blue-400'
                                                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                        >
                                            {item.title}
                                        </a>
                                    ))}
                                </nav>
                            </Card>

                            {/* Action Buttons */}
                            <div className="mt-6 space-y-3">
                                <Button
                                    onClick={toggleFavorite}
                                    variant={
                                        isFavorited ? 'primary' : 'outline'
                                    }
                                    className="w-full"
                                >
                                    <Heart
                                        className="mr-2"
                                        size={16}
                                        fill={
                                            isFavorited
                                                ? 'currentColor'
                                                : 'none'
                                        }
                                    />
                                    {isFavorited
                                        ? 'Retiré des favoris'
                                        : 'Ajouter aux favoris'}
                                </Button>

                                <Button
                                    onClick={shareArticle}
                                    variant="outline"
                                    className="w-full"
                                >
                                    <Share2 className="mr-2" size={16} />
                                    Partager
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Article Content */}
                    <div className="lg:col-span-3">
                        <Card className="prose prose-lg dark:prose-invert max-w-none">
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                    code({
                                        node,
                                        inline,
                                        className,
                                        children,
                                        ...props
                                    }) {
                                        const match = /language-(\w+)/.exec(
                                            className || ''
                                        )
                                        return !inline && match ? (
                                            <SyntaxHighlighter
                                                style={tomorrow}
                                                language={match[1]}
                                                PreTag="div"
                                                {...props}
                                            >
                                                {String(children).replace(
                                                    /\n$/,
                                                    ''
                                                )}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code
                                                className={className}
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        )
                                    },
                                    a({ href, children, ...props }) {
                                        const isAffiliate =
                                            href?.includes('notion.so')
                                        return (
                                            <a
                                                href={href}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={
                                                    isAffiliate
                                                        ? 'affiliate-link'
                                                        : ''
                                                }
                                                {...props}
                                            >
                                                {children}
                                                {isAffiliate && (
                                                    <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                                        Affilié
                                                    </span>
                                                )}
                                            </a>
                                        )
                                    },
                                }}
                            >
                                {mockArticle.content}
                            </ReactMarkdown>
                        </Card>

                        {/* Author Bio */}
                        <Card className="mt-8">
                            <div className="flex items-start space-x-4">
                                <UserAvatar
                                    src={mockArticle.author.avatarUrl}
                                    alt={mockArticle.author.fullName}
                                    size="lg"
                                />
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        À propos de{' '}
                                        {mockArticle.author.fullName}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        {mockArticle.author.bio}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Related Articles */}
                        <div className="mt-12">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                Articles similaires
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Mock related articles */}
                                <Card hover>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                                        <img
                                            src="https://images.pexels.com/photos/6256/mathematics-computation-mathe-algebra.jpg?auto=compress&cs=tinysrgb&w=400"
                                            alt="Article"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        Les erreurs à éviter en mathématiques
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Analyse des erreurs les plus
                                        fréquentes...
                                    </p>
                                </Card>

                                <Card hover>
                                    <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
                                        <img
                                            src="https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400"
                                            alt="Article"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                        Physique : Maîtriser la mécanique
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        Guide complet pour comprendre...
                                    </p>
                                </Card>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
