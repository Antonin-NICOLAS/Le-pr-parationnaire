import { useTheme } from '../context/Theme'

export default function Home() {
    const { toggleTheme } = useTheme()
    return (
        <>
            <div className="bg-primary-500">
                <h1>Welcome to the Home Page</h1>
                <p>This is the main landing page of the application.</p>
            </div>
            <button onClick={toggleTheme}>Toggle Theme</button>
        </>
    )
}
