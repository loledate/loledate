import { useState } from 'react'

import { Link } from 'react-router-dom'

import { useApp } from '../context/AppContext'

import ProfileCard from '../components/ProfileCard'

import ActionButtons from '../components/ActionButtons'

import FiltersPanel from '../components/FiltersPanel'

import LikeAnimation from '../components/LikeAnimation'



export default function DiscoverPage() {

  const {
    discoverProfiles,
    currentIndex,
    passProfile,
    likeProfile,
    discoverLoading,
  } = useApp()

  const [filtersOpen, setFiltersOpen] = useState(false)

  const [likeAnim, setLikeAnim] = useState<{

    show: boolean

    type: 'like' | 'super_like'

  }>({ show: false, type: 'like' })



  const currentProfile = discoverProfiles[currentIndex]

  const noMoreProfiles = !currentProfile



  const handleLike = (type: 'like' | 'super_like') => {

    setLikeAnim({ show: true, type })

    likeProfile(type)

    setTimeout(() => setLikeAnim({ show: false, type }), 800)

  }



  return (

    <div className="mx-auto max-w-lg px-4 py-8">

      <div className="mb-6 flex items-center justify-between">

        <h1 className="text-sm font-medium uppercase tracking-widest text-muted">

          Descubrir

        </h1>

        <button

          onClick={() => setFiltersOpen(true)}

          className="text-sm text-body hover:text-heading"

        >

          Filtros

        </button>

      </div>



      {discoverLoading ? (
        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">
          <p className="text-sm text-muted">Cargando perfiles...</p>
        </div>
      ) : noMoreProfiles ? (

        <div className="flex flex-col items-center rounded border border-theme py-20 text-center">

          <h2 className="mb-2 text-sm font-medium text-heading">

            Sin perfiles todavía

          </h2>

          <p className="mb-6 max-w-xs text-sm text-muted">

            Aquí solo ves a otros jugadores. Tu perfil está en{' '}

            <Link to="/profile" className="underline underline-offset-2">

              Perfil

            </Link>

            . Cuando haya más usuarios registrados, aparecerán aquí.

          </p>

          <Link to="/profile" className="btn-primary">

            Completar perfil

          </Link>

        </div>

      ) : (

        <div className="relative">

          <LikeAnimation type={likeAnim.type} show={likeAnim.show} />

          <ProfileCard profile={currentProfile} />



          <div className="mt-8">

            <ActionButtons

              onPass={passProfile}

              onLike={() => handleLike('like')}

              onSuperLike={() => handleLike('super_like')}

            />

          </div>



          <p className="mt-4 text-center text-xs text-muted">

            {currentIndex + 1} / {discoverProfiles.length}

          </p>

        </div>

      )}



      <FiltersPanel isOpen={filtersOpen} onClose={() => setFiltersOpen(false)} />

    </div>

  )

}

