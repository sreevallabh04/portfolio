import { createClient } from 'contentful';

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_DELIVERY_TOKEN;

if (!spaceId || !accessToken) {
  console.warn('Contentful credentials are missing. Set VITE_CONTENTFUL_SPACE_ID and VITE_CONTENTFUL_DELIVERY_TOKEN in your environment.');
}

const client = spaceId && accessToken
  ? createClient({
      space: spaceId,
      accessToken,
    })
  : null;

export const fetchBlogPosts = async () => {
  if (!client) {
    return [];
  }

  const response = await client.getEntries({
    content_type: 'blogPost',
    order: '-fields.publishDate',
  });

  return response.items.map((item) => mapBlogEntry(item));
};

export const fetchBlogPostBySlug = async (slug) => {
  if (!client) {
    return null;
  }

  const response = await client.getEntries({
    content_type: 'blogPost',
    'fields.slug': slug,
    limit: 1,
  });

  const entry = response.items[0];
  return entry ? mapBlogEntry(entry) : null;
};

const mapBlogEntry = (entry) => {
  const { fields, sys } = entry;
  const heroImage = fields.heroImage?.fields;

  return {
    id: sys.id,
    title: fields.title,
    slug: fields.slug,
    excerpt: fields.excerpt,
    content: fields.content,
    publishDate: fields.publishDate,
    tags: fields.tags || [],
    heroImage: heroImage
      ? {
          url: `https:${heroImage.file.url}`,
          description: heroImage.description || fields.title,
        }
      : null,
  };
};


