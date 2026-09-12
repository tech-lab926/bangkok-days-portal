import { z } from "zod";
import { localeSchema } from "./common";

export const createArticleSchema = z.object({
  slug: z.string().min(1).max(200),
  type: z.enum(["NEWS", "GUIDE"]),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  impactLevel: z.enum(["HIGH", "MEDIUM", "LOW"]).optional().nullable(),
  newsCategory: z.enum(["ALL", "LIFE", "TRANSPORT", "BUSINESS", "NIGHT", "EVENT", "SYSTEM"]).optional().nullable(),
  tagIds: z.array(z.string()).optional(),
  seoTitle: z.string().optional().nullable(),
  seoDescription: z.string().optional().nullable(),
  ogTitle: z.string().optional().nullable(),
  ogImage: z.string().optional().nullable(),
  canonicalUrl: z.string().optional().nullable(),
  schemaType: z.string().optional().nullable(),
  translations: z
    .array(
      z.object({
        locale: localeSchema,
        title: z.string().min(1),
        content: z.string().min(1),
        excerpt: z.string().optional(),
        coverUrl: z.string().url().optional().or(z.literal("")),
      }),
    )
    .min(1),
});

export const updateArticleSchema = createArticleSchema.partial();

export const articleFilterSchema = z.object({
  type: z.enum(["NEWS", "GUIDE"]).optional(),
  published: z.coerce.boolean().optional(),
  locale: localeSchema.default("ja"),
});

export type CreateArticle = z.infer<typeof createArticleSchema>;
export type UpdateArticle = z.infer<typeof updateArticleSchema>;
export type ArticleFilter = z.infer<typeof articleFilterSchema>;
