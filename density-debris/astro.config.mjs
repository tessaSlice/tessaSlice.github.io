import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [mdx()],
  content: {
    collections: './src/content/config.ts', // Point to your content config file
  },
});
