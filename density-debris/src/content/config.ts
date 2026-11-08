import { defineCollection, z } from 'astro:content';

const entry = {
    name: z.string(),
    caption: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default([]),
    github_link: z.string().url().optional(),
    visible: z.boolean(),
};

const projects = defineCollection({
  schema: z.object({
    ...entry,
    icon: z.string(),
  }),
});

const work = defineCollection({
  schema: z.object(entry),
});

export const collections = {
  projects,
  work,
};
