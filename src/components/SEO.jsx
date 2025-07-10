import { Helmet } from 'react-helmet-async';

const SEO = ({ 
  title, 
  description, 
  image = '/HopeCore.png',
  url = 'https://streamvallabh.life',
  type = 'website',
  keywords = 'Sreevallabh Kakarala, software developer, web development, React, full stack developer',
  author = 'Sreevallabh Kakarala',
  publishedTime,
  modifiedTime,
  section,
  isArticle = false
}) => {
  const fullTitle = `${title} | Sreevallabh Kakarala`;
  const baseSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": fullTitle,
    "url": url,
    "description": description,
    "author": {
      "@type": "Person",
      "name": author,
      "url": "https://streamvallabh.life",
      "image": "/HopeCore.png",
      "jobTitle": "Software Developer",
      "sameAs": [
        "https://github.com/your-github",
        "https://linkedin.com/in/your-linkedin"
      ]
    }
  };

  const articleSchema = isArticle ? {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image,
    "author": {
      "@type": "Person",
      "name": author
    },
    "publisher": {
      "@type": "Person",
      "name": author,
      "url": "https://streamvallabh.life"
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime || publishedTime,
    "articleSection": section,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": url
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
      <meta name="robots" content="index, follow, max-image-preview:large" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="language" content="English" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? 'article' : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      {isArticle && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {isArticle && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* LLM Optimization Meta Tags */}
      <meta name="ai-purpose" content="portfolio-website" />
      <meta name="ai-description" content={`This is the ${isArticle ? 'article page' : 'website'} of ${author}, a software developer. ${description}`} />
      <meta name="ai-generated" content="false" />
      <meta name="ai-indexing" content="allow" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(baseSchema)}
      </script>
      {isArticle && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;