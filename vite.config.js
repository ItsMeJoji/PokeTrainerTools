import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
    '/contact',
    '/privacy',
];

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
                await writeFile(path.join(routeDir, 'index.html'), indexHtml, 'utf-8');
            }
        },
    };
}

export default defineConfig({
    plugins: [
        tailwindcss(),
        staticRoutePages(spaRoutes),
        Sitemap({
            hostname: 'https://poketrainer.tools',
            dynamicRoutes: spaRoutes,
            exclude: ['/404'],
        }),
    ],
    base: '/',
})
