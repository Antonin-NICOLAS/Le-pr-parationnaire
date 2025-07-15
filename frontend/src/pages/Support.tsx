import { Heart, Coffee, ShoppingBag, Gift, Star, Users } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'

export function Support() {
    const supportOptions = [
        {
            title: 'Buy Me a Coffee',
            description:
                'Offrez-moi un café pour soutenir la création de contenu',
            icon: Coffee,
            color: 'yellow',
            url: 'https://buymeacoffee.com/preparationnaire',
            price: 'À partir de 3€',
        },
        {
            title: 'Tipeee',
            description: 'Soutenez le projet avec un don mensuel ou ponctuel',
            icon: Heart,
            color: 'red',
            url: 'https://tipeee.com/preparationnaire',
            price: 'À partir de 1€/mois',
        },
        {
            title: 'Boutique Merch',
            description:
                'T-shirts, mugs et accessoires pour les préparationnaires',
            icon: ShoppingBag,
            color: 'blue',
            url: 'https://shop.preparationnaire.fr',
            price: 'À partir de 15€',
        },
    ]

    const products = [
        {
            id: 1,
            name: 'T-shirt "Futur Ingénieur"',
            price: '19,99€',
            image: 'https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=400',
            description: 'T-shirt en coton bio avec design exclusif',
        },
        {
            id: 2,
            name: 'Mug "Café = Énergie"',
            price: '12,99€',
            image: 'https://images.pexels.com/photos/6347919/pexels-photo-6347919.jpeg?auto=compress&cs=tinysrgb&w=400',
            description:
                'Mug céramique 350ml pour vos longues sessions de révision',
        },
        {
            id: 3,
            name: 'Carnet de notes "Prépa"',
            price: '8,99€',
            image: 'https://images.pexels.com/photos/1226398/pexels-photo-1226398.jpeg?auto=compress&cs=tinysrgb&w=400',
            description: 'Carnet A5 ligné avec couverture rigide',
        },
    ]

    const stats = [
        { label: 'Étudiants aidés', value: '5000+', icon: Users },
        { label: 'Articles gratuits', value: '150+', icon: Gift },
        { label: 'Note moyenne', value: '4.8/5', icon: Star },
    ]

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Soutenir Le Préparationnaire
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Votre soutien m'aide à continuer de créer du contenu
                        gratuit et de qualité pour tous les étudiants en classes
                        préparatoires
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {stats.map((stat, index) => (
                        <Card key={index} className="text-center">
                            <div className="flex justify-center mb-4">
                                <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                                {stat.value}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                                {stat.label}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Support Options */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Comment me soutenir
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {supportOptions.map((option, index) => (
                            <Card key={index} hover className="text-center">
                                <div className="flex justify-center mb-4">
                                    <div
                                        className={`p-3 rounded-full bg-${option.color}-100 dark:bg-${option.color}-900/20`}
                                    >
                                        <option.icon
                                            className={`h-8 w-8 text-${option.color}-600 dark:text-${option.color}-400`}
                                        />
                                    </div>
                                </div>

                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {option.title}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {option.description}
                                </p>

                                <div className="text-sm font-medium text-gray-900 dark:text-white mb-6">
                                    {option.price}
                                </div>

                                <a
                                    href={option.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <Button className="w-full">Soutenir</Button>
                                </a>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Merchandise */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Boutique officielle
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {products.map((product) => (
                            <Card key={product.id} hover>
                                <div className="aspect-square w-full overflow-hidden rounded-lg mb-4">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {product.name}
                                </h3>

                                <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                                    {product.description}
                                </p>

                                <div className="flex items-center justify-between">
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {product.price}
                                    </span>
                                    <Button size="sm">
                                        <ShoppingBag
                                            className="mr-2"
                                            size={16}
                                        />
                                        Acheter
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>

                    <div className="text-center mt-8">
                        <Button variant="outline" size="lg">
                            Voir toute la boutique
                        </Button>
                    </div>
                </div>

                {/* Thank You Message */}
                <Card className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <Heart className="mx-auto h-12 w-12 text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Merci pour votre soutien !
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
                        Grâce à vous, je peux continuer à créer du contenu
                        gratuit et de qualité. Chaque contribution, même la plus
                        petite, fait une énorme différence et me motive à
                        continuer cette aventure.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 italic">
                        - Alexandre, créateur du Préparationnaire
                    </p>
                </Card>

                {/* Alternative Support */}
                <div className="mt-16">
                    <Card>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                            Autres façons de soutenir
                        </h2>
                        <div className="space-y-3 text-gray-600 dark:text-gray-400">
                            <p>
                                • Partagez les articles avec vos amis en prépa
                            </p>
                            <p>
                                • Laissez un avis positif sur les réseaux
                                sociaux
                            </p>
                            <p>
                                • Suggérez des améliorations ou de nouveaux
                                sujets
                            </p>
                            <p>
                                • Rejoignez la communauté Discord pour échanger
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}
