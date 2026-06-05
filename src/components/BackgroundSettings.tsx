import { useEffect, useRef, useState } from 'react'
import { Palette, Settings2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useTheme } from '../context/ThemeContext'
import {
  DEFAULT_CUSTOM_BACKGROUND,
  ROLE_ACCENT,
  ROLE_PRESETS,
  type BackgroundPreset,
} from '../lib/backgroundPresets'

const iconButtonClass =
  'flex h-10 w-10 items-center justify-center rounded-full border border-theme bg-white/80 text-muted shadow-md backdrop-blur-sm transition-colors hover:border-rose-400/40 hover:text-heading dark:bg-black/80 dark:hover:border-white/30 dark:hover:text-white'

export default function BackgroundSettings() {
  const { t } = useLanguage()
  const {
    backgroundPreset,
    customBackground,
    setBackgroundPreset,
    setCustomBackground,
  } = useTheme()
  const [open, setOpen] = useState(false)
  const [showCustom, setShowCustom] = useState(backgroundPreset === 'custom')
  const panelRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const handlePointer = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (
        panelRef.current?.contains(target) ||
        buttonRef.current?.contains(target)
      ) {
        return
      }
      setOpen(false)
    }

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
    }
  }, [open])

  const pickPreset = (preset: BackgroundPreset) => {
    setBackgroundPreset(preset)
    setShowCustom(preset === 'custom')
  }

  const roleLabel = (role: (typeof ROLE_PRESETS)[number]) =>
    t(`backgroundSettings.roles.${role}`)

  return (
    <div className="fixed left-3 top-[max(0.5rem,env(safe-area-inset-top))] z-[61]">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={iconButtonClass}
        aria-label={t('backgroundSettings.ariaLabel')}
        aria-expanded={open}
        title={t('backgroundSettings.title')}
      >
        <Settings2 className="h-4 w-4" aria-hidden />
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute left-0 top-12 w-[min(calc(100vw-1.5rem),20rem)] animate-slide-up rounded-2xl border border-theme bg-white/95 p-4 shadow-xl backdrop-blur-xl dark:bg-zinc-950/95"
        >
          <div className="mb-3 flex items-center gap-2">
            <Palette className="h-4 w-4 text-muted" aria-hidden />
            <h2 className="text-sm font-semibold text-heading">
              {t('backgroundSettings.title')}
            </h2>
          </div>

          <div className="mb-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => pickPreset('default')}
              className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                backgroundPreset === 'default'
                  ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
                  : 'border-theme bg-theme-card text-body hover:border-rose-300 dark:hover:border-white/20'
              }`}
            >
              {t('backgroundSettings.default')}
            </button>

            {ROLE_PRESETS.map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => pickPreset(role)}
                className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
                  backgroundPreset === role
                    ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
                    : 'border-theme bg-theme-card text-body hover:border-rose-300 dark:hover:border-white/20'
                }`}
              >
                <span
                  className="h-5 w-5 rounded-full ring-2 ring-white/80 dark:ring-black/40"
                  style={{ backgroundColor: ROLE_ACCENT[role] }}
                  aria-hidden
                />
                {roleLabel(role)}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              pickPreset('custom')
              setShowCustom(true)
            }}
            className={`mb-3 w-full rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
              backgroundPreset === 'custom'
                ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
                : 'border-theme bg-theme-card text-body hover:border-rose-300 dark:hover:border-white/20'
            }`}
          >
            {t('backgroundSettings.custom')}
          </button>

          {showCustom && (
            <div className="space-y-3 rounded-xl border border-theme bg-theme-card p-3">
              <label className="block">
                <span className="mb-1.5 block text-xs text-muted">
                  {t('backgroundSettings.customColor1')}
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={customBackground.color1}
                    onChange={(event) => {
                      setCustomBackground({
                        ...customBackground,
                        color1: event.target.value,
                      })
                      setBackgroundPreset('custom')
                    }}
                    className="h-10 w-12 cursor-pointer rounded-lg border border-theme bg-transparent p-1"
                  />
                  <input
                    type="text"
                    value={customBackground.color1}
                    onChange={(event) => {
                      setCustomBackground({
                        ...customBackground,
                        color1: event.target.value,
                      })
                      setBackgroundPreset('custom')
                    }}
                    className="input-field flex-1 py-2 text-xs"
                    spellCheck={false}
                  />
                </div>
              </label>

              <label className="flex items-center gap-2 text-xs text-body">
                <input
                  type="checkbox"
                  checked={customBackground.gradient}
                  onChange={(event) => {
                    setCustomBackground({
                      ...customBackground,
                      gradient: event.target.checked,
                    })
                    setBackgroundPreset('custom')
                  }}
                  className="h-4 w-4 rounded accent-rose-500"
                />
                {t('backgroundSettings.customGradient')}
              </label>

              {customBackground.gradient && (
                <label className="block">
                  <span className="mb-1.5 block text-xs text-muted">
                    {t('backgroundSettings.customColor2')}
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customBackground.color2}
                      onChange={(event) => {
                        setCustomBackground({
                          ...customBackground,
                          color2: event.target.value,
                        })
                        setBackgroundPreset('custom')
                      }}
                      className="h-10 w-12 cursor-pointer rounded-lg border border-theme bg-transparent p-1"
                    />
                    <input
                      type="text"
                      value={customBackground.color2}
                      onChange={(event) => {
                        setCustomBackground({
                          ...customBackground,
                          color2: event.target.value,
                        })
                        setBackgroundPreset('custom')
                      }}
                      className="input-field flex-1 py-2 text-xs"
                      spellCheck={false}
                    />
                  </div>
                </label>
              )}

              <button
                type="button"
                onClick={() =>
                  setCustomBackground({ ...DEFAULT_CUSTOM_BACKGROUND })
                }
                className="text-xs text-muted underline-offset-2 hover:text-heading hover:underline"
              >
                {t('backgroundSettings.resetCustom')}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
