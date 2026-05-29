import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const siteUrl = 'https://poketrainer.tools';
const seoImageUrl = `${siteUrl}/poketrainer-tools-logo.png`;

const spaRoutes = [
    '/pokemon-lookup',
    '/encounter',
    '/catch-rate',
    '/shiny-odds',
    '/sos-tracker',
    '/mmo-permutations',
    '/ribbon-tracker',
    '/shiny-bingo',
    '/info/shiny-hunting',
    '/info/sos-hunting',
    '/info/mmo-guide',
    '/info/ribbon-master-guide',
    '/about',
    '/contact',
    '/privacy',
];
const sitemapRoutes = spaRoutes.map((route) => `${route}/`);

const routeSeo = {
    '/pokemon-lookup': {
        title: 'Pokemon Lookup | PokeTrainer Tools',
        description: 'Find where any Pokemon can be encountered across games, with encounter rates and level ranges.',
        heading: 'Pokemon Lookup',
    },
    '/encounter': {
        title: 'Encounter Calculator | PokeTrainer Tools',
        description: 'Calculate wild encounter pools by game, location, and encounter method.',
        heading: 'Encounter Calculator',
    },
    '/catch-rate': {
        title: 'Catch Rate Calculator | PokeTrainer Tools',
        description: 'Estimate Pokeball capture odds with status, HP, and generation-specific formulas.',
        heading: 'Catch Rate Calculator',
    },
    '/shiny-odds': {
        title: 'Shiny Odds Calculator | PokeTrainer Tools',
        description: 'Compare shiny odds across methods and generations to plan your hunts.',
        heading: 'Shiny Odds Calculator',
    },
    '/sos-tracker': {
        title: 'SOS Move Tracker | PokeTrainer Tools',
        description: 'Track SOS chain helper moves and optimize chaining sessions.',
        heading: 'SOS Move Tracker',
    },
    '/mmo-permutations': {
        title: 'MMO Permutations | PokeTrainer Tools',
        description: 'Explore Massive Mass Outbreak permutations and shiny route planning.',
        heading: 'MMO Permutations',
    },
    '/ribbon-tracker': {
        title: 'Ribbon Tracker | PokeTrainer Tools',
        description: 'Track ribbons and marks for your Pokemon across games and generations.',
        heading: 'Ribbon Tracker',
    },
    '/shiny-bingo': {
        title: 'Shiny Bingo Generator | PokeTrainer Tools',
        description: 'Generate and export shiny hunting bingo boards for your next challenge.',
        heading: 'Shiny Bingo Generator',
    },
    '/info/shiny-hunting': {
        title: 'Shiny Hunting Guide | PokeTrainer Tools',
        description: 'Learn shiny hunting methods, odds, and practical strategies.',
        heading: 'Shiny Hunting Guide',
    },
    '/info/sos-hunting': {
        title: 'SOS Chaining Guide | PokeTrainer Tools',
        description: 'SOS chaining fundamentals, setup, and best practices in Alola games.',
        heading: 'SOS Chaining Guide',
    },
    '/info/mmo-guide': {
        title: 'MMO Guide | PokeTrainer Tools',
        description: 'A practical guide to MMO routes, checks, and reset workflows in PLA.',
        heading: 'MMO Permutation Guide',
    },
    '/info/ribbon-master-guide': {
        title: 'Ribbon Master Guide | PokeTrainer Tools',
        description: 'A complete Ribbon Master progression guide across generations.',
        heading: 'Ribbon Master Guide',
    },
    '/about': {
        title: 'About Us | PokeTrainer Tools',
        description: 'Learn about PokeTrainer Tools and the credits behind the site, logo, data, and Pokemon resources.',
        heading: 'About Us',
    },
    '/contact': {
        title: 'Contact | PokeTrainer Tools',
        description: 'Contact the creator of PokeTrainer Tools with feedback and corrections.',
        heading: 'Contact',
    },
    '/privacy': {
        title: 'Privacy Policy | PokeTrainer Tools',
        description: 'Privacy details for PokeTrainer Tools, including Google Drive sync behavior.',
        heading: 'Privacy Policy',
    },
};

function escapeAttribute(value) {
    return value.replace(/"/g, '&quot;');
}

function removeExistingSeoTags(html) {
    return html
        .replace(/\n?\s*<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, '')
        .replace(/\n?\s*<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi, '')
        .replace(/\n?\s*<meta\s+property="og:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '')
        .replace(/\n?\s*<meta\s+name="twitter:[^"]+"\s+content="[^"]*"\s*\/?>/gi, '');
}

function createSeoTags(meta, canonical) {
    const title = escapeAttribute(meta.title);
    const description = escapeAttribute(meta.description);

    return [
        `  <meta name="description" content="${description}" />`,
        `  <link rel="canonical" href="${canonical}" />`,
        '  <meta property="og:type" content="website" />',
        `  <meta property="og:title" content="${title}" />`,
        `  <meta property="og:description" content="${description}" />`,
        `  <meta property="og:url" content="${canonical}" />`,
        `  <meta property="og:image" content="${seoImageUrl}" />`,
        '  <meta property="og:image:alt" content="PokéTrainer Tools logo" />',
        '  <meta name="twitter:card" content="summary_large_image" />',
        `  <meta name="twitter:title" content="${title}" />`,
        `  <meta name="twitter:description" content="${description}" />`,
        `  <meta name="twitter:image" content="${seoImageUrl}" />`,
    ].join('\n');
}

function toRouteHtml(indexHtml, route) {
    const meta = routeSeo[route] || {
        title: 'PokeTrainer Tools',
        description: 'Pokemon calculators, trackers, and guides.',
        heading: 'PokeTrainer Tools',
    };

    const canonical = `${siteUrl}${route}/`;
    const fallbackContent = `
    <main style="max-width: 960px; margin: 2rem auto; padding: 0 1rem; font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;">
      <h1>${meta.heading}</h1>
      <p>${meta.description}</p>
      <p><a href="/">Back to home</a></p>
    </main>
  `;

    let html = removeExistingSeoTags(indexHtml).replace(/<title>[\s\S]*?<\/title>/i, `<title>${meta.title}</title>`);

    if (html.includes('</head>')) {
        html = html.replace(
            '</head>',
            `${createSeoTags(meta, canonical)}\n</head>`
        );
    }

    html = html.replace('<div id="app">', `<div id="app">${fallbackContent}`);
    return html;
}

function staticRoutePages(routes) {
    let outDir = 'dist';

    return {
        name: 'static-route-pages',
        apply: 'build',
        configResolved(config) {
            outDir = config.build.outDir;
        },
        async closeBundle() {
            const indexPath = path.join(outDir, 'index.html');
            const indexHtml = await readFile(indexPath, 'utf-8');
            for (const route of routes) {
                const trimmedRoute = route.replace(/^\/+|\/+$/g, '');
                if (!trimmedRoute) continue;

                const routeDir = path.join(outDir, trimmedRoute);
                await mkdir(routeDir, { recursive: true });
                await writeFile(path.join(routeDir, 'index.html'), toRouteHtml(indexHtml, route), 'utf-8');
            }
        },
    };
}

function enforceTrailingSlashInSitemap() {
    let outDir = 'dist';

    return {
        name: 'enforce-trailing-slash-in-sitemap',
        apply: 'build',
        configResolved(config) {
            outDir = config.build.outDir;
        },
        async closeBundle() {
            const sitemapPath = path.join(outDir, 'sitemap.xml');
            let xml;

            try {
                xml = await readFile(sitemapPath, 'utf-8');
            } catch {
                return;
            }

            const patched = xml.replace(/<loc>(https:\/\/poketrainer\.tools(?:\/[^<]*)?)<\/loc>/g, (match, url) => {
                if (url === 'https://poketrainer.tools/' || url.endsWith('/')) {
                    return `<loc>${url}</loc>`;
                }
                return `<loc>${url}/</loc>`;
            });

            if (patched !== xml) {
                await writeFile(sitemapPath, patched, 'utf-8');
            }
        },
    };
}

export default defineConfig({
    plugins: [
        tailwindcss(),
        staticRoutePages(spaRoutes),
        Sitemap({
            hostname: siteUrl,
            dynamicRoutes: sitemapRoutes,
            exclude: ['/404', '/404/'],
        }),
        enforceTrailingSlashInSitemap(),
    ],
    base: '/',
})
