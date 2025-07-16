import { Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'

export default function AppRoutes() {
    return (
        <Routes>
            {/* Pages avec header et sidebar */}
            <Route>
                <Route path="/" element={<Home />} />
            </Route>
        </Routes>
    )
}
