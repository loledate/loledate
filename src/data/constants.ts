import type { Profile, Role } from '../types'



export const CITIES = [

  'Madrid',

  'Barcelona',

  'Valencia',

  'Sevilla',

  'Málaga',

  'Granada',

  'Bilbao',

  'Zaragoza',

]



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

    id: userId,

    userId,

    name,

    age: 18,

    city: CITIES[0],

    distanceKm: 0,

    photoUrl: null,

    riotId: '',

    opggUrl: '',

    elo: '',

    role: 'Mid' as Role,

    favoriteChampions: [],

    lookingFor: [],

    bio: '',

    interests: [],

    playSchedule: '',

  }

}



export function isProfileComplete(profile: Profile): boolean {

  return Boolean(

    profile.name.trim() &&

      profile.age >= 18 &&

      profile.city &&

      profile.riotId.trim() &&

      profile.role

  )

}

