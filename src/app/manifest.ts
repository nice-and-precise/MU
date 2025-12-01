import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Midwest Underground HDD',
        short_name: 'MU HDD',
        description: 'Field Operations & Drilling Management Platform',
        start_url: '/dashboard',
        display: 'standalone',
        background_color: '#0f172a', // Slate 900
        theme_color: '#fbbf24', // Amber 400 (Safety Yellow)
        icons: [
            {
                src: '/icon/medium',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable'
            },
            {
                src: '/icon/large',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable'
            }
        ],
        orientation: 'portrait-primary',
        categories: ['productivity', 'utilities', 'construction']
    };
}
