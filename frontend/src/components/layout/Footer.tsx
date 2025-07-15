import { Link } from 'react-router-dom'
import { BookOpen, Mail, Twitter, Github } from 'lucide-react'

export function Footer() {
    return (
        <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Logo and description */}
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center space-x-2 mb-4">
                            <BookOpen className="h-8 w-8 text-blue-600" />
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Le Préparationnaire
                            </span>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
                            Votre compagnon pour réussir en classes
                            préparatoires scientifiques. Articles, ressources et
                            fiches de révision pour MP2I, MPSI, PCSI et plus.
                        </p>
                        <div className="flex space-x-4">
                            <a
                                href="mailto:contact@preparationnaire.fr"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Mail size={20} />
                            </a>
                            <a
                                href="https://twitter.com/preparationnaire"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Twitter size={20} />
                            </a>
                            <a
                                href="https://github.com/preparationnaire"
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <Github size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Navigation
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Accueil
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/articles"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Articles
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/resources"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Ressources
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/revision-sheets"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Fiches
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                            Légal
                        </h3>
                        <ul className="space-y-2">
                            <li>
                                <Link
                                    to="/privacy"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Confidentialité
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terms"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Conditions
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/support"
                                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                >
                                    Soutenir
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
                    <p className="text-center text-gray-500 dark:text-gray-400">
                        © 2025 Le Préparationnaire. Tous droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    )
}
