import { defineConfig } from 'astro/config';
import icon from "astro-icon";

function externalLinks() {
  return (tree) => {
    const visit = (node) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "element" && node.tagName === "a") {
        const href = node.properties && node.properties.href;
        const url = Array.isArray(href) ? href[0] : href;
        if (typeof url === "string" && /^https?:\/\//i.test(url)) {
          const existing = node.properties.rel;
          const parts = new Set(
            (Array.isArray(existing) ? existing.join(" ") : existing || "")
              .split(/\s+/)
              .filter(Boolean),
          );
          parts.add("noopener");
          parts.add("noreferrer");
          node.properties.rel = Array.from(parts);
        }
      }
      if (Array.isArray(node.children)) node.children.forEach(visit);
    };
    visit(tree);
  };
}

// https://astro.build/config
export default defineConfig({
  integrations: [icon()],
  markdown: {
    rehypePlugins: [externalLinks],
  },
  content: {
    collections: './src/content/config.ts' // Point to your content config file
  },
  site: 'https://tessaSlice.github.io',
});
