import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import basicSsl from '@vitejs/plugin-basic-ssl'
import eslintPlugin from 'vite-plugin-eslint'
import { resolve } from "path";

// import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
// import Components from 'unplugin-vue-components/vite';
// import { VantResolver } from '@vant/auto-import-resolver';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    basicSsl(),
    eslintPlugin({
      include: ['src/**/*.js', 'src/**/*.ts', 'src/*.ts', 'src/**/*.vue', 'src/*.js', 'src/*.vue'],
    }),
    // createSvgIconsPlugin({
    //   // 指定需要缓存的图标文件夹
    //   iconDirs: [resolve(process.cwd(), "src/assets/icons")],
    //   // 指定symbolId格式
    //   symbolId: "icon-[name]",
    // }),
    //   Components({
    //   resolvers: [VantResolver()],
    // }),
  ],
  resolve: {
    alias: [
      { find: "@", replacement: resolve(__dirname, "src") },
      {
        find: "vue",
        replacement: "vue/dist/vue.esm-bundler.js",
      },
    ],
  },
  server: {
    port: 8080,
    https: true,
    proxy: {
      '/api': {
        // target: 'https://awardtest-asdc-sws.lenovo.com/',
        // target: 'http://10.109.80.122:8081',
        changeOrigin: true,
        // rewrite:(path:string) =>path.replace(/^\/api/, '')
      }
    }
  },

})


