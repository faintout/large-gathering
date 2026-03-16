import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  base: '/',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  build: {
    outDir: 'large-gathering',
  },
  css: {
    preprocessorOptions: {
      scss: {
        // loadPaths 让 Sass 从项目根解析，再用相对路径避免中文路径等问题
        loadPaths: [resolve(__dirname)],
        additionalData: '@use "sass:math"; @use "src/style/otherStyle.scss" as *;' // 全局公共样式
      }
    }
  },
})
