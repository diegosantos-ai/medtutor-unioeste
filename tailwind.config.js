export default {
    content: [
        "./index.html",
        "./*.{js,ts,jsx,tsx}",        // Files in root (App.tsx, main.tsx)
        "./components/**/*.{js,ts,jsx,tsx}", // Files in components
    ],
    theme: {
        extend: {
            colors: {
                brand: {
                    50: '#f0f9ff',
                    100: '#e0f2fe',
                    200: '#bae6fd',
                    300: '#7dd3fc',
                    400: '#38bdf8',
                    500: '#0ea5e9',
                    600: '#0284c7',
                    700: '#0369a1',
                    800: '#075985',
                    900: '#0c4a6e',
                },
                accent: {
                    50: '#fdf2f8',
                    100: '#fce7f3',
                    500: '#ec4899', // Pink/Magenta for contrast
                    600: '#db2777',
                },
                surface: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1', // Slate 300
                    400: '#94a3b8', // Slate 400
                    500: '#64748b', // Slate 500
                    600: '#475569', // Slate 600
                    700: '#334155', // Slate 700
                    800: '#1e293b',
                    900: '#0f172a',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                }
            }
        },
    },
    plugins: [],
}
