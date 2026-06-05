import type { Profile, Role } from '../types'
import { DEFAULT_CITY } from './locations'

export { CITIES, DEFAULT_CITY } from './locations'

export const MIN_AGE = 16
export const MAX_AGE = 99



export const ELO_OPTIONS = [

  'Hierro',

  'Bronce',

  'Plata',

  'Oro',

  'Platino',

  'Esmeralda',

  'Diamante',

  'Maestro+',

]



export const INTEREST_OPTIONS = [

  'anime',

  'música',

  'gaming',

  'streaming',

  'gym',

  'café',

  'cosplay',

  'lectura',

  'playa',

  'manga',

  'series',

  'viajes',

  'arte',

  'fútbol',

  'K-pop',

  'gatos',

  'tech',

]



export function createEmptyProfile(userId: string, name: string): Profile {

  return {

    id: '',

    userId,

    name,

    age: 18,

    city: DEFAULT_CITY,

    distanceKm: 0,

    photoUrl: null,

    songUrl: null,

    riotId: '',

    opggUrl: '',

    elo: '',

    role: 'Mid' as Role,

    favoriteChampions: [],

    lookingFor: [],

    bio: '',

    interests: [],

    playSchedule: '',

    discordUsername: '',

    xUsername: '',

  }

}



export function isProfileComplete(profile: Profile): boolean {

  return Boolean(

    profile.name.trim() &&

      profile.age >= MIN_AGE &&

      profile.city &&

      profile.riotId.trim() &&

      profile.role

  )

}

