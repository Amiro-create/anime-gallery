CREATE TABLE anime (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  cover_url TEXT NOT NULL,
  banner_url TEXT,
  primary_color TEXT DEFAULT '#1a1a2e',
  description TEXT,
  episode_count INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scene (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  anime_id UUID REFERENCES anime(id) ON DELETE CASCADE,
  episode INTEGER NOT NULL,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  quote TEXT,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  layers JSONB DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('approved','pending','rejected')),
  submitted_by UUID,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE collection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scene_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE "like" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scene_id UUID REFERENCES scene(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scene_id)
);
