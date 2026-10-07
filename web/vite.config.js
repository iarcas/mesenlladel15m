import { defineConfig } from "vite";
import { resolve } from "node:path";
import { globSync } from "node:fs";

const rootDir = import.meta.dirname;

const htmlInputs = Object.fromEntries(
  globSync("{,ca/,es/,en/}*.html", { cwd: rootDir }).map((file) => [
    file.replace(/\.html$/, "").replace(/\//g, "_") || "root",
    resolve(rootDir, file),
  ])
);

export default defineConfig({
  build: {
    rollupOptions: {
      input: htmlInputs,
    },
  },
});
