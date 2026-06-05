import type { Locale } from '../i18n'

export const SITE_NAME = 'Lol-edate'

export function getSiteUrl(): string {
  const fromEnv = import.meta.env.VITE_SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  return 'https://loledate.app'
}

export type SeoPageKey = 'home' | 'login' | 'register' | 'app'

export interface PageSeo {
  title: string
  description: string
  keywords: string
  robots: string
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

export function resolveSeoPageKey(pathname: string): SeoPageKey {
  if (pathname === '/') return 'home'
  if (pathname === '/login') return 'login'
  if (pathname === '/register') return 'register'
  return 'app'
}

export function buildPageSeo(
  key: SeoPageKey,
  locale: Locale,
  pathname: string
): PageSeo {
  const siteUrl = getSiteUrl()
  const canonical = `${siteUrl}${pathname === '/' ? '' : pathname}`

  const copy = SEO_COPY[locale][key]

  if (key === 'home') {
    const home = copy as (typeof SEO_COPY)['es']['home']
    return {
      title: home.title,
      description: home.description,
      keywords: home.keywords,
      robots: home.robots,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: SITE_NAME,
          url: siteUrl,
          description: home.description,
          inLanguage: ['es', 'en'],
          potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/register`,
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: SITE_NAME,
          url: siteUrl,
          applicationCategory: 'SocialNetworkingApplication',
          operatingSystem: 'Web',
          browserRequirements: 'Requires JavaScript',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'EUR',
          },
          description: home.description,
          featureList: home.features,
        },
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: home.faq.map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.a,
            },
          })),
        },
      ],
    }
  }

  return {
    title: copy.title,
    description: copy.description,
    keywords: copy.keywords,
    robots: copy.robots,
    jsonLd:
      key === 'app'
        ? undefined
        : {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: copy.title,
            description: copy.description,
            url: canonical,
            isPartOf: {
              '@type': 'WebSite',
              name: SITE_NAME,
              url: siteUrl,
            },
          },
  }
}

const SEO_COPY = {
  es: {
    home: {
      title: 'Lol-edate — Matchmaking, duoQ y citas para jugadores de LoL',
      description:
        'Encuentra duoQ, amigos o pareja en League of Legends. Matchmaking por elo, rol, mains y ciudad. Gratis, chat en tiempo real y perfiles con canción favorita.',
      keywords:
        'lol edate, league of legends dating, matchmaking lol, duoq, encontrar duo lol, citas gamers, amigos league of legends, ligar lol, elo rol main',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      features: [
        'Matchmaking por elo y rol',
        'Filtros por ciudad e intereses',
        'Chat en tiempo real',
        'Perfiles con canción favorita',
        'Estado online y última conexión',
      ],
      faq: [
        {
          q: '¿Qué es Lol-edate?',
          a: 'Lol-edate es una plataforma de matchmaking para jugadores de League of Legends. Te empareja por elo, rol, mains e intereses para duoQ, amistad o citas.',
        },
        {
          q: '¿Es gratis?',
          a: 'Sí. Registrarte, crear tu perfil, descubrir jugadores y chatear es gratuito.',
        },
        {
          q: '¿Cómo encuentro duo para ranked?',
          a: 'Completa tu perfil con tu Riot ID, elo y rol, usa los filtros en Descubrir y haz match con jugadores compatibles.',
        },
        {
          q: '¿Está afiliado a Riot Games?',
          a: 'No. Lol-edate no está afiliado, respaldado ni patrocinado por Riot Games.',
        },
      ],
    },
    login: {
      title: 'Iniciar sesión — Lol-edate',
      description:
        'Entra en Lol-edate con tu usuario y contraseña. Matchmaking para jugadores de League of Legends.',
      keywords: 'lol edate login, entrar lol edate, league of legends matchmaking',
      robots: 'index, follow',
    },
    register: {
      title: 'Registrarse gratis — Lol-edate',
      description:
        'Crea tu cuenta en Lol-edate en segundos. Sin correo. Encuentra duoQ, amigos o pareja en LoL.',
      keywords: 'registro lol edate, crear cuenta league of legends dating, duoq gratis',
      robots: 'index, follow',
    },
    app: {
      title: 'Lol-edate',
      description: 'Matchmaking para jugadores de League of Legends.',
      keywords: 'lol edate',
      robots: 'noindex, nofollow',
    },
  },
  en: {
    home: {
      title: 'Lol-edate — LoL matchmaking, duoQ & dating for League players',
      description:
        'Find duoQ partners, friends or dates in League of Legends. Match by rank, role, mains and city. Free signup, realtime chat and profiles with a favorite song.',
      keywords:
        'lol edate, league of legends dating, lol matchmaking, duoq finder, lol friends, gamer dating, league duo, rank role mains',
      robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
      features: [
        'Matchmaking by rank and role',
        'Filters by city and interests',
        'Realtime chat',
        'Profiles with a favorite song',
        'Online status and last seen',
      ],
      faq: [
        {
          q: 'What is Lol-edate?',
          a: 'Lol-edate is a matchmaking platform for League of Legends players. It matches you by rank, role, mains and interests for duoQ, friendship or dating.',
        },
        {
          q: 'Is it free?',
          a: 'Yes. Signing up, creating your profile, discovering players and chatting is free.',
        },
        {
          q: 'How do I find a ranked duo?',
          a: 'Complete your profile with Riot ID, rank and role, use Discover filters and match with compatible players.',
        },
        {
          q: 'Is it affiliated with Riot Games?',
          a: 'No. Lol-edate is not affiliated with, endorsed by or sponsored by Riot Games.',
        },
      ],
    },
    login: {
      title: 'Log in — Lol-edate',
      description:
        'Sign in to Lol-edate with your username and password. Matchmaking for League of Legends players.',
      keywords: 'lol edate login, league of legends matchmaking sign in',
      robots: 'index, follow',
    },
    register: {
      title: 'Sign up free — Lol-edate',
      description:
        'Create your Lol-edate account in seconds. No email required. Find duoQ, friends or dates in LoL.',
      keywords: 'lol edate sign up, league of legends dating register, free duoq',
      robots: 'index, follow',
    },
    app: {
      title: 'Lol-edate',
      description: 'Matchmaking for League of Legends players.',
      keywords: 'lol edate',
      robots: 'noindex, nofollow',
    },
  },
} as const

export function getOgImageUrl(): string {
  return `${getSiteUrl()}/fotoportada.png`
}
