import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/Auth'
import { ThemeProvider } from './context/Theme'
import { Toaster } from 'sonner'
import AppRoutes from './routes/AppRoutes'
import axios from 'axios'

// Config axios
axios.defaults.baseURL =
    process.env.NODE_ENV === 'production' ? '' : import.meta.env.VITE_API_URL
axios.defaults.withCredentials = true

// Toaster
import { useTheme } from './context/Theme'
function ThemedToaster() {
    const { theme } = useTheme()
    return (
        <Toaster
            position="top-right"
            expand={true}
            visibleToasts={2}
            richColors={true}
            theme={theme}
            duration={5000}
        />
    )
}

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <ThemedToaster />
                    <AppRoutes />
                </Router>
            </ThemeProvider>
        </AuthProvider>
    )
}

export default App
