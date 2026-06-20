/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#1B2420',
        paper: '#F4F5F1',
        moss: '#2F6F4E',
        mossDark: '#1F4E36',
        amber: '#C2933C',
        sand: '#E4E3DA',
        slate: '#5C655F',
        rose: '#B8543F'
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif']
      }
    }
  },
  plugins: []
}
