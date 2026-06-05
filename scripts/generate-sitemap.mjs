import { writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const siteUrl = (process.env.VITE_SITE_URL || 'https://loledate.app').replace(
  /\/$/,
  ''
)

const urls = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/register', changefreq: 'monthly', priority: '0.9' },
  { loc: '/login', changefreq: 'monthly', priority: '0.7' },
]

const body = urls
  .map(
    (url) => `  <url>
    <loc>${siteUrl}${url.loc === '/' ? '' : url.loc}</loc>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`
  )
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`

const robots = `User-agent: *
Allow: /
Allow: /login
Allow: /register
Disallow: /discover
Disallow: /profile
Disallow: /matches
Disallow: /chat/
Disallow: /user/

Sitemap: ${siteUrl}/sitemap.xml
`

writeFileSync(resolve('public/sitemap.xml'), xml, 'utf8')
writeFileSync(resolve('public/robots.txt'), robots, 'utf8')

console.log(`SEO files generated for ${siteUrl}`)
