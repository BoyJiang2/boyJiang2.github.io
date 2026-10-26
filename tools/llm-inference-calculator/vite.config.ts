import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/tools/llm-inference-calculator/',
  build: {
    outDir: fileURLToPath(new URL('../../dist/tools/llm-inference-calculator/', import.meta.url)),
    emptyOutDir: true,
  },
});
