import { Helmet } from 'react-helmet-async';
import { SITE_URL, absoluteUrl as absolute } from '@/lib/site';

// Crawlers resolve og:image and canonical against their own base, so relative
// paths are unreliable; `absolute` normalises everything against SITE_URL.

const SEO = ({
  title,
  description,
  image = `${SITE_URL}/HopeCore.png`,
  url = SITE_URL,
  type = 'website',
  keywords = 'Sreevallabh Kakarala, AI engineer, machine learning engineer, LLM, RAG, LangChain, PyTorch, time series forecasting',
  author = 'Sreevallabh Kakarala',
  publishedTime,
  modifiedTime,
  section,
  isArticle = false
}) => {
  const fullTitle = `${title} | Sreevallabh Kakarala`;
  const canonicalUrl = absolute(url);
  const imageUrl = absolute(image);

  // The WebSite and Person schemas are static and already emitted once from
  // index.html. Repeating them per route produced several copies of the same
  // graph on every page, so only the page-specific Article schema lives here.

  // Article schema for project pages
  const articleSchema = isArticle ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Person",
      "name": author,
      "url": SITE_URL
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "articleSection": section,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    }
  } : null;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="generator" content="React" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? 'article' : type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Sreevallabh Kakarala Portfolio" />
      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:creator" content="@sreevallabh" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* LLM Optimization Meta Tags */}
      <meta name="ai-purpose" content="portfolio-website" />
      <meta name="ai-description" content={`This is the ${isArticle ? 'article page' : 'website'} of ${author}, an AI engineer building RAG systems, forecasting models and LLM agents. ${description}`} />
      <meta name="ai-generated" content="false" />
      <meta name="ai-indexing" content="allow" />
      <meta name="ai-content-type" content={isArticle ? 'article' : 'profile'} />
      <meta name="ai-last-updated" content={modifiedTime || new Date().toISOString()} />
      <meta name="ai-keywords" content={keywords} />
      <meta name="ai-author" content={author} />
      <meta name="ai-contact" content="srivallabhkakarala@gmail.com" />
      
      {/* Structured Data */}
      {isArticle && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;