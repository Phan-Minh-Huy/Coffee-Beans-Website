import type {MetadataRoute} from 'next';
export default function sitemap():MetadataRoute.Sitemap{const root=process.env.NEXT_PUBLIC_SITE_URL||'http://localhost:3000';return ['','/menu','/about','/contact'].map(path=>({url:root+path,changeFrequency:'weekly',priority:path?0.7:1}));}
