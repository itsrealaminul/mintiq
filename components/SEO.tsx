export function JsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'MINTIQ',
    description: 'বাংলাদেশের #১ মাইক্রো আর্নিং প্ল্যাটফর্ম — বিজ্ঞাপন দেখুন, ভিডিও দেখুন, সার্ভে করুন, গেম খেলুন এবং টাকা আয় করুন',
    url: 'https://mintiq-rose.vercel.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'BDT',
    },
    author: {
      '@type': 'Person',
      name: 'Aminul Islam',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
