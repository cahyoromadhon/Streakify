/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#172033',
        muted: '#7b8498',
        violet: '#6258e8',
        flame: '#f97316',
        mint: '#22c55e',
      },
      boxShadow: {
        soft: '0 12px 40px rgba(37, 45, 80, 0.06)',
        card: '0 4px 18px rgba(37, 45, 80, 0.05)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
