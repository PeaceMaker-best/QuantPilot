import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SignalFoundry · 量化研究工作台',
    short_name: 'SignalFoundry',
    description: '从真实行情与证据出发，生成、评测和治理可验证的量化研究看板。',
    start_url: '/',
    display: 'standalone',
    background_color: '#f8fafc',
    theme_color: '#de5d48',
    icons: [
      {
        src: '/icons/signalfoundry-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/signalfoundry-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
