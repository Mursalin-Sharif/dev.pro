import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, isSupabaseConfigured } from '@/lib/supabaseClient'
import { mockSponsors, persistSponsors } from '@/lib/mockData'
import type { Sponsor } from '@/types'

const QUERY_KEY = ['sponsors']

export function useSponsors() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<Sponsor[]> => {
      if (!isSupabaseConfigured) return mockSponsors
      const { data, error } = await supabase.from('sponsors').select('*').order('display_order', { ascending: true })
      if (error) throw error
      return data
    },
  })
}

export function useSponsorMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => queryClient.invalidateQueries({ queryKey: QUERY_KEY })

  const create = useMutation({
    mutationFn: async (input: Partial<Sponsor>) => {
      if (!isSupabaseConfigured) {
        const newSponsor: Sponsor = {
          id: crypto.randomUUID(),
          name: input.name ?? '',
          logo_url: input.logo_url ?? '',
          website_url: input.website_url ?? null,
          tier: input.tier ?? 'partner',
          display_order: mockSponsors.length + 1,
          created_at: new Date().toISOString(),
        }
        mockSponsors.push(newSponsor)
        persistSponsors()
        return newSponsor
      }
      const { count } = await supabase.from('sponsors').select('*', { count: 'exact', head: true })
      const { error } = await supabase.from('sponsors').insert({
        ...input,
        display_order: input.display_order ?? (count ?? 0) + 1,
      } as never)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const update = useMutation({
    mutationFn: async ({ id, ...input }: Partial<Sponsor> & { id: string }) => {
      if (!isSupabaseConfigured) {
        const index = mockSponsors.findIndex((s) => s.id === id)
        if (index !== -1) {
          mockSponsors[index] = { ...mockSponsors[index], ...input }
          persistSponsors()
        }
        return
      }
      const { error } = await supabase.from('sponsors').update(input as never).eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      if (!isSupabaseConfigured) {
        const index = mockSponsors.findIndex((s) => s.id === id)
        if (index !== -1) {
          mockSponsors.splice(index, 1)
          persistSponsors()
        }
        return
      }
      const { error } = await supabase.from('sponsors').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: invalidate,
  })

  return { create, update, remove }
}
