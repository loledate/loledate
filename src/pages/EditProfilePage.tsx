import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { fetchProfileReputation } from '../lib/reputation'
import { CITIES, INTEREST_OPTIONS, isProfileComplete } from '../data/constants'
import { CHAMPIONS, isValidChampion } from '../data/champions'
import type { Role, LookingFor, Profile } from '../types'
import { LOOKING_FOR_LABELS } from '../types'
import Badge from '../components/Badge'
import ProfileCard from '../components/ProfileCard'
import ProfilePhotoEditor from '../components/ProfilePhotoEditor'

const ROLES: Role[] = ['Top', 'Jungle', 'Mid', 'ADC', 'Support']
const LOOKING_FOR_OPTIONS: LookingFor[] = [
  'duoQ',
  'amistad',
  'cita',
  'casual',
  'ranked',
]

export default function EditProfilePage() {
  const { userProfile, profileLoading, saveUserProfile } = useApp()
  const { user } = useAuth()
  const [form, setForm] = useState<Profile | null>(userProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [champInput, setChampInput] = useState('')

  useEffect(() => {
    if (!userProfile) return
    setForm(userProfile)
    if (!initialized) {
      setIsEditing(!isProfileComplete(userProfile))
      setInitialized(true)
    }
  }, [userProfile, initialized])

  useEffect(() => {
    if (!user || !userProfile || isEditing) return

    fetchProfileReputation(user.id, user.id)
      .then((rep) => {
        setForm((prev) =>
          prev
            ? {
                ...prev,
                reputationCount: rep.count,
                reputationTier: rep.tier,
              }
            : prev
        )
      })
      .catch(() => {})
  }, [user, userProfile, isEditing])

  if (profileLoading || !form) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center px-4">
        <p className="text-sm text-muted">Cargando perfil...</p>
      </div>
    )
  }

  const profileComplete = isProfileComplete(form)
  const availableChampions = CHAMPIONS.filter(
    (c) => !form.favoriteChampions.includes(c)
  )

  const update = (field: string, value: unknown) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    setSaved(false)
    setError('')
  }

  const toggleLookingFor = (lf: LookingFor) => {
    const updated = form.lookingFor.includes(lf)
      ? form.lookingFor.filter((x) => x !== lf)
      : [...form.lookingFor, lf]
    update('lookingFor', updated)
  }

  const toggleInterest = (interest: string) => {
    const updated = form.interests.includes(interest)
      ? form.interests.filter((x) => x !== interest)
      : [...form.interests, interest]
    update('interests', updated)
  }

  const addChampion = () => {
    const name = champInput.trim()
    if (!name || !isValidChampion(name)) return
    if (form.favoriteChampions.includes(name)) return
    update('favoriteChampions', [...form.favoriteChampions, name])
    setChampInput('')
  }

  const removeChampion = (champ: string) => {
    update(
      'favoriteChampions',
      form.favoriteChampions.filter((c) => c !== champ)
    )
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    const { error: saveError } = await saveUserProfile(form)
    setSaving(false)

    if (saveError) {
      setError(saveError)
      return
    }

    setSaved(true)
    setIsEditing(false)
    setTimeout(() => setSaved(false), 3000)
  }

  const startEditing = () => {
    if (userProfile) setForm(userProfile)
    setError('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (userProfile) setForm(userProfile)
    setError('')
    setIsEditing(false)
  }

  const handlePhotoChange = async (photoUrl: string | null) => {
    if (!form) return { error: 'No hay perfil cargado.' }

    const updated = { ...form, photoUrl }
    setForm(updated)
    setSaved(false)
    setError('')

    const { error: saveError } = await saveUserProfile(updated)
    if (saveError) {
      setError(saveError)
      return { error: saveError }
    }

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
    return { error: null }
  }

  const toggleClass = (active: boolean) =>
    active
      ? 'border-white text-heading'
      : 'border-theme text-muted hover:border-white/30'

  if (!isEditing) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-sm font-medium uppercase tracking-widest text-muted">
            Mi perfil
          </h1>
          <button
            type="button"
            onClick={startEditing}
            className="btn-secondary px-4 py-2 text-xs"
          >
            Editar
          </button>
        </div>

        {saved && (
          <p className="mb-4 border border-theme p-3 text-center text-sm text-body">
            Perfil guardado.
          </p>
        )}

        {!profileComplete && (
          <p className="mb-6 border border-theme p-4 text-sm text-body">
            Tu perfil está incompleto. Pulsa Editar para añadir Riot ID y el
            resto de datos.
          </p>
        )}

        <ProfileCard profile={form} />

        <div className="mt-6 flex flex-wrap gap-3">
          {profileComplete && (
            <Link to="/discover" className="btn-primary px-6 py-3 text-sm">
              Descubrir jugadores
            </Link>
          )}
          <button
            type="button"
            onClick={startEditing}
            className="btn-secondary px-6 py-3 text-sm"
          >
            Editar perfil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-medium uppercase tracking-widest text-muted">
            Editar perfil
          </h1>
          <p className="mt-1 text-xs text-muted">
            Cambia tus datos y pulsa Guardar.
          </p>
        </div>
        {profileComplete && (
          <button
            type="button"
            onClick={cancelEditing}
            className="text-sm text-muted hover:text-heading"
          >
            Cancelar
          </button>
        )}
      </div>

      {!profileComplete && (
        <p className="mb-6 border border-theme p-4 text-sm text-body">
          Completa nombre, edad, ciudad y Riot ID para poder descubrir otros
          jugadores.
        </p>
      )}

      <div className="space-y-6">
        {user && (
          <ProfilePhotoEditor
            userId={user.id}
            name={form.name}
            photoUrl={form.photoUrl}
            onPhotoChange={handlePhotoChange}
          />
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs text-muted">Nombre</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Edad</label>
            <input
              type="number"
              min={18}
              max={99}
              value={form.age}
              onChange={(e) => update('age', Number(e.target.value))}
              className="input-field"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Ciudad</label>
            <select
              value={form.city}
              onChange={(e) => update('city', e.target.value)}
              className="input-field"
            >
              {CITIES.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs text-muted">Elo</label>
            <input
              type="text"
              value={form.elo}
              onChange={(e) => update('elo', e.target.value)}
              placeholder="Oro II"
              className="input-field"
            />
          </div>
        </div>

        <div className="border border-theme p-5">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
            Cuenta LoL
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-muted">Riot ID</label>
              <input
                type="text"
                value={form.riotId}
                onChange={(e) => update('riotId', e.target.value)}
                placeholder="Nombre#TAG"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted">OP.GG</label>
              <input
                type="url"
                value={form.opggUrl}
                onChange={(e) => update('opggUrl', e.target.value)}
                placeholder="https://op.gg/..."
                className="input-field"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs text-muted">Rol</label>
            <div className="flex flex-wrap gap-2">
              {ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => update('role', role)}
                  className={`rounded border px-3 py-1.5 text-sm transition-colors ${toggleClass(form.role === role)}`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-2 block text-xs text-muted">Campeones</label>
            <div className="mb-2 flex flex-wrap gap-2">
              {form.favoriteChampions.map((champ) => (
                <button
                  key={champ}
                  type="button"
                  onClick={() => removeChampion(champ)}
                  className="group"
                >
                  <Badge>
                    {champ}
                    <span className="ml-1 text-muted group-hover:text-body">
                      x
                    </span>
                  </Badge>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <select
                value={champInput}
                onChange={(e) => setChampInput(e.target.value)}
                className="input-field flex-1"
              >
                <option value="">Elige un campeón...</option>
                {availableChampions.map((champ) => (
                  <option key={champ} value={champ}>
                    {champ}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={addChampion}
                disabled={!champInput}
                className="btn-secondary px-4 disabled:opacity-40"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        <div className="border border-theme p-5">
          <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
            Redes sociales
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs text-muted">Discord</label>
              <input
                type="text"
                value={form.discordUsername}
                onChange={(e) => update('discordUsername', e.target.value)}
                placeholder="tu_usuario"
                className="input-field"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs text-muted">
                X (Twitter)
              </label>
              <input
                type="text"
                value={form.xUsername}
                onChange={(e) => update('xUsername', e.target.value)}
                placeholder="@usuario"
                className="input-field"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Bio</label>
          <textarea
            value={form.bio}
            onChange={(e) => update('bio', e.target.value)}
            rows={3}
            className="input-field resize-none"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs text-muted">Busco</label>
          <div className="flex flex-wrap gap-2">
            {LOOKING_FOR_OPTIONS.map((lf) => (
              <button
                key={lf}
                type="button"
                onClick={() => toggleLookingFor(lf)}
                className={`rounded border px-3 py-1.5 text-sm transition-colors ${toggleClass(form.lookingFor.includes(lf))}`}
              >
                {LOOKING_FOR_LABELS[lf]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs text-muted">Intereses</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map((interest) => (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`rounded border px-3 py-1 text-sm transition-colors ${toggleClass(form.interests.includes(interest))}`}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs text-muted">Horario</label>
          <input
            type="text"
            value={form.playSchedule}
            onChange={(e) => update('playSchedule', e.target.value)}
            placeholder="18:00 - 01:00"
            className="input-field"
          />
        </div>

        {error && <p className="text-sm text-body">{error}</p>}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full py-3 disabled:opacity-40"
        >
          {saving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </div>
  )
}
