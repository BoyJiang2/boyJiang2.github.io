import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkStrongInlineCode from './src/utils/remark-strong-inline-code.mjs';
import remarkDisplayMath from './src/utils/remark-display-math.mjs';

const remarkPlugins = [remarkMath, remarkDisplayMath, remarkStrongInlineCode];

export default defineConfig({
  site: process.env.ASTRO_SITE ?? 'https://boyjiang.com',
  integrations: [mdx()],
  markdown: {
    remarkPlugins,
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
