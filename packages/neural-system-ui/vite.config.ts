import { resolve } from "node:path";

import { defineConfig } from "vite";

const peerDependencies = [
  "react",
  "three",
  "@react-three/fiber",
  "@react-three/drei",
] as const;

const isPeerDependency = (id: string): boolean => (
  peerDependencies.some((dependency) => id === dependency || id.startsWith(`${dependency}/`))
);

export default defineConfig({
  build: {
    lib: {
      entry: resolve(import.meta.dirname, "src/api/index.ts"),
      formats: ["es"],
      fileName: "index",
      cssFileName: "neural-system-ui",
    },
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: isPeerDependency,
    },
  },
});
