import { defineConfig, Plugin } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// Plugin to handle figma:asset/ virtual imports outside Figma Make environment
// Returns a transparent 1x1 pixel as a fallback so the build doesn't break
function figmaAssetFallback(): Plugin {
  return {
    name: 'figma-asset-fallback',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        return id
      }
    },
    load(id) {
      if (id.startsWith('figma:asset/')) {
        // Return a transparent 1x1 PNG data URI as fallback
        return `export default "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";`
      }
    },
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    figmaAssetFallback(),
    react(),
    tailwindcss(),
  ],
  // Use /Webapp/ base path for production builds (GitHub Pages)
  // Use '/' for local dev server
  base: command === 'build' ? '/Webapp/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
}))