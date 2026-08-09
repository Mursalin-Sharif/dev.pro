import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockBlogPosts, persistBlogPosts } from '@/lib/mockData'
import type { BlogPost } from '@/types'

const QUERY_KEY = ['blogPosts']

export function useBlogPosts(options?: { publishedOnly?: boolean }) {
  const publishedOnly = options?.publishedOnly ?? true

  return useQuery({
    queryKey: [...QUERY_KEY, publishedOnly],
    queryFn: async (): Promise<BlogPost[]> => {
      if (!isSupabaseConfigured) {
        return publishedOnly ? mockBlogPosts.filter((p) => p.published) : mockBlogPosts
      }
      let query = supabase.from('blog_posts').select('*').order('published_at', { ascending: false })
      if (publishedOnly) query = query.eq('published', true)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useBlogPost(slug: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, 'slug', slug],
    enabled: Boolean(slug),
    queryFn: async (): Promise<BlogPost | null> => {
      if (!isSupabaseConfigured) {
        return mockBlogPosts.find((p) => p.slug === slug) ?? null
      }
      const { data, error } = await supabase.from('blog_posts').select('*').eq('slug', slug as string).maybeSingle()
      if (error) throw error
      return data
    },
  })
}

export function useBlogPostMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const create = useMutation({
    mutationFn: async (input: Partial<BlogPost>) => {
      if (!isSupabaseConfigured) {
        const now = new Date().toISOString()
        const newPost: BlogPost = {
          id: crypto.randomUUID(),
          title: input.title ?? '',
          slug: input.slug ?? '',
          excerpt: input.excerpt ?? '',
          content: input.content ?? '',
          cover_image_url: input.cover_image_url ?? null,
          author: input.author ?? '',
          published: input.published ?? true,
          published_at: input.published_at ?? now,
          created_at: now,
          updated_at: now,
        }
        mockBlogPosts.unshift(newPost)
        persistBlogPosts()
        return newPost
      }
      const { error } = await supabase.from('blog_posts').insert(input as never)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<BlogPost> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockBlogPosts.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockBlogPosts[index] = { ...mockBlogPosts[index], ...input, updated_at: new Date().toISOString() }
          persistBlogPosts()
        }
        return
      }
      const { error } = await supabase.from('blog_posts').update(input as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = mockBlogPosts.findIndex((p) => p.id === id)
        if (index !== -1) {
          mockBlogPosts.splice(index, 1)
          persistBlogPosts()
        }
        return
      }
      const { error } = await supabase.from('blog_posts').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
