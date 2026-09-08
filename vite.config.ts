import { defineConfig, type Plugin, type ProxyOptions } from "vite";
import type { ClientRequest } from "node:http";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { THEME_BOOT_SCRIPT } from "./src/themeBoot";

const STRIPPED_BROWSER_HEADERS = [
  "origin",
  "referer",
  "sec-fetch-site",
  "sec-fetch-mode",
  "sec-fetch-dest",
  "sec-fetch-user",
  "sec-ch-ua",
  "sec-ch-ua-mobile",
  "sec-ch-ua-platform",
];

type ProxyServer = Parameters<NonNullable<ProxyOptions["configure"]>>[0];

function stripBrowserHeaders(proxy: ProxyServer) {
  proxy.on("proxyReq", (proxyReq: ClientRequest) => {
    for (const header of STRIPPED_BROWSER_HEADERS) {
      proxyReq.removeHeader(header);
    }
  });
}

function themeBootPlugin(): Plugin {
  return {
    name: "atrium-theme-boot",
    apply: "build",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "themeBoot.js",
        source: THEME_BOOT_SCRIPT,
      });
    },
  };
}

function themeBootDevPlugin(): Plugin {
  return {
    name: "atrium-theme-boot-dev",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/themeBoot.js", (_req, res) => {
        res.setHeader("Content-Type", "text/javascript; charset=utf-8");
        res.end(THEME_BOOT_SCRIPT);
      });
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [tailwindcss(), react(), themeBootPlugin(), themeBootDevPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      "/bing-api": {
        target: "https://www.bing.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/bing-api/, ""),
      },
      "/ddg-ac": {
        target: "https://duckduckgo.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ddg-ac/, ""),
        configure: stripBrowserHeaders,
      },
      "/brave-suggest": {
        target: "https://search.brave.com",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/brave-suggest/, ""),
        configure: stripBrowserHeaders,
      },
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, "index.html"),
        settings: path.resolve(__dirname, "settings.html"),
        privacy: path.resolve(__dirname, "privacy.html"),
        tos: path.resolve(__dirname, "tos.html"),
        trademarks: path.resolve(__dirname, "trademarks.html"),
      },
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") || id.includes("node_modules/react-dom")) {
            return "vendor-react";
          }
        },
      },
    },
  },
});
