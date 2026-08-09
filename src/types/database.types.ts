/**
 * Hand-written mirror of the Supabase schema defined in `supabase/migrations`.
 * Regenerate with `supabase gen types typescript` once the project is linked
 * to a live Supabase instance, then this file can be replaced automatically.
 */

export type RegistrationStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Registration {
  id: string
  first_name: string
  last_name: string
  date_of_birth: string
  city: string
  country: string
  phone: string
  email: string
  status: RegistrationStatus
  fee_amount: number
  fee_currency: string
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  description: string | null
  video_url: string
  thumbnail_url: string | null
  published: boolean
  display_order: number
  created_at: string
  updated_at: string
}

export interface Sponsor {
  id: string
  name: string
  logo_url: string
  website_url: string | null
  tier: 'platinum' | 'gold' | 'silver' | 'partner'
  display_order: number
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  cover_image_url: string | null
  author: string
  published: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type UserRole = 'user' | 'admin' | 'superadmin'
export type AdminRole = UserRole

export interface Profile {
  id: string
  email: string
  role: UserRole
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      registrations: {
        Row: Registration
        Insert: Partial<Registration> &
          Pick<Registration, 'first_name' | 'last_name' | 'date_of_birth' | 'city' | 'country' | 'phone' | 'email'>
        Update: Partial<Registration>
      }
      videos: {
        Row: Video
        Insert: Partial<Video> & Pick<Video, 'title' | 'video_url'>
        Update: Partial<Video>
      }
      sponsors: {
        Row: Sponsor
        Insert: Partial<Sponsor> & Pick<Sponsor, 'name' | 'logo_url'>
        Update: Partial<Sponsor>
      }
      blog_posts: {
        Row: BlogPost
        Insert: Partial<BlogPost> & Pick<BlogPost, 'title' | 'slug' | 'excerpt' | 'content' | 'author'>
        Update: Partial<BlogPost>
      }
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & Pick<Profile, 'id' | 'email' | 'role'>
        Update: Partial<Profile>
      }
    }
  }
}
