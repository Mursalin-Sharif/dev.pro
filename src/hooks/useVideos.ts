import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockVideos, persistVideos } from '@/lib/mockData'
import type { Video } from '@/types'

const QUERY_KEY = ['videos']

export function useVideos(options?: { publishedOnly?: boolean }) {
  const publishedOnly = options?.publishedOnly ?? true

  return useQuery({
    queryKey: [...QUERY_KEY, publishedOnly],
    queryFn: async (): Promise<Video[]> => {
      if (!isSupabaseConfigured) {
        return publishedOnly ? mockVideos.filter((v) => v.published) : mockVideos
      }
      let query = supabase.from('videos').select('*').order('display_order', { ascending: true })
      if (publishedOnly) query = query.eq('published', true)
      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

export function useVideoMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const create = useMutation({
    mutationFn: async (input: Partial<Video>) => {
      if (!isSupabaseConfigured) {
        const now = new Date().toISOString()
        const newVideo: Video = {
          id: crypto.randomUUID(),
          title: input.title ?? '',
          description: input.description ?? null,
          video_url: input.video_url ?? '',
          thumbnail_url: input.thumbnail_url ?? null,
          published: input.published ?? true,
          display_order: mockVideos.length + 1,
          created_at: now,
          updated_at: now,
        }
        mockVideos.push(newVideo)
        persistVideos()
        return newVideo
      }
      const { count } = await supabase.from('videos').select('*', { count: 'exact', head: true })
      const { error } = await supabase.from('videos').insert({
        ...input,
        display_order: input.display_order ?? (count ?? 0) + 1,
      } as never)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Video> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockVideos.findIndex((v) => v.id === id)
        if (index !== -1) {
          mockVideos[index] = { ...mockVideos[index], ...input, updated_at: new Date().toISOString() }
          persistVideos()
        }
        return
      }
      const { error } = await supabase.from('videos').update(input as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = mockVideos.findIndex((v) => v.id === id)
        if (index !== -1) {
          mockVideos.splice(index, 1)
          persistVideos()
        }
        return
      }
      const { error } = await supabase.from('videos').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
