import React, { useState, useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
// Contexts
import { useTheme } from '../context/Theme'
import { useAuth } from '../context/Auth'
// Icons
import {
    LayoutDashboard,
    Award,
    Footprints,
    ChevronsLeft,
    AlignStartVertical,
    Menu,
    Dumbbell,
    Moon,
    Sun,
    Settings,
    Info,
    LogIn,
    LogOut,
    Users,
    User,
} from 'lucide-react'

const Header: React.FC = () => {
    const navigate = useNavigate()
    const { user, isAuthenticated, logout } = useAuth()
    const { theme, toggleTheme } = useTheme()
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobileView, setIsMobileView] = useState(false)
    const closeMenuRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev)
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
        setSidebarOpen(false)
    }

    const handleNavClick = () => {
        if (isMobileView) {
            setSidebarOpen(false)
        }
    }

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobileView(window.innerWidth < 1150)
        }

        checkScreenSize()
        window.addEventListener('resize', checkScreenSize)

        return () => {
            window.removeEventListener('resize', checkScreenSize)
        }
    }, [])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                isMobileView &&
                sidebarOpen &&
                sidebarRef.current &&
                closeMenuRef.current &&
                !sidebarRef.current.contains(event.target as Node) &&
                !closeMenuRef.current.contains(event.target as Node)
            ) {
                setSidebarOpen(false)
            }
        }

        if (isMobileView) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [isMobileView, sidebarOpen])

    return (
        <>
            <header
                className={`fixed z-9000 m-3 top-0 left-0 right-0 [transition:padding_0.4s,_background-color_0.4s,_width_0.4s]
                    ${sidebarOpen && !isMobileView && 'pl-[300px]'}
                    ${!sidebarOpen && !isMobileView && 'pl-[100px]'}
                    ${sidebarOpen && isMobileView && 'pl-[300px]'}
                    ${!sidebarOpen && isMobileView && 'pl-[0]'}`}
                id="header"
            >
                <div className="w-full h-[3.5rem] bg-[color:var(--body-color)] shadow-[0_2px_24px_rgba(0,0,0,0.25] flex justify-between items-center transition-[background-color] duration-[0.4s] rounded-2xl px-6">
                    <NavLink
                        to={user ? '/dashboard' : '/'}
                        onClick={handleNavClick}
                        className="inline-flex items-center gap-x-1"
                    >
                        <img
                            alt="Logo"
                            className="h-10 text-[color:var(--first-color)]"
                        />
                        <span className="text-[color:var(--title-color)] font-[number:var(--font-semi-bold)]">
                            Le préparationnaire
                        </span>
                    </NavLink>

                    <div className="grid gap-y-6" ref={closeMenuRef}>
                        <button
                            className="text-2xl text-[color:var(--title-color)] cursor-pointer"
                            onClick={toggleSidebar}
                        >
                            <Menu />
                        </button>
                    </div>
                </div>
            </header>

            <nav
                className={`z-9001 bg-[color:var(--body-color)] py-6 fixed top-[0] bottom-[0] [box-shadow:2px_0_24px_rgba(0,0,0,0.25] m-3 rounded-2xl [transition:left_0.4s,_background-color_0.4s,_width_0.4s] ${
                    isMobileView && sidebarOpen && 'left-[0]'
                } ${isMobileView && !sidebarOpen && 'left-[-120%]'} ${
                    !sidebarOpen && !isMobileView ? 'w-[90px]' : 'w-[290px]'
                }`}
                id="sidebar"
                ref={sidebarRef}
            >
                <div className="h-full overflow-hidden flex flex-col gap-8">
                    <div className="grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.2rem]">
                        <div
                            className={`relative w-[50px] h-[50px] bg-[color:var(--first-color)] overflow-hidden grid justify-items-center rounded-[50%] ${
                                isAuthenticated && user ? 'items-center' : ''
                            }`}
                        >
                            {isAuthenticated && user ? (
                                <img
                                    src={user.avatarUrl}
                                    className="absolute w-full h-full"
                                    alt="profile"
                                />
                            ) : (
                                <User
                                    className="absolute w-[80%] h-[80%] bottom-[0] text-[color:var(--body-color)]"
                                    strokeWidth={1.2}
                                />
                            )}
                        </div>
                        {user ? (
                            <NavLink
                                to="/profile"
                                className={`[transition:opacity_0.4s] ${
                                    sidebarOpen ? '' : 'opacity-0'
                                }`}
                            >
                                <h3 className="text-[length:var(--normal-font-size)] text-[color:var(--title-color)] [transition:color_0.4s]">
                                    {user && user.prenom + ' ' + user.nom}
                                </h3>
                                <span className="no-underline text-[color:var(--title-color)] text-[calc(7px_+_0.3vh_+_0.2vw)] [transition:color_0.4s]">
                                    {user && user.email}
                                </span>
                            </NavLink>
                        ) : (
                            <div
                                className={`[transition:opacity_0.4s] ${
                                    sidebarOpen ? '' : 'opacity-0'
                                }`}
                            >
                                <h3 className="text-[length:var(--normal-font-size)] text-[color:var(--title-color)] [transition:color_0.4s]">
                                    Vous n'êtes pas connecté
                                </h3>
                                <NavLink
                                    to="/login"
                                    className="no-underline text-[color:var(--title-color)] text-[calc(7px_+_0.3vh_+_0.2vw)] [transition:color_0.4s]"
                                >
                                    Se connecter
                                </NavLink>
                            </div>
                        )}
                    </div>
                    <div className={isMobileView ? 'block' : 'hidden'}>
                        <button
                            className="relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] transition-[color] duration-[0.1s] pl-[1.9rem] hover:text-[color:var(--first-color)]"
                            onClick={toggleSidebar}
                        >
                            <ChevronsLeft />
                            <span
                                className={`font-[number:var(--font-semi-bold)] ${
                                    sidebarOpen ? '' : 'opacity-0'
                                }`}
                            >
                                Fermer le menu
                            </span>
                        </button>
                    </div>

                    <div className="overflow-hidden overflow-y-auto">
                        <div>
                            <h3
                                className={`text-[var(--title-color)] font-[var(--font-semi-bold)] w-max mb-6 pl-8 [transition:var(--sidebar)] ${
                                    !sidebarOpen && !isMobileView
                                        ? 'text-[0px] after:content-["NAV"] after:text-[length:var(--tiny-font-size)] after:font-[var(--font-semi-bold)]'
                                        : 'text-[length:var(--tiny-font-size)]'
                                }`}
                            >
                                NAVIGATION
                            </h3>
                            <div className="grid gap-6">
                                <NavLink
                                    to="/dashboard"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <LayoutDashboard className="text-xl" />
                                    <span
                                        className={`font-[var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Dashboard
                                    </span>
                                </NavLink>
                                <NavLink
                                    to="/steps"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <Footprints className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Mes pas
                                    </span>
                                </NavLink>
                                <NavLink
                                    to="/challenges"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <Dumbbell className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Mes défis
                                    </span>
                                </NavLink>
                                <NavLink
                                    to="/rewards"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <Award className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Mes récompenses
                                    </span>
                                </NavLink>
                                <NavLink
                                    to="/leaderboard"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <AlignStartVertical className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Mon classement
                                    </span>
                                </NavLink>
                                <NavLink
                                    to="/friends"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <Users className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        Mes amis
                                    </span>
                                </NavLink>
                            </div>
                        </div>

                        <div>
                            <h3
                                className={`text-[var(--title-color)] text-[length:var(--tiny-font-size)] font-[var(--font-semi-bold)] w-max mb-6 mt-6 [transition:var(--sidebar)] ${
                                    !sidebarOpen && !isMobileView
                                        ? 'pl-4'
                                        : 'pl-8'
                                }`}
                            >
                                GENERAL
                            </h3>
                            <div className="grid gap-6">
                                {user && (
                                    <NavLink
                                        to="/settings"
                                        onClick={handleNavClick}
                                        className={({ isActive }) =>
                                            `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                                isActive
                                                    ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                    : ''
                                            } ${sidebarOpen ? '' : 'opacity-0'}`
                                        }
                                    >
                                        <Settings className="text-xl" />
                                        <span
                                            className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                                sidebarOpen ? '' : 'opacity-0'
                                            }`}
                                        >
                                            Réglages
                                        </span>
                                    </NavLink>
                                )}
                                <NavLink
                                    to="/about"
                                    onClick={handleNavClick}
                                    className={({ isActive }) =>
                                        `relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] [transition:color_0.4s,_opacity_0.4s] pl-[1.9rem] hover:text-[color:var(--first-color)] ${
                                            isActive
                                                ? 'text-[color:var(--first-color)] after:content-[""] after:absolute after:w-[3px] after:h-[calc(0.75rem_+_24.5px)] after:bg-[color:var(--first-color)] after:left-0'
                                                : ''
                                        }`
                                    }
                                >
                                    <Info className="text-xl" />
                                    <span
                                        className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                            sidebarOpen ? '' : 'opacity-0'
                                        }`}
                                    >
                                        À propos
                                    </span>
                                </NavLink>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-6 mt-auto">
                        <div
                            className="relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] transition-[color] duration-[0.1s] pl-[1.9rem] hover:text-[color:var(--first-color)] cursor-pointer"
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? (
                                <Sun className="text-xl" />
                            ) : (
                                <Moon className="text-xl" />
                            )}
                            <span
                                className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                    sidebarOpen ? '' : 'opacity-0'
                                }`}
                            >
                                Thème
                            </span>
                        </div>
                        {isAuthenticated ? (
                            <button
                                className="relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] transition-[color] duration-[0.1s] pl-[1.9rem] hover:text-[color:var(--first-color)]"
                                onClick={handleLogout}
                            >
                                <LogOut className="text-xl" />
                                <span
                                    className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                        sidebarOpen ? '' : 'opacity-0'
                                    }`}
                                >
                                    Déconnexion
                                </span>
                            </button>
                        ) : (
                            <NavLink
                                to="/login"
                                onClick={handleNavClick}
                                className="relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 text-[color:var(--text-color)] transition-[color] duration-[0.1s] pl-[1.9rem] hover:text-[color:var(--first-color)]"
                            >
                                <LogIn className="text-xl" />
                                <span
                                    className={`font-[number:var(--font-semi-bold)] [transition:opacity_0.4s] ${
                                        sidebarOpen ? '' : 'opacity-0'
                                    }`}
                                >
                                    S'identifier
                                </span>
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>
        </>
    )
}

export default Header
