import path from 'node:path';
import fs from 'node:fs';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/**
 * The site's public origin, resolved once at build time.
 *
 * Set VITE_SITE_URL in the hosting environment to pin the canonical host.
 * Netlify and Vercel both expose the deploy URL, so we fall back to those
 * before the hardcoded default — that keeps canonical/OG tags pointing at a
 * host that actually resolves even when the custom domain lapses.
 */
const resolveSiteUrl = (env) =>
	(
		env.VITE_SITE_URL ||
		process.env.VITE_SITE_URL ||
		process.env.URL || // Netlify: the site's primary URL
		(process.env.VERCEL_PROJECT_PRODUCTION_URL
			? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
			: '') ||
		'https://sreevallabh.me'
	).replace(/\/+$/, '');

/**
 * Replaces the __SITE_URL__ token in index.html and in the static files that
 * cannot import JavaScript (sitemap.xml, robots.txt).
 *
 * A token rather than Vite's %VITE_VAR% syntax on purpose: an unset %VITE_VAR%
 * is left in the output verbatim, which would ship a literally broken URL.
 * This always substitutes something valid.
 */
const siteUrlPlugin = (siteUrl) => ({
	name: 'inject-site-url',
	transformIndexHtml: {
		order: 'pre',
		handler: (html) => html.replaceAll('__SITE_URL__', siteUrl),
	},
	// public/ is copied verbatim, so patch the emitted copies afterwards.
	closeBundle() {
		for (const file of ['sitemap.xml', 'robots.txt']) {
			const target = path.resolve(__dirname, 'dist', file);
			if (!fs.existsSync(target)) continue;
			const contents = fs.readFileSync(target, 'utf8');
			fs.writeFileSync(target, contents.replaceAll('__SITE_URL__', siteUrl));
		}
	},
});

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	const siteUrl = resolveSiteUrl(env);

	return {
		plugins: [react(), siteUrlPlugin(siteUrl)],
		define: {
			// Lets src/lib/site.js fall back to the same value the HTML uses.
			__BUILD_SITE_URL__: JSON.stringify(siteUrl),
		},
		server: {
			cors: true,
			// No Cross-Origin-Embedder-Policy here: nothing needs cross-origin
			// isolation, production doesn't send it, and it blocks third-party
			// iframes such as the YouTube player on the developer page.
			allowedHosts: true,
			proxy: {
				'/api': {
					target: 'http://localhost:8000',
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/api/, ''),
				},
			},
		},
		resolve: {
			extensions: ['.jsx', '.js', '.tsx', '.ts', '.json'],
			alias: {
				'@': path.resolve(__dirname, './src'),
			},
		},
		build: {
			outDir: 'dist',
			minify: 'terser',
			sourcemap: false,
			rollupOptions: {
				output: {
					// Function form rather than the object form. The object form
					// only matches a package imported by that exact specifier, so a
					// transitively-reached copy of react or three leaked into the
					// entry chunk instead of landing here. Matching on the resolved
					// module path catches those too.
					manualChunks(id) {
						if (!id.includes('node_modules')) return undefined;
						const path = id.replace(/\\/g, '/');
						if (/node_modules\/(three|@react-three)\//.test(path)) return 'three';
						if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler)\//.test(path)) {
							return 'vendor';
						}
						return undefined;
					},
				},
			},
		},
	};
});
