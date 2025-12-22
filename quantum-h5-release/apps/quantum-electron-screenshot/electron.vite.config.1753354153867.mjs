// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import vue from "@vitejs/plugin-vue";
import { createSvgIconsPlugin } from "vite-plugin-svg-icons";
var __electron_vite_injected_dirname = "C:\\cxf\\quantum-h5\\apps\\quantum-electron-screenshot";
var electron_vite_config_default = defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@": resolve("src"),
        "@libs/p-comps": resolve(__electron_vite_injected_dirname, "../../packages/QuantumUI")
      }
    },
    plugins: [
      vue(),
      createSvgIconsPlugin({
        // Specify the icon folder to be cached
        iconDirs: [resolve(process.cwd(), "src/renderer/src/assets/")],
        // Specify symbolId format
        symbolId: "icon-[dir]-[name]"
      })
    ]
  }
});
export {
  electron_vite_config_default as default
};
