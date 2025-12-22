import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
import { resolve } from "path";
import packageJson from './package.json';

const env = loadEnv('production', process.cwd(), '')
const rootValue = Number(env.VITE_DESIGN_DRAFT_WIDTH ?? 750)

Object.assign(process.env, {
  DESIGN_DRAFT_WIDTH: rootValue,          // 编译期替换
})

export default defineConfig({
  define: {
    'import.meta.env.DESIGN_DRAFT_WIDTH': rootValue,
    // 'import.meta.env.VITE_APP_VERSION': `${packageJson.version}`
  },
  base: `./`,
  plugins: [
    vue(),
    vueJsx(),
    tailwindcss(),
    createSvgIconsPlugin({
      iconDirs: [resolve(process.cwd(), "src/assets/icons")],
      symbolId: "icon-[name]",
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
  },
  build: {
    // 关闭 sourcemap 减小体积
    sourcemap: false,
    // 配置 rollup 选项
    rollupOptions: {
      output: {
        // 手动分块优化
        manualChunks: {
          'vue-vendor': ['vue']
        }
      }
    }
  }
})
