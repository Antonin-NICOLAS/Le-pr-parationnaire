// Icons
import {
  AlignStartVertical,
  Award,
  ChevronsLeft,
  Dumbbell,
  Footprints,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  User,
  Users,
} from 'lucide-react'
import React, { useEffect, useRef } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

// Image
import Logo from '../assets/icon.png'
import { useAuth } from '../context/Auth'
// Contexts
import { useTheme } from '../context/Theme'

type SidebarProps = {
  sidebarOpen: boolean
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>
  isMobileView: boolean
}

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isMobileView,
}) => {
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const closeMenuRef = useRef<HTMLDivElement>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev)
  }

  const handleLogout = () => {
    logout(() => {
      navigate('/auth/login')
      setSidebarOpen(false)
    })
  }

  const handleNavClick = () => {
    if (isMobileView) {
      setSidebarOpen(false)
    }
  }

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
        className={`z-9000 fixed left-0 right-0 top-0 m-3 pl-[0] [transition:padding_0.4s,_background-color_0.4s,_width_0.4s] ${sidebarOpen && 'min-[640px]:pl-[calc(290px+0.75rem)] pl-[0]'} ${!sidebarOpen && 'min-[1150px]:pl-[calc(90px+0.75rem)] pl-[0]'}`}
        id='header'
      >
        <div className='bg-deg-gray-100 flex h-[3.5rem] w-full items-center justify-between rounded-2xl px-6 shadow-xl'>
          <NavLink
            to={user ? '/dashboard' : '/home'}
            onClick={handleNavClick}
            className='inline-flex items-center gap-x-1'
          >
            <img src={Logo} alt='Logo' className='text-primary-500 h-10' />
            <span className='text-primary-500 text-xl font-semibold'>
              Le préparationnaire
            </span>
          </NavLink>

          <div className='grid gap-y-6' ref={closeMenuRef}>
            <button
              className='text-text cursor-pointer text-2xl'
              onClick={toggleSidebar}
            >
              <Menu />
            </button>
          </div>
        </div>
      </header>

      <nav
        className={`z-9001 bg-deg-gray-100 fixed bottom-[0] top-[0] m-3 rounded-2xl py-6 shadow-xl [transition:left_0.4s,_background-color_0.4s,_width_0.4s] ${
          isMobileView && sidebarOpen && 'left-[0]'
        } ${isMobileView && !sidebarOpen && 'left-[-120%]'} ${
          !sidebarOpen && !isMobileView ? 'w-[90px]' : 'w-[290px]'
        }`}
        id='sidebar'
        ref={sidebarRef}
      >
        <div className='flex h-full flex-col gap-8 overflow-hidden'>
          <div className='grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.22rem]'>
            <div
              className={`bg-primary-500 relative grid h-[50px] w-[50px] justify-items-center overflow-hidden rounded-[50%] ${
                isAuthenticated && user ? 'items-center' : ''
              }`}
            >
              {isAuthenticated && user && user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  className='absolute h-full w-full'
                  alt={`${user.firstName.slice(0, 1)} ${user.lastName.slice(0, 1)}`}
                />
              ) : isAuthenticated && user ? (
                <h2 className='text-white'>{`${user.firstName.slice(0, 1)} ${user.lastName.slice(0, 1)}`}</h2>
              ) : (
                <User
                  className='absolute bottom-[0] h-[80%] w-[80%] text-white'
                  strokeWidth={1.2}
                />
              )}
            </div>
            {user ? (
              <NavLink
                to='/profile'
                className={`[transition:opacity_0.4s] ${
                  sidebarOpen ? '' : 'opacity-0'
                }`}
              >
                <h3 className='text-[length:var(--normal-font-size)] text-gray-500 [transition:color_0.4s]'>
                  {user && user.firstName + ' ' + user.lastName}
                </h3>
                <span className='text-[calc(7px_+_0.3vh_+_0.2vw)] text-gray-400 no-underline [transition:color_0.4s]'>
                  {user && user.email}
                </span>
              </NavLink>
            ) : (
              <div
                className={`[transition:opacity_0.4s] ${
                  sidebarOpen ? '' : 'opacity-0'
                }`}
              >
                <h3 className='text-[length:var(--normal-font-size)] text-gray-500 [transition:color_0.4s]'>
                  Vous n'êtes pas connecté
                </h3>
                <NavLink
                  to='/auth'
                  className='text-[calc(7px_+_0.3vh_+_0.2vw)] text-gray-400 no-underline [transition:color_0.4s]'
                >
                  Se connecter
                </NavLink>
              </div>
            )}
          </div>
          <div className='min-[640px]:hidden block'>
            <button
              className='text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] transition-[color] duration-[0.1s]'
              onClick={toggleSidebar}
            >
              <ChevronsLeft />
              <span
                className={`font-semibold ${sidebarOpen ? '' : 'opacity-0'}`}
              >
                Fermer le menu
              </span>
            </button>
          </div>

          <div className='overflow-hidden overflow-y-auto'>
            <div>
              <h3
                className={`text-primary-400 mb-6 w-max pl-7 font-semibold [transition:padding_0.4s] ${
                  !sidebarOpen && !isMobileView
                    ? 'after:text-tiny text-[0px] after:font-semibold after:content-["NAV"]'
                    : 'text-tiny'
                }`}
              >
                NAVIGATION
              </h3>
              <div className='grid gap-6'>
                <NavLink
                  to='/dashboard'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <LayoutDashboard className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    Dashboard
                  </span>
                </NavLink>
                <NavLink
                  to='/steps'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <Footprints className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    Mes pas
                  </span>
                </NavLink>
                <NavLink
                  to='/challenges'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <Dumbbell className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    Mes défis
                  </span>
                </NavLink>
                <NavLink
                  to='/rewards'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <Award className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    Mes récompenses
                  </span>
                </NavLink>
                <NavLink
                  to='/leaderboard'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <AlignStartVertical className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    Mon classement
                  </span>
                </NavLink>
                <NavLink
                  to='/friends'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <Users className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
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
                className={`text-primary-400 text-tiny mb-6 mt-6 w-max font-semibold [transition:padding_0.4s] ${
                  !sidebarOpen && !isMobileView ? 'pl-3' : 'pl-7'
                }`}
              >
                GENERAL
              </h3>
              <div className='grid gap-6'>
                {user && (
                  <NavLink
                    to='/settings'
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                        isActive
                          ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                          : ''
                      }`
                    }
                  >
                    <Settings className='text-xl' />
                    <span
                      className={`font-semibold [transition:opacity_0.4s] ${
                        sidebarOpen ? '' : 'opacity-0'
                      }`}
                    >
                      Réglages
                    </span>
                  </NavLink>
                )}
                <NavLink
                  to='/about'
                  onClick={handleNavClick}
                  className={({ isActive }) =>
                    `text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] [transition:color_0.4s,_opacity_0.4s] ${
                      isActive
                        ? 'text-primary-500 after:bg-primary-500 after:absolute after:left-0 after:h-[calc(0.75rem_+_24.5px)] after:w-[3px] after:content-[""]'
                        : ''
                    }`
                  }
                >
                  <Info className='text-xl' />
                  <span
                    className={`font-semibold [transition:opacity_0.4s] ${
                      sidebarOpen ? '' : 'opacity-0'
                    }`}
                  >
                    À propos
                  </span>
                </NavLink>
              </div>
            </div>
          </div>

          <div className='mt-auto grid gap-6'>
            <div
              className='text-text hover:text-primary-500 relative grid cursor-pointer grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] transition-[color] duration-[0.1s]'
              onClick={toggleTheme}
            >
              {theme === 'dark' ? (
                <Sun className='text-xl' />
              ) : (
                <Moon className='text-xl' />
              )}
              <span
                className={`font-semibold [transition:opacity_0.4s] ${
                  sidebarOpen ? '' : 'opacity-0'
                }`}
              >
                Thème
              </span>
            </div>
            {isAuthenticated ? (
              <button
                className='text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] transition-[color] duration-[0.1s]'
                onClick={handleLogout}
              >
                <LogOut className='text-xl' />
                <span
                  className={`font-semibold [transition:opacity_0.4s] ${
                    sidebarOpen ? '' : 'opacity-0'
                  }`}
                >
                  Déconnexion
                </span>
              </button>
            ) : (
              <NavLink
                to='/auth'
                onClick={handleNavClick}
                className='text-text hover:text-primary-500 relative grid grid-cols-[repeat(2,max-content)] items-center gap-x-4 pl-[1.9rem] transition-[color] duration-[0.1s]'
              >
                <LogIn className='text-xl' />
                <span
                  className={`font-semibold [transition:opacity_0.4s] ${
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

export default Sidebar
