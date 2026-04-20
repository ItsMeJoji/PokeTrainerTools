import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import Sitemap from 'vite-plugin-sitemap';

export default defineConfig({
    plugins: [
        tailwindcss(),
        Sitemap({
            hostname: 'https://poketrainer.tools',
            dynamicRoutes: [
                '/#/pokemon-lookup',
                '/#/encounter',
                '/#/catch-rate',
                '/#/shiny-odds',
                '/#/sos-tracker',
                '/#/mmo-permutations',
                '/#/ribbon-tracker',
                '/#/info/shiny-hunting',
                '/#/info/sos-hunting',
                '/#/info/mmo-guide',
                '/#/info/ribbon-master-guide',
                '/#/contact',
                '/#/privacy',
            ],
        }),
    ],
    base: '/',
    server: {
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin-allow-popups',
        },
    },
})