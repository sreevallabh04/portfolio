// Browser-compatible front matter parser
const parseFrontMatter = (content) => {
  // Match front matter between --- markers
  const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n?([\s\S]*)$/;
  const match = content.match(frontMatterRegex);
  
  if (!match) {
    // No front matter found, return entire content as markdown
    return { data: {}, content };
  }
  
  const frontMatter = match[1].trim();
  const markdownContent = match[2] || '';
  const data = {};
  
  if (!frontMatter) {
    return { data, content: markdownContent };
  }
  
  // Simple YAML parser for basic key-value pairs
  frontMatter.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;
    
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) return;
    
    const key = line.substring(0, colonIndex).trim();
    let value = line.substring(colonIndex + 1).trim();
    
    // Remove quotes if present (handles both single and double quotes)
    if ((value.startsWith('"') && value.endsWith('"')) || 
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    
    // Handle arrays (format: ["item1", "item2"] or ['item1', 'item2'])
    if (value.startsWith('[') && value.endsWith(']')) {
      const arrayContent = value.slice(1, -1).trim();
      if (arrayContent) {
        data[key] = arrayContent
          .split(',')
          .map(item => {
            item = item.trim();
            // Remove quotes
            return item.replace(/^["']|["']$/g, '');
          })
          .filter(item => item.length > 0);
      } else {
        data[key] = [];
      }
    } else {
      data[key] = value;
    }
  });
  
  return { data, content: markdownContent };
};

// Import all markdown files from the content/blog directory
const blogPostsContext = import.meta.glob('/content/blog/*.md', { 
  eager: true,
  as: 'raw'
});

export const getAllBlogPosts = () => {
  const posts = Object.entries(blogPostsContext).map(([path, rawContent]) => {
    const { data, content } = parseFrontMatter(rawContent);
    const slug = path.split('/').pop().replace('.md', '');
    
    return {
      slug,
      title: data.title || 'Untitled',
      excerpt: data.excerpt || '',
      publishDate: data.publishDate || data.date || new Date().toISOString(),
      tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
      heroImage: data.heroImage || null,
      content,
      ...data
    };
  });

  // Sort by publish date (newest first)
  return posts.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
};

export const getBlogPostBySlug = (slug) => {
  const allPosts = getAllBlogPosts();
  return allPosts.find(post => post.slug === slug) || null;
};

export const getAllTags = () => {
  const posts = getAllBlogPosts();
  const tags = new Set();
  posts.forEach(post => {
    post.tags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
};

