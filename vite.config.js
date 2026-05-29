import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { productsApiPlugin } from './server/vite-products-api.mjs'

export default defineConfig({
  plugins: [vue(), productsApiPlugin()],
})
