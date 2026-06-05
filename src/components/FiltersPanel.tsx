import { useApp } from '../context/AppContext'

import { CITIES, ELO_OPTIONS, INTEREST_OPTIONS } from '../data/constants'

import type { Role, LookingFor } from '../types'



const ROLES: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']

const LOOKING_FOR_OPTIONS: LookingFor[] = [

  'duoQ',

  'amistad',

  'cita',

  'casual',

  'ranked',

]



interface FiltersPanelProps {

  isOpen: boolean

  onClose: () => void

}



export default function FiltersPanel({ isOpen, onClose }: FiltersPanelProps) {

  const { filters, setFilters, applyFilters, clearFilters } = useApp()



  const handleApply = () => {

    applyFilters()

    onClose()

  }



  const toggleClass = (active: boolean) =>

    active

      ? 'border-white text-heading'

      : 'border-theme text-muted hover:border-white/30'



  if (!isOpen) return null



  return (

    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">

      <div

        className="absolute inset-0 bg-rose-900/40"

        onClick={onClose}

      />

      <div className="animate-slide-up relative z-10 max-h-[85vh] w-full max-w-lg overflow-y-auto border border-theme bg-white p-6 shadow-card sm:rounded">

        <div className="mb-6 flex items-center justify-between">

          <h2 className="text-sm font-medium uppercase tracking-widest text-muted">

            Filtros

          </h2>

          <button

            onClick={onClose}

            className="text-sm text-muted hover:text-heading"

          >

            Cerrar

          </button>

        </div>



        <div className="space-y-5">

          <div>

            <label className="mb-1.5 block text-xs text-muted">Ciudad</label>

            <select

              value={filters.city}

              onChange={(e) =>

                setFilters({ ...filters, city: e.target.value })

              }

              className="input-field"

            >

              <option value="">Todas</option>

              {CITIES.map((city) => (

                <option key={city} value={city}>

                  {city}

                </option>

              ))}

            </select>

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">

              Edad: {filters.ageMin} - {filters.ageMax}

            </label>

            <div className="flex items-center gap-4">

              <input

                type="range"

                min={18}

                max={40}

                value={filters.ageMin}

                onChange={(e) =>

                  setFilters({ ...filters, ageMin: Number(e.target.value) })

                }

                className="range-slider flex-1"

              />

              <input

                type="range"

                min={18}

                max={40}

                value={filters.ageMax}

                onChange={(e) =>

                  setFilters({ ...filters, ageMax: Number(e.target.value) })

                }

                className="range-slider flex-1"

              />

            </div>

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">Elo</label>

            <select

              value={filters.elo}

              onChange={(e) =>

                setFilters({ ...filters, elo: e.target.value })

              }

              className="input-field"

            >

              <option value="">Cualquiera</option>

              {ELO_OPTIONS.map((elo) => (

                <option key={elo} value={elo}>

                  {elo}

                </option>

              ))}

            </select>

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">Rol</label>

            <div className="flex flex-wrap gap-2">

              {ROLES.map((role) => (

                <button

                  key={role}

                  onClick={() =>

                    setFilters({

                      ...filters,

                      role: filters.role === role ? '' : role,

                    })

                  }

                  className={`rounded border px-3 py-1.5 text-sm transition-colors ${toggleClass(filters.role === role)}`}

                >

                  {role}

                </button>

              ))}

            </div>

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">Busca</label>

            <div className="flex flex-wrap gap-2">

              {LOOKING_FOR_OPTIONS.map((lf) => (

                <button

                  key={lf}

                  onClick={() =>

                    setFilters({

                      ...filters,

                      lookingFor: filters.lookingFor === lf ? '' : lf,

                    })

                  }

                  className={`rounded border px-3 py-1.5 text-sm capitalize transition-colors ${toggleClass(filters.lookingFor === lf)}`}

                >

                  {lf}

                </button>

              ))}

            </div>

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">

              Distancia: {filters.maxDistance} km

            </label>

            <input

              type="range"

              min={5}

              max={200}

              step={5}

              value={filters.maxDistance}

              onChange={(e) =>

                setFilters({

                  ...filters,

                  maxDistance: Number(e.target.value),

                })

              }

              className="range-slider w-full"

            />

          </div>



          <div>

            <label className="mb-1.5 block text-xs text-muted">Intereses</label>

            <input

              type="text"

              placeholder="anime, gaming..."

              value={filters.interests}

              onChange={(e) =>

                setFilters({ ...filters, interests: e.target.value })

              }

              className="input-field"

            />

            <div className="mt-2 flex flex-wrap gap-1.5">

              {INTEREST_OPTIONS.slice(0, 8).map((interest) => (

                <button

                  key={interest}

                  onClick={() =>

                    setFilters({ ...filters, interests: interest })

                  }

                  className="rounded border border-theme px-2 py-1 text-xs text-muted hover:border-theme hover:text-body"

                >

                  {interest}

                </button>

              ))}

            </div>

          </div>

        </div>



        <div className="mt-6 flex gap-3">

          <button onClick={clearFilters} className="btn-secondary flex-1">

            Limpiar

          </button>

          <button onClick={handleApply} className="btn-primary flex-1">

            Aplicar

          </button>

        </div>

      </div>

    </div>

  )

}

