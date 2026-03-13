import { MetadataRoute } from 'next';

const baseUrl = 'https://mimo-flame.vercel.app';
const apiUrl = 'https://mimo-back.vercel.app';
const locales = ['ar', 'en'];

type Package = {
  _id: string;
  'name-ar': string;
  'name-en': string;
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ['', '/about', '/booking/non', '/terms', '/privacy'];

  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`, // Add root URL for Google Search Console to read the root directly
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    }
  ];

  // 1️⃣ Static routes for each locale
  for (const locale of locales) {
    for (const route of staticRoutes) {
      // Skip adding empty '' twice for the root
      const url = route === '' ? `${baseUrl}/${locale}` : `${baseUrl}/${locale}${route}`;
      sitemapEntries.push({
        url,
        lastModified: new Date(),
        changeFrequency: route === '' ? 'daily' : 'monthly',
        priority: route === '' ? 1.0 : 0.8,
      });
    }
  }

  // 2️⃣ Dynamic packages
  for (const locale of locales) {
    try {
      const res = await fetch(`${apiUrl}/api/home/packages`, {
        headers: { 'lang': locale },
        next: { revalidate: 3600 }
      });

      if (res.ok) {
        const packages: Package[] = await res.json();

        for (const pkg of packages) {
          const name = locale === 'ar' ? pkg['name-ar'] : pkg['name-en'];
          // Remove special characters, spaces to dash, lowercase
          const slug = `${name.replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').toLowerCase()}-${pkg._id}`;
          
          sitemapEntries.push({
            url: `${baseUrl}/${locale}/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
          });
        }
      }
    } catch (error) {
      console.error(`Failed to fetch packages for locale ${locale}:`, error);
    }
  }

  return sitemapEntries;
}
