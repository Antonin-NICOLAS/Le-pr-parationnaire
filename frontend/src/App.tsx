import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/Auth'
import { ThemeProvider } from './context/Theme'
import AppRoutes from './routes/AppRoutes'
import axios from 'axios'

axios.defaults.baseURL =
    process.env.NODE_ENV === 'production' ? '' : import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <AppRoutes />
                </Router>
            </ThemeProvider>
        </AuthProvider>
    )
}

export default App
