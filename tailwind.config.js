/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'neon-blue': '#00f3ff',
        'neon-orange': '#ff9e00',
        'deep-bg': '#121212',
        'glass-border': 'rgba(255,255,255,0.1)',
      },
      backgroundImage: {
        'gradient-start': 'linear-gradient(180deg, #0a0a1a 0%, #0d0d2b 30%, #121240 60%, #1a1a3e 100%)',
        'gradient-modal': 'linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)',
        'gradient-neon-blue': 'linear-gradient(135deg, #00C6FF 0%, #0072FF 100%)',
        'gradient-neon-orange': 'linear-gradient(135deg, #ff9e00 0%, #ff6600 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(0,114,255,0.6)',
        'neon-orange': '0 0 20px rgba(255,158,0,0.5)',
        'glow-cyan': '0 0 12px rgba(0,243,255,0.8), 0 0 24px rgba(0,243,255,0.4)',
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'float-up': 'floatUp 8s infinite linear',
        'glow-pulse': 'glowPulse 4s ease-in-out infinite alternate',
        'gradient-shift': 'gradientShift 4s ease-in-out infinite',
        'bounce-soft': 'bounce 2s ease-in-out infinite',
        'run-across': 'runAcross 4s ease-in-out infinite',
        'button-pulse': 'buttonPulse 2s ease-in-out infinite',
        'spin': 'spin 1s linear infinite',
        'pulse-opacity': 'pulse 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(30px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        floatUp: {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(-100vh) translateX(20px)', opacity: '0' },
        },
        glowPulse: {
          '0%': { opacity: '0.4', transform: 'scale(1)' },
          '100%': { opacity: '1', transform: 'scale(1.15)' },
        },
        gradientShift: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        runAcross: {
          '0%': { left: '-2%' },
          '100%': { left: '102%' },
        },
        buttonPulse: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0,114,255,0.4)' },
          '50%': { boxShadow: '0 0 40px rgba(0,114,255,0.7), 0 0 60px rgba(0,114,255,0.3)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
