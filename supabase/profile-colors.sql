-- Colores personalizados del perfil (visible para otros usuarios)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS profile_color_preset TEXT DEFAULT 'default'
    CHECK (
      profile_color_preset IN (
        'default',
        'top',
        'jungle',
        'mid',
        'adc',
        'support',
        'custom'
      )
    ),
  ADD COLUMN IF NOT EXISTS profile_color_1 TEXT,
  ADD COLUMN IF NOT EXISTS profile_color_2 TEXT,
  ADD COLUMN IF NOT EXISTS profile_color_gradient BOOLEAN DEFAULT true;
