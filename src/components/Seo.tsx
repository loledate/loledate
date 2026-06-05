import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useLanguage } from '../context/LanguageContext'
import {
  buildPageSeo,
  getOgImageUrl,
  getSiteUrl,
  resolveSeoPageKey,
  SITE_NAME,
} from '../lib/seo'

const JSON_LD_ID = 'lol-edate-jsonld'

function upsertMeta(
  key: string,
  content: string,
  mode: 'name' | 'property' = 'name'
) {
  const selector = `meta[${mode}="${key}"]`
  let el = document.querySelector<HTMLMetaElement>(selector)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(mode, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang
    ? `link[rel="${rel}"][hreflang="${hreflang}"]`
    : `link[rel="${rel}"]:not([hreflang])`
  let el = document.querySelector<HTMLLinkElement>(selector)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hreflang) el.setAttribute('hreflang', hreflang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

function upsertJsonLd(data: Record<string, unknown> | Record<string, unknown>[]) {
  let el = document.getElementById(JSON_LD_ID) as HTMLScriptElement | null
  if (!el) {
    el = document.createElement('script')
    el.id = JSON_LD_ID
    el.type = 'application/ld+json'
    document.head.appendChild(el)
  }
  el.textContent = JSON.stringify(data)
}

function removeJsonLd() {
  document.getElementById(JSON_LD_ID)?.remove()
}

export default function Seo() {
  const { pathname } = useLocation()
  const { locale } = useLanguage()

  useEffect(() => {
    const pageKey = resolveSeoPageKey(pathname)
    const seo = buildPageSeo(pageKey, locale, pathname)
    const siteUrl = getSiteUrl()
    const canonical =
      pageKey === 'app'
        ? `${siteUrl}/`
        : `${siteUrl}${pathname === '/' ? '' : pathname}`
    const ogImage = getOgImageUrl()
    const ogLocale = locale === 'es' ? 'es_ES' : 'en_US'
    const ogLocaleAlt = locale === 'es' ? 'en_US' : 'es_ES'

    document.title = seo.title

    upsertMeta('description', seo.description)
    upsertMeta('keywords', seo.keywords)
    upsertMeta('robots', seo.robots)
    upsertMeta('author', SITE_NAME)
    upsertMeta('application-name', SITE_NAME)
    upsertMeta('googlebot', seo.robots)

    upsertMeta('og:title', seo.title, 'property')
    upsertMeta('og:description', seo.description, 'property')
    upsertMeta('og:url', canonical, 'property')
    upsertMeta('og:type', pageKey === 'home' ? 'website' : 'article', 'property')
    upsertMeta('og:site_name', SITE_NAME, 'property')
    upsertMeta('og:locale', ogLocale, 'property')
    upsertMeta('og:locale:alternate', ogLocaleAlt, 'property')
    upsertMeta('og:image', ogImage, 'property')
    upsertMeta('og:image:alt', seo.title, 'property')

    upsertMeta('twitter:card', 'summary_large_image')
    upsertMeta('twitter:title', seo.title)
    upsertMeta('twitter:description', seo.description)
    upsertMeta('twitter:image', ogImage)

    upsertLink('canonical', canonical)
    upsertLink('alternate', canonical, 'es')
    upsertLink('alternate', canonical, 'en')
    upsertLink('alternate', canonical, 'x-default')

    if (seo.jsonLd) {
      upsertJsonLd(seo.jsonLd)
    } else {
      removeJsonLd()
    }
  }, [pathname, locale])

  return null
}
