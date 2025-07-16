import { useState } from 'react'
import { Search, Filter, Download, FileText, Lock, Star } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'

// Mock data pour les fiches de révision
const mockSheets = [
    {
        id: '1',
        title: 'Formulaire Mathématiques MPSI',
        description:
            "Toutes les formules essentielles d'analyse, algèbre et géométrie pour la première année.",
        subject: 'Mathématiques',
        level: 'MPSI',
        theme: 'Formulaire',
        fileUrl: '/sheets/math-mpsi-formulaire.pdf',
        thumbnailUrl:
            'https://images.pexels.com/photos/6256/mathematics-computation-mathe-algebra.jpg?auto=compress&cs=tinysrgb&w=400',
        isPremium: false,
        downloadCount: 1250,
        fileSize: '2.4 MB',
        rating: 4.8,
        createdAt: '2025-01-10T10:00:00Z',
    },
    {
        id: '2',
        title: 'Méthodes de Physique - Mécanique',
        description:
            'Méthodes de résolution et exercices types en mécanique du point et du solide.',
        subject: 'Physique',
        level: 'MPSI',
        theme: 'Mécanique',
        fileUrl: '/sheets/physique-mecanique.pdf',
        thumbnailUrl:
            'https://images.pexels.com/photos/2280549/pexels-photo-2280549.jpeg?auto=compress&cs=tinysrgb&w=400',
        isPremium: true,
        downloadCount: 890,
        fileSize: '3.1 MB',
        rating: 4.7,
        createdAt: '2025-01-08T14:30:00Z',
    },
    {
        id: '3',
        title: 'Chimie Organique - Réactions',
        description:
            'Mécanismes réactionnels et synthèses organiques pour PCSI et PC.',
        subject: 'Chimie',
        level: 'PCSI',
        theme: 'Organique',
        fileUrl: '/sheets/chimie-organique.pdf',
        thumbnailUrl:
            'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=400',
        isPremium: false,
        downloadCount: 670,
        fileSize: '1.8 MB',
        rating: 4.6,
        createdAt: '2025-01-05T16:45:00Z',
    },
    {
        id: '4',
        title: 'Algorithmique et Structures de Données',
        description:
            'Algorithmes fondamentaux et structures de données pour MP2I.',
        subject: 'Informatique',
        level: 'MP2I',
        theme: 'Algorithmes',
        fileUrl: '/sheets/algo-structures.pdf',
        thumbnailUrl:
            'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
        isPremium: true,
        downloadCount: 445,
        fileSize: '2.7 MB',
        rating: 4.9,
        createdAt: '2025-01-03T11:20:00Z',
    },
    {
        id: '5',
        title: 'Méthodes de Dissertation Français',
        description:
            'Techniques de dissertation et analyse littéraire pour toutes les filières.',
        subject: 'Français',
        level: 'Toutes',
        theme: 'Méthodologie',
        fileUrl: '/sheets/francais-dissertation.pdf',
        thumbnailUrl:
            'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=400',
        isPremium: false,
        downloadCount: 1100,
        fileSize: '1.5 MB',
        rating: 4.5,
        createdAt: '2025-01-01T09:00:00Z',
    },
]

const subjects = [
    'Toutes',
    'Mathématiques',
    'Physique',
    'Chimie',
    'Informatique',
    'Français',
]
const levels = ['Toutes', 'MP2I', 'MPSI', 'PCSI', 'MP', 'PC', 'PSI']
const themes = [
    'Tous',
    'Formulaire',
    'Méthodes',
    'Exercices',
    'Cours',
    'Méthodologie',
]

export function RevisionSheets() {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedSubject, setSelectedSubject] = useState('Toutes')
    const [selectedLevel, setSelectedLevel] = useState('Toutes')
    const [selectedTheme, setSelectedTheme] = useState('Tous')
    const [showFilters, setShowFilters] = useState(false)

    const filteredSheets = mockSheets.filter((sheet) => {
        const matchesSearch =
            sheet.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sheet.description.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesSubject =
            selectedSubject === 'Toutes' || sheet.subject === selectedSubject
        const matchesLevel =
            selectedLevel === 'Toutes' ||
            sheet.level === selectedLevel ||
            sheet.level === 'Toutes'
        const matchesTheme =
            selectedTheme === 'Tous' || sheet.theme === selectedTheme

        return matchesSearch && matchesSubject && matchesLevel && matchesTheme
    })

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={14}
                className={
                    i < Math.floor(rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                }
            />
        ))
    }

    const handleDownload = (sheet: any) => {
        if (sheet.isPremium) {
            // Rediriger vers la page d'abonnement
            alert('Cette fiche nécessite un abonnement Premium')
        } else {
            // Simuler le téléchargement
            alert(`Téléchargement de ${sheet.title}`)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8  transition-all duration-400">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Fiches de révision
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Téléchargez des fiches de révision, formulaires et
                        méthodes pour optimiser vos révisions en classes
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
                                    placeholder="Rechercher une fiche..."
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

                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {filteredSheets.length} fiche
                                    {filteredSheets.length > 1 ? 's' : ''}{' '}
                                    trouvée
                                    {filteredSheets.length > 1 ? 's' : ''}
                                </div>
                            </div>

                            {/* Filters */}
                            {showFilters && (
                                <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Matière
                                            </label>
                                            <select
                                                value={selectedSubject}
                                                onChange={(e) =>
                                                    setSelectedSubject(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            >
                                                {subjects.map((subject) => (
                                                    <option
                                                        key={subject}
                                                        value={subject}
                                                    >
                                                        {subject}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Niveau
                                            </label>
                                            <select
                                                value={selectedLevel}
                                                onChange={(e) =>
                                                    setSelectedLevel(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            >
                                                {levels.map((level) => (
                                                    <option
                                                        key={level}
                                                        value={level}
                                                    >
                                                        {level}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Type
                                            </label>
                                            <select
                                                value={selectedTheme}
                                                onChange={(e) =>
                                                    setSelectedTheme(
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            >
                                                {themes.map((theme) => (
                                                    <option
                                                        key={theme}
                                                        value={theme}
                                                    >
                                                        {theme}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sheets Grid */}
                {filteredSheets.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredSheets.map((sheet) => (
                            <Card
                                key={sheet.id}
                                hover
                                className="h-full flex flex-col"
                            >
                                <div className="aspect-video w-full overflow-hidden rounded-t-lg mb-4 relative">
                                    <img
                                        src={sheet.thumbnailUrl}
                                        alt={sheet.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {sheet.isPremium && (
                                        <div className="absolute top-2 right-2">
                                            <Tag color="yellow" size="sm">
                                                <Lock
                                                    size={12}
                                                    className="mr-1"
                                                />
                                                Premium
                                            </Tag>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col">
                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <Tag color="blue" size="sm">
                                            {sheet.subject}
                                        </Tag>
                                        <Tag color="green" size="sm">
                                            {sheet.level}
                                        </Tag>
                                        <Tag color="purple" size="sm">
                                            {sheet.theme}
                                        </Tag>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        {sheet.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-600 dark:text-gray-400 mb-4 flex-1 text-sm">
                                        {sheet.description}
                                    </p>

                                    {/* Stats */}
                                    <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        <div className="flex items-center space-x-1">
                                            {renderStars(sheet.rating)}
                                            <span className="ml-1">
                                                {sheet.rating}
                                            </span>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            <span>
                                                {sheet.downloadCount} DL
                                            </span>
                                            <span>{sheet.fileSize}</span>
                                        </div>
                                    </div>

                                    {/* Download Button */}
                                    <Button
                                        onClick={() => handleDownload(sheet)}
                                        className="w-full"
                                        variant={
                                            sheet.isPremium
                                                ? 'outline'
                                                : 'primary'
                                        }
                                    >
                                        {sheet.isPremium ? (
                                            <>
                                                <Lock
                                                    className="mr-2"
                                                    size={16}
                                                />
                                                Premium requis
                                            </>
                                        ) : (
                                            <>
                                                <Download
                                                    className="mr-2"
                                                    size={16}
                                                />
                                                Télécharger
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card className="text-center py-12">
                        <div className="text-gray-500 dark:text-gray-400">
                            <FileText className="mx-auto h-12 w-12 mb-4" />
                            <h3 className="text-lg font-medium mb-2">
                                Aucune fiche trouvée
                            </h3>
                            <p>
                                Essayez de modifier vos critères de recherche.
                            </p>
                        </div>
                    </Card>
                )}

                {/* Premium CTA */}
                <div className="mt-16">
                    <Card className="text-center bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20">
                        <Lock className="mx-auto h-12 w-12 text-yellow-600 dark:text-yellow-400 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                            Accédez à toutes les fiches Premium
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Débloquez l'accès à plus de 50 fiches exclusives,
                            méthodes avancées et corrections détaillées pour
                            seulement 1€/mois
                        </p>
                        <Button size="lg">Découvrir Premium</Button>
                    </Card>
                </div>
            </div>
        </div>
    )
}
