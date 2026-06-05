import { Palette } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import {
  DEFAULT_CUSTOM_BACKGROUND,
  ROLE_ACCENT,
  ROLE_PRESETS,
  type CustomBackgroundConfig,
} from '../lib/backgroundPresets'
import type { ProfileColorPreset } from '../lib/profileColors'

interface ProfileColorEditorProps {
  preset: ProfileColorPreset
  custom: CustomBackgroundConfig
  onChange: (
    preset: ProfileColorPreset,
    custom: CustomBackgroundConfig
  ) => void
}

export default function ProfileColorEditor({
  preset,
  custom,
  onChange,
}: ProfileColorEditorProps) {
  const { t } = useLanguage()

  const pickPreset = (next: ProfileColorPreset) => {
    onChange(next, custom)
  }

  const updateCustom = (patch: Partial<CustomBackgroundConfig>) => {
    onChange('custom', { ...custom, ...patch })
  }

  const roleLabel = (role: (typeof ROLE_PRESETS)[number]) =>
    t(`backgroundSettings.roles.${role}`)

  return (
    <div className="rounded-2xl border border-theme bg-theme-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <Palette className="h-4 w-4 text-muted" aria-hidden />
        <h2 className="text-sm font-semibold text-heading">
          {t('profile.colorTitle')}
        </h2>
      </div>
      <p className="mb-4 text-xs text-muted">{t('profile.colorDescription')}</p>

      <div className="mb-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => pickPreset('default')}
          className={`rounded-xl border px-2 py-2.5 text-xs font-medium transition-colors ${
            preset === 'default'
              ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
              : 'border-theme text-body hover:border-rose-300 dark:hover:border-white/20'
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
              preset === role
                ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
                : 'border-theme text-body hover:border-rose-300 dark:hover:border-white/20'
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
        onClick={() => pickPreset('custom')}
        className={`mb-3 w-full rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
          preset === 'custom'
            ? 'border-rose-400 bg-rose-50 text-rose-900 dark:border-white/40 dark:bg-white/10 dark:text-white'
            : 'border-theme text-body hover:border-rose-300 dark:hover:border-white/20'
        }`}
      >
        {t('backgroundSettings.custom')}
      </button>

      {preset === 'custom' && (
        <div className="space-y-3 rounded-xl border border-theme bg-white/50 p-3 dark:bg-black/40">
          <label className="block">
            <span className="mb-1.5 block text-xs text-muted">
              {t('backgroundSettings.customColor1')}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={custom.color1}
                onChange={(event) =>
                  updateCustom({ color1: event.target.value })
                }
                className="h-10 w-12 cursor-pointer rounded-lg border border-theme bg-transparent p-1"
              />
              <input
                type="text"
                value={custom.color1}
                onChange={(event) =>
                  updateCustom({ color1: event.target.value })
                }
                className="input-field flex-1 py-2 text-xs"
                spellCheck={false}
              />
            </div>
          </label>

          <label className="flex items-center gap-2 text-xs text-body">
            <input
              type="checkbox"
              checked={custom.gradient}
              onChange={(event) =>
                updateCustom({ gradient: event.target.checked })
              }
              className="h-4 w-4 rounded accent-rose-500"
            />
            {t('backgroundSettings.customGradient')}
          </label>

          {custom.gradient && (
            <label className="block">
              <span className="mb-1.5 block text-xs text-muted">
                {t('backgroundSettings.customColor2')}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={custom.color2}
                  onChange={(event) =>
                    updateCustom({ color2: event.target.value })
                  }
                  className="h-10 w-12 cursor-pointer rounded-lg border border-theme bg-transparent p-1"
                />
                <input
                  type="text"
                  value={custom.color2}
                  onChange={(event) =>
                    updateCustom({ color2: event.target.value })
                  }
                  className="input-field flex-1 py-2 text-xs"
                  spellCheck={false}
                />
              </div>
            </label>
          )}

          <button
            type="button"
            onClick={() =>
              onChange('custom', { ...DEFAULT_CUSTOM_BACKGROUND })
            }
            className="text-xs text-muted underline-offset-2 hover:text-heading hover:underline"
          >
            {t('backgroundSettings.resetCustom')}
          </button>
        </div>
      )}
    </div>
  )
}
