import { useState } from 'react'
import { Check, Crown, Zap, BookOpen, Download, Star } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { Tag } from '../components/ui/Tag'

export function Subscription() {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
        'monthly'
    )

    const features = {
        free: [
            'Accès aux articles gratuits',
            'Fiches de révision de base',
            'Ressources publiques',
            'Support communautaire',
        ],
        premium: [
            'Tous les articles premium',
            'Fiches de révision exclusives',
            'Corrections détaillées',
            'Méthodes avancées',
            'Support prioritaire',
            'Accès anticipé aux nouveautés',
            'Communauté Discord privée',
            'Sessions de révision en live',
        ],
    }

    const testimonials = [
        {
            name: 'Marie L.',
            school: 'Polytechnique 2024',
            content:
                "Les fiches premium m'ont fait gagner un temps énorme dans mes révisions. Indispensable !",
            rating: 5,
        },
        {
            name: 'Thomas R.',
            school: 'Centrale Paris 2024',
            content:
                'Excellent contenu, très bien structuré. Les méthodes sont vraiment efficaces.',
            rating: 5,
        },
        {
            name: 'Sarah M.',
            school: 'ENS Lyon 2024',
            content:
                'Le meilleur investissement de ma prépa. Les corrections détaillées sont parfaites.',
            rating: 5,
        },
    ]

    const renderStars = (rating: number) => {
        return Array.from({ length: 5 }, (_, i) => (
            <Star
                key={i}
                size={16}
                className={
                    i < rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                }
            />
        ))
    }

    const handleSubscribe = () => {
        // Intégration Stripe à implémenter
        alert('Redirection vers Stripe Checkout...')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <Crown className="h-12 w-12 text-yellow-500" />
                    </div>
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Passez au Premium
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Débloquez tout le potentiel du Préparationnaire avec un
                        accès illimité à tous les contenus exclusifs et outils
                        avancés
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                billingCycle === 'monthly'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            Mensuel
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                billingCycle === 'yearly'
                                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}
                        >
                            Annuel
                            <Tag color="green" size="sm" className="ml-2">
                                -20%
                            </Tag>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
                    {/* Free Plan */}
                    <Card className="relative">
                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Gratuit
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                0€
                            </div>
                            <p className="text-gray-500 dark:text-gray-400">
                                Pour commencer
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {features.free.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Button variant="outline" className="w-full">
                            Continuer gratuitement
                        </Button>
                    </Card>

                    {/* Premium Plan */}
                    <Card className="relative border-2 border-yellow-500">
                        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <Tag color="yellow" className="px-4 py-1">
                                <Crown className="mr-1" size={14} />
                                Recommandé
                            </Tag>
                        </div>

                        <div className="text-center mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Premium
                            </h3>
                            <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                                {billingCycle === 'monthly' ? '1€' : '10€'}
                                <span className="text-lg text-gray-500 dark:text-gray-400">
                                    /
                                    {billingCycle === 'monthly' ? 'mois' : 'an'}
                                </span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <p className="text-green-600 dark:text-green-400 text-sm">
                                    Économisez 2€ par an
                                </p>
                            )}
                        </div>

                        <ul className="space-y-3 mb-8">
                            {features.premium.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                                    <span className="text-gray-600 dark:text-gray-400">
                                        {feature}
                                    </span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={handleSubscribe}
                            className="w-full bg-yellow-600 hover:bg-yellow-700"
                        >
                            <Crown className="mr-2" size={16} />
                            Passer au Premium
                        </Button>
                    </Card>
                </div>

                {/* Features Showcase */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Ce que vous débloquez avec Premium
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <Card className="text-center">
                            <div className="flex justify-center mb-4">
                                <BookOpen className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Contenu exclusif
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Accès à plus de 50 articles premium avec des
                                méthodes avancées et des astuces d'experts
                            </p>
                        </Card>

                        <Card className="text-center">
                            <div className="flex justify-center mb-4">
                                <Download className="h-12 w-12 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Fiches premium
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Téléchargez toutes les fiches de révision,
                                formulaires et corrections détaillées
                            </p>
                        </Card>

                        <Card className="text-center">
                            <div className="flex justify-center mb-4">
                                <Zap className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                Support prioritaire
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Posez vos questions directement et obtenez des
                                réponses personnalisées rapidement
                            </p>
                        </Card>
                    </div>
                </div>

                {/* Testimonials */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Ce qu'en disent nos abonnés
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <Card key={index}>
                                <div className="flex items-center mb-4">
                                    {renderStars(testimonial.rating)}
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4 italic">
                                    "{testimonial.content}"
                                </p>
                                <div>
                                    <div className="font-semibold text-gray-900 dark:text-white">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">
                                        {testimonial.school}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* FAQ */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center mb-8">
                        Questions fréquentes
                    </h2>

                    <div className="space-y-6">
                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Puis-je annuler mon abonnement à tout moment ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Oui, vous pouvez annuler votre abonnement à tout
                                moment depuis votre profil. Vous garderez
                                l'accès premium jusqu'à la fin de votre période
                                de facturation.
                            </p>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Y a-t-il une période d'essai gratuite ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Nous offrons 7 jours d'essai gratuit pour tous
                                les nouveaux abonnés. Aucun engagement,
                                annulation possible à tout moment.
                            </p>
                        </Card>

                        <Card>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                                Le contenu est-il adapté à toutes les filières ?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Oui, nous couvrons MP2I, MPSI, PCSI et leurs
                                filières de deuxième année. Le contenu est
                                régulièrement mis à jour selon les programmes
                                officiels.
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
