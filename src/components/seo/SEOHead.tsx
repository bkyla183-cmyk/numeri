import React, { useEffect } from 'react';
import { CalculatorItem, CalculatorCategory, BlogPost } from '../../types';
import { calculators, calcCategories } from '../../data';

interface Props {
  title?: string;
  description?: string;
  canonicalPath?: string;
  calculator?: CalculatorItem;
  category?: CalculatorCategory;
  post?: BlogPost;
  type?: 'website' | 'article' | 'calculator';
  isNoindex?: boolean;
}

export const SEOHead: React.FC<Props> = ({
  title,
  description,
  canonicalPath = '',
  calculator,
  category,
  post,
  type = 'website',
  isNoindex = false,
}) => {
  useEffect(() => {
    const shouldNoindex =
      isNoindex || canonicalPath === '/404' || canonicalPath === '/saved' || canonicalPath === '/compare';

    // 1. Determine Title (exact parity with scripts/prerender.ts)
    let pageTitle = 'Numeriq – Practical Online Calculators & Clear Answers';
    if (calculator) {
      const legacyStyle = `${calculator.name} – Free Online Calculator | Numeriq`;
      pageTitle =
        calculator.name.length <= 28 && !/converter/i.test(calculator.name)
          ? legacyStyle
          : calculator.meta_title || `${calculator.name} | Numeriq`;
    } else if (post) {
      const fullHubTitle = `${post.title} | Numeriq Knowledge Hub`;
      pageTitle = fullHubTitle.length <= 76 ? fullHubTitle : `${post.title} | Numeriq`;
    } else if (category) {
      pageTitle = `${category.name} Calculators (Free Online Tools) – Numeriq`;
    } else if (title) {
      pageTitle = /numeriq/i.test(title) ? title : `${title} | Numeriq`;
    }
    document.title = pageTitle;

    // 2. Determine Description
    let pageDesc =
      `Access ${calculators.length} curated, double-precision online calculators for mortgage, loans, tax, BMI, calories, GPA, statistics, and unit conversions.`;
    if (calculator) {
      pageDesc = calculator.meta_description || calculator.description;
    } else if (post) {
      pageDesc = post.meta_description || post.excerpt;
    } else if (description) {
      pageDesc = description;
    }

    const setMeta = (attr: string, key: string, content: string) => {
      let tag = document.querySelector(`meta[${attr}="${key}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attr, key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    setMeta('name', 'description', pageDesc);
    setMeta('property', 'og:site_name', 'Numeriq');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', pageDesc);
    setMeta('property', 'og:type', type === 'article' ? 'article' : 'website');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', pageDesc);

    // Robots directive
    if (shouldNoindex) {
      setMeta('name', 'robots', 'noindex, follow');
    } else {
      setMeta('name', 'robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
    }

    // 3. Update Canonical Link, og:url & og:image / twitter:image
    const currentOrigin =
      typeof window !== 'undefined' && window.location?.origin
        ? window.location.origin.replace(/\/+$/, '')
        : '';

    const fullCanonical = currentOrigin
      ? canonicalPath === '/' || canonicalPath === ''
        ? `${currentOrigin}/`
        : `${currentOrigin}${canonicalPath}`
      : '';

    if (currentOrigin) {
      const ogImg = `${currentOrigin}/og-image.jpg`;
      setMeta('property', 'og:image', ogImg);
      setMeta('property', 'og:image:alt', pageTitle);
      setMeta('name', 'twitter:image', ogImg);
      setMeta('name', 'twitter:image:alt', pageTitle);
    }

    if (fullCanonical && !shouldNoindex) {
      setMeta('property', 'og:url', fullCanonical);
    }

    let canonicalTag = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (shouldNoindex || !fullCanonical) {
      if (canonicalTag) canonicalTag.remove();
    } else {
      if (!canonicalTag) {
        canonicalTag = document.createElement('link');
        canonicalTag.setAttribute('rel', 'canonical');
        document.head.appendChild(canonicalTag);
      }
      canonicalTag.setAttribute('href', fullCanonical);
    }

    let sitemapTag = document.querySelector('link[rel="sitemap"]') as HTMLLinkElement | null;
    if (!sitemapTag) {
      sitemapTag = document.createElement('link');
      sitemapTag.setAttribute('rel', 'sitemap');
      sitemapTag.setAttribute('type', 'application/xml');
      sitemapTag.setAttribute('title', 'Sitemap');
      document.head.appendChild(sitemapTag);
    }
    sitemapTag.setAttribute('href', currentOrigin ? `${currentOrigin}/sitemap.xml` : '/sitemap.xml');

    // 4. Schema.org JSON-LD Generation
    const existingScript = document.getElementById('numeriq-jsonld');
    if (existingScript) {
      existingScript.remove();
    }

    const schemaGraph: Record<string, unknown>[] = [];

    if (calculator && currentOrigin) {
      const calcCanonical = `${currentOrigin}/calculator/${calculator.slug}`;
      const cat = calcCategories.find((c) => c.slug === calculator.category_slug);

      schemaGraph.push({
        '@type': 'WebApplication',
        '@id': calcCanonical,
        name: calculator.name,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'All',
        url: calcCanonical,
        description: calculator.description,
        inLanguage: ['en-US', 'en-GB', 'en-CA', 'en-AU'],
        dateModified: '2026-11-20',
        author: { '@type': 'Organization', name: 'Numeriq Editorial Team' },
        publisher: { '@type': 'Organization', name: 'Numeriq', url: `${currentOrigin}/` },
        publishingPrinciples: `${currentOrigin}/about`,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        ...(calculator.formula ? { featureList: `Formula: ${calculator.formula}` } : {}),
      });

      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: `${currentOrigin}/`,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Calculators',
            item: `${currentOrigin}/calculators`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: cat?.name || calculator.category_slug,
            item: `${currentOrigin}/category/${calculator.category_slug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: calculator.name,
            item: calcCanonical,
          },
        ],
      });
    } else if (category && currentOrigin) {
      const catCanonical = `${currentOrigin}/category/${category.slug}`;

      schemaGraph.push({
        '@type': 'CollectionPage',
        '@id': catCanonical,
        name: `${category.name} Calculators`,
        description: pageDesc,
        url: catCanonical,
      });

      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${currentOrigin}/` },
          { '@type': 'ListItem', position: 2, name: 'Categories', item: `${currentOrigin}/categories` },
          { '@type': 'ListItem', position: 3, name: category.name, item: catCanonical },
        ],
      });
    } else if (post && currentOrigin) {
      const postCanonical = `${currentOrigin}/guide/${post.slug}`;

      schemaGraph.push({
        '@type': 'Article',
        '@id': postCanonical,
        headline: post.title,
        description: post.excerpt,
        url: postCanonical,
        inLanguage: 'en-US',
        author: {
          '@type': 'Organization',
          name: post.author || 'Numeriq Editorial Team',
        },
        publisher: {
          '@type': 'Organization',
          name: 'Numeriq',
          url: `${currentOrigin}/`,
          logo: {
            '@type': 'ImageObject',
            url: `${currentOrigin}/favicon.svg`,
          },
        },
        datePublished: post.created_at || '2024-11-15T10:00:00Z',
        dateModified: post.updated_at || post.created_at || '2024-11-15T10:00:00Z',
      });

      schemaGraph.push({
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${currentOrigin}/` },
          { '@type': 'ListItem', position: 2, name: 'Knowledge Hub', item: `${currentOrigin}/blog` },
          { '@type': 'ListItem', position: 3, name: post.title, item: postCanonical },
        ],
      });
    } else if (currentOrigin && !shouldNoindex && (canonicalPath === '/' || canonicalPath === '')) {
      schemaGraph.push({
        '@type': 'Organization',
        '@id': `${currentOrigin}/#organization`,
        name: 'Numeriq',
        url: `${currentOrigin}/`,
        logo: {
          '@type': 'ImageObject',
          url: `${currentOrigin}/favicon.svg`,
        },
      });

      schemaGraph.push({
        '@type': 'WebSite',
        '@id': `${currentOrigin}/#website`,
        name: 'Numeriq',
        url: `${currentOrigin}/`,
        description:
          `Focused collection of ${calculators.length} curated interactive online calculators for finance, mathematics, statistics, health, and unit conversions.`,
        inLanguage: ['en-US', 'en-GB', 'en-CA', 'en-AU'],
        publisher: { '@id': `${currentOrigin}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: `${currentOrigin}/calculators?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      });
    }

    if (schemaGraph.length > 0) {
      const scriptTag = document.createElement('script');
      scriptTag.id = 'numeriq-jsonld';
      scriptTag.type = 'application/ld+json';
      scriptTag.text = JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': schemaGraph,
      });
      document.head.appendChild(scriptTag);
    }
  }, [title, description, canonicalPath, calculator, category, post, type, isNoindex]);

  return null;
};
