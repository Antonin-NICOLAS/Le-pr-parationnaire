import { useState } from 'react'
import { User, Mail, Camera, Save, Shield, Bell, Palette } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { UserAvatar } from '../components/ui/UserAvatar'
import { useAuth } from '../hooks/useAuth'

export function Profile() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState('profile')
    const [loading, setLoading] = useState(false)

    const [profileData, setProfileData] = useState({
        fullName: user?.user_metadata?.full_name || '',
        email: user?.email || '',
        avatarUrl: user?.user_metadata?.avatar_url || '',
    })

    const [preferences, setPreferences] = useState({
        theme: 'auto',
        emailNotifications: true,
        marketingEmails: false,
        language: 'fr',
    })

    const tabs = [
        { id: 'profile', label: 'Profil', icon: User },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'preferences', label: 'Préférences', icon: Palette },
    ]

    const handleSaveProfile = async () => {
        setLoading(true)
        // Logique de sauvegarde du profil
        setTimeout(() => setLoading(false), 1000)
    }

    const handleSavePreferences = async () => {
        setLoading(true)
        // Logique de sauvegarde des préférences
        setTimeout(() => setLoading(false), 1000)
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8  transition-all duration-400">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Mon compte
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Gérez vos informations personnelles et vos préférences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <Card padding="none">
                            <nav className="space-y-1">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center px-4 py-3 text-left text-sm font-medium rounded-lg transition-colors ${
                                            activeTab === tab.id
                                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                                        }`}
                                    >
                                        <tab.icon className="mr-3" size={18} />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>
                        </Card>
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-3">
                        {activeTab === 'profile' && (
                            <Card>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Informations personnelles
                                </h2>

                                <div className="space-y-6">
                                    {/* Avatar */}
                                    <div className="flex items-center space-x-6">
                                        <UserAvatar
                                            src={profileData.avatarUrl}
                                            size="xl"
                                            className="ring-4 ring-gray-100 dark:ring-gray-800"
                                        />
                                        <div>
                                            <Button variant="outline" size="sm">
                                                <Camera
                                                    className="mr-2"
                                                    size={16}
                                                />
                                                Changer la photo
                                            </Button>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                                JPG, PNG ou GIF. Maximum 2MB.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Nom complet
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.fullName}
                                                onChange={(e) =>
                                                    setProfileData((prev) => ({
                                                        ...prev,
                                                        fullName:
                                                            e.target.value,
                                                    }))
                                                }
                                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Email
                                            </label>
                                            <div className="relative">
                                                <Mail
                                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                                                    size={16}
                                                />
                                                <input
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) =>
                                                        setProfileData(
                                                            (prev) => ({
                                                                ...prev,
                                                                email: e.target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSaveProfile}
                                            loading={loading}
                                        >
                                            <Save className="mr-2" size={16} />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                <Card>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Mot de passe
                                    </h2>
                                    <div className="space-y-4">
                                        <Button variant="outline">
                                            Changer le mot de passe
                                        </Button>
                                    </div>
                                </Card>

                                <Card>
                                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                        Authentification à deux facteurs
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    Application
                                                    d'authentification
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Utilisez une app comme
                                                    Google Authenticator
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Configurer
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    Codes par email
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Recevez des codes par email
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Activer
                                            </Button>
                                        </div>

                                        <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                            <div>
                                                <h3 className="font-medium text-gray-900 dark:text-white">
                                                    Clés d'accès (WebAuthn)
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Connexion sans mot de passe
                                                </p>
                                            </div>
                                            <Button variant="outline" size="sm">
                                                Ajouter
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {activeTab === 'notifications' && (
                            <Card>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Préférences de notification
                                </h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Notifications par email
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Recevez des notifications pour
                                                les nouveaux articles
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    preferences.emailNotifications
                                                }
                                                onChange={(e) =>
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        emailNotifications:
                                                            e.target.checked,
                                                    }))
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h3 className="font-medium text-gray-900 dark:text-white">
                                                Emails marketing
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Recevez des conseils et des
                                                offres spéciales
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    preferences.marketingEmails
                                                }
                                                onChange={(e) =>
                                                    setPreferences((prev) => ({
                                                        ...prev,
                                                        marketingEmails:
                                                            e.target.checked,
                                                    }))
                                                }
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSavePreferences}
                                            loading={loading}
                                        >
                                            <Save className="mr-2" size={16} />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {activeTab === 'preferences' && (
                            <Card>
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                                    Préférences générales
                                </h2>

                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Thème
                                        </label>
                                        <select
                                            value={preferences.theme}
                                            onChange={(e) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    theme: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="light">Clair</option>
                                            <option value="dark">Sombre</option>
                                            <option value="auto">
                                                Automatique
                                            </option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Langue
                                        </label>
                                        <select
                                            value={preferences.language}
                                            onChange={(e) =>
                                                setPreferences((prev) => ({
                                                    ...prev,
                                                    language: e.target.value,
                                                }))
                                            }
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                        >
                                            <option value="fr">Français</option>
                                            <option value="en">English</option>
                                        </select>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSavePreferences}
                                            loading={loading}
                                        >
                                            <Save className="mr-2" size={16} />
                                            Sauvegarder
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
