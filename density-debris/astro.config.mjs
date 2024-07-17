import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  integrations: [mdx(), icon()],
  content: {
    collections: './src/content/config.ts' // Point to your content config file
  },
  site: 'https://tessaSlice.github.io',
  base: '/density-debris'
});
