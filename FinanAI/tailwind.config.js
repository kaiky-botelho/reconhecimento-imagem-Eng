/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brutal: {
          bg: '#0A0A0C',
          panel: '#121216',
          panelLight: '#1E1E24',
          border: '#262626',
          borderActive: '#22C55E',
          green: '#22C55E',
          greenNeon: '#4ADE80',
          red: '#EF4444',
          coral: '#F87171',
          text: '#FFFFFF',
          textMuted: '#A3A3A3',
        }
      },
      boxShadow: {
        'neon-green': '0 0 10px rgba(34, 197, 94, 0.2)',
        'neon-red': '0 0 10px rgba(239, 68, 68, 0.2)',
      }
    },
  },
  plugins: [],
}
