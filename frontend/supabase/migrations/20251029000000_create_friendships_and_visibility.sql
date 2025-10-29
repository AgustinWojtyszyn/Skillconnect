-- Tabla de amistades/seguimiento
CREATE TABLE friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Índices para optimizar consultas
CREATE INDEX idx_friendships_follower ON friendships(follower_id);
CREATE INDEX idx_friendships_following ON friendships(following_id);

-- RLS para friendships
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para friendships
CREATE POLICY "Users can view their own friendships"
  ON friendships FOR SELECT
  USING (auth.uid() = follower_id OR auth.uid() = following_id);

CREATE POLICY "Users can create their own friendships"
  ON friendships FOR INSERT
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete their own friendships"
  ON friendships FOR DELETE
  USING (auth.uid() = follower_id);

ALTER TABLE skills ADD visibility TEXT DEFAULT 'public';
ALTER TABLE skills ADD CONSTRAINT skills_visibility_check CHECK (visibility IN ('public', 'friends'));

-- Actualizar skills existentes para tener visibilidad pública
UPDATE skills SET visibility = 'public' WHERE visibility IS NULL;
