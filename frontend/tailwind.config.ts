/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                serif: ['Lora', 'Georgia', 'serif'],
            },
            colors: {
                primary: {
                    50: 'rgba(var(--primary-50))',
                    100: 'rgba(var(--primary-100))',
                    200: 'rgba(var(--primary-200))',
                    300: 'rgba(var(--primary-300))',
                    400: 'rgba(var(--primary-400))',
                    500: 'rgba(var(--primary-500))',
                    600: 'rgba(var(--primary-600))',
                    700: 'rgba(var(--primary-700))',
                    800: 'rgba(var(--primary-800))',
                    900: 'rgba(var(--primary-900))',
                },
                error: {
                    text: 'rgba(var(--error-text))',
                    background: 'rgba(var(--error-bg))',
                    border: 'rgba(var(--error-border))',
                },
                warning: {
                    text: 'rgba(var(--warning-text))',
                    background: 'rgba(var(--warning-bg))',
                    border: 'rgba(var(--warning-border))',
                },
                success: {
                    text: 'rgba(var(--success-text))',
                    background: 'rgba(var(--success-bg))',
                    border: 'rgba(var(--success-border))',
                },
                background: 'rgba(var(--background))',
                text: 'rgba(var(--text))',
            },
            typography: {
                DEFAULT: {
                    css: {
                        maxWidth: 'none',
                        color: 'inherit',
                        a: {
                            color: 'inherit',
                            textDecoration: 'underline',
                            fontWeight: '500',
                        },
                        '[class~="lead"]': {
                            color: 'inherit',
                        },
                        strong: {
                            color: 'inherit',
                        },
                        'ol > li::before': {
                            color: 'inherit',
                        },
                        'ul > li::before': {
                            backgroundColor: 'currentColor',
                        },
                        hr: {
                            borderColor: 'currentColor',
                            opacity: 0.3,
                        },
                        blockquote: {
                            color: 'inherit',
                            borderLeftColor: 'currentColor',
                        },
                        h1: {
                            color: 'inherit',
                        },
                        h2: {
                            color: 'inherit',
                        },
                        h3: {
                            color: 'inherit',
                        },
                        h4: {
                            color: 'inherit',
                        },
                        'figure figcaption': {
                            color: 'inherit',
                        },
                        code: {
                            color: 'inherit',
                        },
                        'a code': {
                            color: 'inherit',
                        },
                        pre: {
                            color: 'inherit',
                            backgroundColor: 'transparent',
                        },
                        thead: {
                            color: 'inherit',
                            borderBottomColor: 'currentColor',
                        },
                        'tbody tr': {
                            borderBottomColor: 'currentColor',
                        },
                    },
                },
            },
        },
    },
    plugins: [],
}
