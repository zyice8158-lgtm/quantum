import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import basicSsl from "@vitejs/plugin-basic-ssl";
import eslintPlugin from "vite-plugin-eslint";
import { resolve } from "path";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
// import Components from 'unplugin-vue-components/vite';
// import { VantResolver } from '@vant/auto-import-resolver';
// https://vitejs.dev/config/
export default defineConfig({
  base: "/speech",
  build: {
    outDir: "dist/speech",
  },
  plugins: [
    vue(),
    vueJsx(),
    basicSsl(),
    eslintPlugin({
      include: [
        "src/**/*.js",
        "src/**/*.ts",
        "src/*.ts",
        "src/**/*.vue",
        "src/*.js",
        "src/*.vue",
      ],
    }),
    createSvgIconsPlugin({
      // 指定需要缓存的图标文件夹
      iconDirs: [resolve(process.cwd(), "src/assets/icons")],
      // 指定symbolId格式
      symbolId: "icon-[name]",
    }),
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
    // port: 443,
    https: false,
    // host:"10.119.140.162",
    proxy: {
      "/user-center": {
        target: "https://ainow-team-api-test.lenovo.com/gemini",
        // target: 'http://10.109.80.122:8081',
        changeOrigin: true,
        // rewrite:(path:string) =>path.replace(/^\/api/, '')
      },
      "/v1": {
        target: "https://ainow-team-api-test.lenovo.com/gemini",
        // target: 'http://10.109.80.122:8081',
        changeOrigin: true,
        // rewrite:(path:string) =>path.replace(/^\/api/, '')
      },
      "/mebsuta": {
        target: "https://ainow-team-api-test.lenovo.com/gemini",
        changeOrigin: true,
      },
      // '/chat': {
      //     target: 'https://10.183.152.98:5888',
      //   changeOrigin: true
      // },
    },
  },
});
