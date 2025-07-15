import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Users, Award, TrendingUp } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
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
        isPublished: true,
        isPremium: false,
    },
]

const stats = [
    { label: 'Articles publiés', value: '150+', icon: BookOpen },
    { label: 'Étudiants aidés', value: '5000+', icon: Users },
    { label: 'Fiches disponibles', value: '200+', icon: Award },
    { label: 'Taux de réussite', value: '85%', icon: TrendingUp },
]

export function Home() {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-900 py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                            Réussissez vos{' '}
                            <span className="text-blue-600 dark:text-blue-400">
                                classes préparatoires
                            </span>
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
                            Articles, ressources et fiches de révision pour
                            exceller en MP2I, MPSI, PCSI. Votre compagnon pour
                            intégrer l'école de vos rêves.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/articles">
                                <Button size="lg" className="w-full sm:w-auto">
                                    Découvrir les articles
                                    <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    Créer un compte gratuit
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="flex justify-center mb-4">
                                    <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-gray-600 dark:text-gray-400">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About Author Section */}
            <section className="py-16 bg-gray-50 dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <Card>
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                <div className="flex-shrink-0">
                                    <img
                                        src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=200"
                                        alt="Alexandre Martin"
                                        className="w-32 h-32 rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                        À propos de l'auteur
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        Salut ! Je suis Alexandre, ancien
                                        étudiant en MPSI puis MP* au lycée
                                        Louis-le-Grand. Après avoir intégré
                                        Polytechnique, j'ai décidé de partager
                                        mon expérience et mes méthodes pour
                                        aider les futurs préparationnaires à
                                        réussir.
                                    </p>
                                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                                        Sur ce blog, vous trouverez des conseils
                                        pratiques, des méthodes de travail
                                        éprouvées, et des ressources pour
                                        optimiser vos révisions et maximiser vos
                                        chances de réussite aux concours.
                                    </p>
                                    <Link to="/about">
                                        <Button variant="outline">
                                            En savoir plus
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Latest Articles */}
            <section className="py-16 bg-white dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                            Derniers articles
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Découvrez nos derniers conseils et stratégies pour
                            exceller en classes préparatoires
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                        {mockArticles.map((article) => (
                            <ArticlePreview
                                key={article.id}
                                article={article}
                            />
                        ))}
                    </div>

                    <div className="text-center">
                        <Link to="/articles">
                            <Button variant="outline" size="lg">
                                Voir tous les articles
                                <ArrowRight className="ml-2" size={20} />
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 bg-blue-600 dark:bg-blue-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Prêt à booster vos résultats ?
                    </h2>
                    <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
                        Rejoignez des milliers d'étudiants qui utilisent nos
                        ressources pour réussir leurs concours
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/register">
                            <Button
                                variant="secondary"
                                size="lg"
                                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-100"
                            >
                                Commencer gratuitement
                            </Button>
                        </Link>
                        <Link to="/subscription">
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-blue-600"
                            >
                                Découvrir Premium
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    )
}
