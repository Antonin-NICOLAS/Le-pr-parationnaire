import React, { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

const SidebarLayout: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [isMobileView, setIsMobileView] = useState(false)

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

    return (
        <>
            <Sidebar
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                isMobileView={isMobileView}
            />
            <main
                className={`mb-3 ml-3 mr-3 mt-[5rem] [transition:padding_0.4s] ${
                    sidebarOpen && !isMobileView
                        ? 'pl-[calc(290px+0.75rem)]'
                        : !sidebarOpen && !isMobileView
                          ? 'pl-[calc(90px+0.75rem)]'
                          : 'pl-4'
                }`}
                id="main"
            >
                <Outlet />
            </main>
        </>
    )
}

export default SidebarLayout
