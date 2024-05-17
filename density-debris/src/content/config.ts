import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  schema: z.object({
    name: z.string(),
    caption: z.string(),
    description: z.string(),
    languages: z.array(z.string()),
    themes: z.array(z.string()),
    github_link: z.string().url().optional(),
  }),
});

export const collections = {
  projects,
};
