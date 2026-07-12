import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { APP_ORIGIN } from '@/lib/siteConfig';

const SITE_ORIGIN = APP_ORIGIN;
const DEFAULT_SOCIAL_DESCRIPTION = 'Stampee is a digital loyalty card platform for small businesses, including loyalty program for cafes, loyalty program for spa, loyalty program for laundry, loyalty program for carwash, and loyalty program for salons.';
const DEFAULT_OG_IMAGE = `${SITE_ORIGIN}/social-preview-v2.jpg`;

export type SeoConfig = {
  title: string;
  description: string;
  socialDescription?: string;
  canonical: string;
  robots: string;
  type?: 'website' | 'article';
};

const setMetaTag = (attribute: 'name' | 'property', key: string, content: string) => {
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`) as HTMLMetaElement | null;
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const setCanonicalLink = (href: string) => {
  let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
};

export const getSeoForPathname = (pathname: string): SeoConfig => {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  const canonical = `${SITE_ORIGIN}${normalizedPath}`;
  const defaultSeo: SeoConfig = {
    title: 'Stampee | Digital Loyalty Cards',
    description: DEFAULT_SOCIAL_DESCRIPTION,
    socialDescription: DEFAULT_SOCIAL_DESCRIPTION,
    canonical,
    robots: 'noindex,nofollow',
    type: 'website',
  };

  return defaultSeo;
};

export const SERVICE_UNAVAILABLE_MESSAGE = 'Service is temporarily unavailable. Please try again later.';

const SeoManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    const seo = getSeoForPathname(location.pathname);
    const socialDescription = seo.socialDescription ?? seo.description;

    document.title = seo.title;
    setCanonicalLink(seo.canonical);
    setMetaTag('name', 'description', seo.description);
    setMetaTag('name', 'robots', seo.robots);
    setMetaTag('property', 'og:locale', 'en_US');
    setMetaTag('property', 'og:type', seo.type ?? 'website');
    setMetaTag('property', 'og:site_name', 'Stampee');
    setMetaTag('property', 'og:title', seo.title);
    setMetaTag('property', 'og:description', socialDescription);
    setMetaTag('property', 'og:url', seo.canonical);
    setMetaTag('property', 'og:image', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:url', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:secure_url', DEFAULT_OG_IMAGE);
    setMetaTag('property', 'og:image:type', 'image/jpeg');
    setMetaTag('property', 'og:image:width', '1536');
    setMetaTag('property', 'og:image:height', '1024');
    setMetaTag('property', 'og:image:alt', 'Stampee digital loyalty card preview');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', seo.title);
    setMetaTag('name', 'twitter:description', socialDescription);
    setMetaTag('name', 'twitter:url', seo.canonical);
    setMetaTag('name', 'twitter:image', DEFAULT_OG_IMAGE);
    setMetaTag('name', 'twitter:image:src', DEFAULT_OG_IMAGE);
    setMetaTag('name', 'twitter:image:alt', 'Stampee digital loyalty card preview');
  }, [location.pathname]);

  return null;
};

export default SeoManager;
