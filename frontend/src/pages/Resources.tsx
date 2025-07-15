import { useState } from 'react'
import {
    Search,
    Star,
    ExternalLink,
    Smartphone,
    Globe,
    BookOpen,
    Heart,
    Zap,
    Brain,
} from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'

// Mock data pour les ressources
const mockResources = [
    {
        id: '1',
        title: 'Notion',
        description:
            'Organisez vos cours, créez des bases de données et planifiez vos révisions avec cet outil tout-en-un.',
        url: 'https://notion.so',
        category: 'Productivité',
        imageUrl:
            'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: false,
        rating: 4.8,
        price: 'Gratuit / 8€/mois',
        icon: BookOpen,
    },
    {
        id: '2',
        title: 'Anki',
        description:
            'Application de cartes mémoire avec répétition espacée pour mémoriser efficacement vos formules et concepts.',
        url: 'https://apps.ankiweb.net',
        category: 'Révisions',
        imageUrl:
            'https://images.pexels.com/photos/301920/pexels-photo-301920.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: false,
        rating: 4.6,
        price: 'Gratuit',
        icon: Brain,
    },
    {
        id: '3',
        title: 'Forest',
        description:
            'Restez concentré pendant vos sessions de travail en plantant des arbres virtuels.',
        url: 'https://forestapp.cc',
        category: 'Productivité',
        imageUrl:
            'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: true,
        rating: 4.5,
        price: '3,99€',
        icon: Zap,
    },
    {
        id: '4',
        title: 'Headspace',
        description:
            'Méditation guidée pour gérer le stress des concours et améliorer votre bien-être mental.',
        url: 'https://headspace.com',
        category: 'Santé',
        imageUrl:
            'https://images.pexels.com/photos/3822622/pexels-photo-3822622.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: true,
        rating: 4.4,
        price: '12,99€/mois',
        icon: Heart,
    },
    {
        id: '5',
        title: 'Wolfram Alpha',
        description:
            'Moteur de calcul pour résoudre des équations complexes et visualiser des fonctions mathématiques.',
        url: 'https://wolframalpha.com',
        category: 'Révisions',
        imageUrl:
            'https://images.pexels.com/photos/6256/mathematics-computation-mathe-algebra.jpg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: false,
        rating: 4.7,
        price: 'Gratuit / 5€/mois',
        icon: Globe,
    },
    {
        id: '6',
        title: 'Todoist',
        description:
            'Gestionnaire de tâches avancé pour organiser vos devoirs, révisions et projets personnels.',
        url: 'https://todoist.com',
        category: 'Productivité',
        imageUrl:
            'https://images.pexels.com/photos/1226398/pexels-photo-1226398.jpeg?auto=compress&cs=tinysrgb&w=400',
        isAffiliate: true,
        rating: 4.6,
        price: 'Gratuit / 4€/mois',
        icon: Smartphone,
    },
]

const categories = ['Toutes', 'Productivité', 'Révisions', 'Santé', 'Outils']

export function Resources() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('Toutes')

    const filteredResources = mockResources.filter((resource) => {
        const matchesSearch =
            resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            resource.description
                .toLowerCase()
                .includes(searchTerm.toLowerCase())

        const matchesCategory =
            selectedCategory === 'Toutes' ||
            resource.category === selectedCategory

        return matchesSearch && matchesCategory
    })

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={
                    i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                }
            />
        ))
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Ressources recommandées
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Découvrez les meilleurs outils, applications et sites
                        web pour optimiser vos révisions et réussir en classes
                        préparatoires
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
                                    placeholder="Rechercher une ressource..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                />
                            </div>

                            {/* Categories */}
                            <div className="flex flex-wrap gap-2">
                                {categories.map((category) => (
                                    <button
                                        key={category}
                                        onClick={() =>
                                            setSelectedCategory(category)
                                        }
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                            selectedCategory === category
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Results Count */}
                <div className="mb-6">
                    <p className="text-gray-600 dark:text-gray-400">
                        {filteredResources.length} ressource
                        {filteredResources.length > 1 ? 's' : ''} trouvée
                        {filteredResources.length > 1 ? 's' : ''}
                    </p>
                </div>

                {/* Resources Grid */}
                {filteredResources.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredResources.map((resource) => (
                            <Card
                                key={resource.id}
                                hover
                                className="h-full flex flex-col"
                            >
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg mb-4">
                                    <img
                                        src={resource.imageUrl}
                                        alt={resource.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                <div className="flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center space-x-2">
                                            <resource.icon
                                                className="text-blue-600 dark:text-blue-400"
                                                size={20}
                                            />
                                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                                {resource.title}
                                            </h3>
                                        </div>
                                        {resource.isAffiliate && (
                                            <Tag color="yellow" size="sm">
                                                Affilié
                                            </Tag>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="mb-3">
                                        <Tag color="blue" size="sm">
                                            {resource.category}
                                        </Tag>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1">
                                        {resource.description}
                                    </p>

                                    {/* Rating and Price */}
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(resource.rating)}
                                            <span className="text-sm text-gray-500 ml-2">
                                                {resource.rating}
                                            </span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                                            {resource.price}
                                        </span>
                                    </div>

                                    {/* Action Button */}
                                    <a
                                        href={resource.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full"
                                    >
                                        <Button className="w-full">
                                            <ExternalLink
                                                className="mr-2"
                                                size={16}
                                            />
                                            Découvrir
                                        </Button>
                                    </a>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            <Search className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Aucune ressource trouvée
                            </h3>
                            <p>
                                Essayez de modifier vos critères de recherche.
                            </p>
                        </div>
                    </Card>
                )}

                {/* CTA Section */}
                <div className="mt-16">
                    <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Une ressource manque ?
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Vous connaissez un outil formidable qui pourrait
                            aider d'autres étudiants ? N'hésitez pas à nous le
                            suggérer !
                        </p>
                        <Button>Suggérer une ressource</Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
