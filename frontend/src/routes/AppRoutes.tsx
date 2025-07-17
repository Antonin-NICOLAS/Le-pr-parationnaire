import { Routes, Route } from 'react-router-dom'
import SidebarLayout from '../layouts/SidebarLayout'
import Home from '../pages/Home'

export default function AppRoutes() {
    return (
        <Routes>
            <Route element={<SidebarLayout />}>
                <Route path="/" element={<Home />} />
            </Route>
        </Routes>
    )
}
