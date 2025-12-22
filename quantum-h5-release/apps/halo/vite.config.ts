import { resolve } from "path";
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import tailwindcss from '@tailwindcss/vite';
// https://vite.dev/config/
export default defineConfig({
    base: "/halo/",
    build: {
        outDir: '../../dist/halo',
    },
    plugins: [
        vue(),
        vueJsx(),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@': resolve(__dirname, "src")
        },
    },
    server: {
        port: 5656,
        host: true,
    }
});
