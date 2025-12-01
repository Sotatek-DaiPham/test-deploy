import type { Config } from "tailwindcss"

// Tailwind v4 uses CSS-first configuration, but we keep this for compatibility
// and to specify content paths
const config: Config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
} satisfies Config

export default config

