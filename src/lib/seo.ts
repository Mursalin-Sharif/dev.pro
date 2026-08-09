const SITE_NAME = 'Hopeland Global Checkers'
const SITE_URL = 'https://www.hopelandglobalcheckers.com'

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    sameAs: [],
  }
}

export function eventJsonLd(opts: { name: string; startDate: string; endDate: string; location: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: opts.name,
    startDate: opts.startDate,
    endDate: opts.endDate,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    location: {
      '@type': 'Place',
      name: opts.location,
    },
    organizer: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  }
}

export function articleJsonLd(opts: {
  title: string
  description: string
  author: string
  datePublished: string
  dateModified?: string
  slug: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.title,
    description: opts.description,
    author: { '@type': 'Person', name: opts.author },
    datePublished: opts.datePublished,
    dateModified: opts.dateModified ?? opts.datePublished,
    image: opts.image,
    mainEntityOfPage: `${SITE_URL}/blog/${opts.slug}`,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/favicon.svg` },
    },
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export { SITE_NAME, SITE_URL }
