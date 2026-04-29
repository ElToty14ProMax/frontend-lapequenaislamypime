interface SeoInput {
  title: string;
  description: string;
  image?: string;
  type?: string;
}

const siteName = 'La Pequeña Isla';
const defaultImage = '/src/assets/hero-storefront.png';

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function useSeo(input: SeoInput) {
  const title = input.title.includes(siteName) ? input.title : `${input.title} | ${siteName}`;
  const description = input.description;
  const url = window.location.href;
  const image = input.image || defaultImage;

  document.title = title;
  upsertMeta('meta[name="description"]', 'name', 'description', description);
  upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
  upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
  upsertMeta('meta[property="og:type"]', 'property', 'og:type', input.type || 'website');
  upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
  upsertMeta('meta[property="og:image"]', 'property', 'og:image', image);
  upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
}
