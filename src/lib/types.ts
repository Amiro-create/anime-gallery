export interface Anime {
  id: string
  title: string
  cover_url: string
  banner_url?: string
  primary_color: string
  description?: string
  episode_count?: number
  tags: string[]
  created_at: string
}

export interface Scene {
  id: string
  anime_id: string
  episode: number
  title: string
  image_url: string
  quote?: string
  description?: string
  tags: string[]
  layers: { fg?: string; mg?: string; bg?: string }
  likes_count: number
  status: 'approved' | 'pending' | 'rejected'
  submitted_by?: string
  created_at: string
}

export interface Collection {
  id: string
  user_id: string
  name: string
  scene_ids: string[]
  created_at: string
}
