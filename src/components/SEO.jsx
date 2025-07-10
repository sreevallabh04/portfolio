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
  
  // Base schema for the website
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Sreevallabh Kakarala Portfolio",
    "url": "https://streamvallabh.life",
    "description": "Personal portfolio website of Sreevallabh Kakarala, showcasing software development projects and professional experience.",
    "author": {
      "@type": "Person",
      "name": "Sreevallabh Kakarala",
      "url": "https://streamvallabh.life",
      "image": "/HopeCore.png",
      "jobTitle": "Software Developer",
      "alumniOf": {
        "@type": "CollegeOrUniversity",
        "name": "Vellore Institute of Technology, Chennai",
        "url": "https://chennai.vit.ac.in/"
      },
      "sameAs": [
        "https://github.com/sreevallabh04",
        "https://linkedin.com/in/sreevallabh-kakarala-52ab8a248"
      ]
    }
  };

  // Person schema with detailed information
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": "Sreevallabh Kakarala",
    "description": "Software Engineering student specializing in full-stack development and AI/ML solutions",
    "url": "https://streamvallabh.life",
    "image": "/HopeCore.png",
    "email": "srivallabhkakarala@gmail.com",
    "jobTitle": "Software Developer",
    "alumniOf": {
      "@type": "CollegeOrUniversity",
      "name": "Vellore Institute of Technology, Chennai",
      "url": "https://chennai.vit.ac.in/"
    },
    "knowsAbout": [
      "Web Development",
      "Software Engineering",
      "Artificial Intelligence",
      "Machine Learning",
      "Full Stack Development",
      "React",
      "Node.js",
      "Python"
    ],
    "sameAs": [
      "https://github.com/sreevallabh04",
      "https://linkedin.com/in/sreevallabh-kakarala-52ab8a248"
    ]
  };

  // Article schema for project pages
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
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="generator" content="React" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={isArticle ? 'article' : type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Sreevallabh Kakarala Portfolio" />
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
      <meta property="twitter:creator" content="@sreevallabh" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />

      {/* LLM Optimization Meta Tags */}
      <meta name="ai-purpose" content="portfolio-website" />
      <meta name="ai-description" content={`This is the ${isArticle ? 'article page' : 'website'} of ${author}, a software developer specializing in full-stack development and AI/ML solutions. ${description}`} />
      <meta name="ai-generated" content="false" />
      <meta name="ai-indexing" content="allow" />
      <meta name="ai-content-type" content={isArticle ? 'article' : 'profile'} />
      <meta name="ai-last-updated" content={modifiedTime || new Date().toISOString()} />
      <meta name="ai-keywords" content={keywords} />
      <meta name="ai-author" content={author} />
      <meta name="ai-contact" content="srivallabhkakarala@gmail.com" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(personSchema)}
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