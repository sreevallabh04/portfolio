/**
 * The site's public origin — the single place the domain is defined.
 *
 * It used to be hardcoded in 33 places across 11 files (canonical URLs, OG and
 * Twitter images, JSON-LD, the sitemap, the Terms copy). When the domain
 * lapsed, every one of those pointed at a host that no longer resolved, and
 * moving to a new domain meant a find-and-replace across the whole tree.
 *
 * Resolution order:
 *   1. VITE_SITE_URL, set per environment. Prefer this in production — it
 *      pins one canonical host even when the site is reachable at several
 *      (e.g. both a custom domain and the *.netlify.app subdomain), which is
 *      what search engines need to avoid treating them as duplicates.
 *   2. The origin the page is actually served from. Keeps canonical and OG
 *      tags correct on preview deploys and on whatever domain comes next,
 *      with no configuration.
 *   3. A build-time constant, for server-side/prerender contexts where there
 *      is no `window`.
 */

// Injected by vite.config.js so the JS and the static HTML always agree on the
// origin. Guarded for tooling that evaluates this file outside a Vite build.
const BUILD_ORIGIN =
  typeof __BUILD_SITE_URL__ === 'string' ? __BUILD_SITE_URL__ : 'https://sreevallabh.me';

const stripTrailingSlash = (value) => value.replace(/\/+$/, '');

const resolveSiteUrl = () => {
  const configured = import.meta.env?.VITE_SITE_URL;
  if (configured) return stripTrailingSlash(configured);
  if (typeof window !== 'undefined' && window.location?.origin) {
    return stripTrailingSlash(window.location.origin);
  }
  return BUILD_ORIGIN;
};

export const SITE_URL = resolveSiteUrl();

/**
 * Turns a path into an absolute URL on this origin. Values that are already
 * absolute are passed through untouched, so callers can mix the two freely.
 */
export const absoluteUrl = (pathOrUrl) => {
  if (!pathOrUrl) return undefined;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
};
