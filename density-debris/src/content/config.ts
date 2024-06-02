import { defineCollection, z } from 'astro:content';

const projects = defineCollection({
  schema: z.object({
    name: z.string(),
    icon: z.string(),
    caption: z.string(),
    description: z.string(),
    tags: z.array(z.string()),
    github_link: z.string().url().optional(),
  }),
});

export const collections = {
  projects,
};
