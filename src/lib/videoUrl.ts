/** Normalize admin-entered video URLs for playback. */

export type PlayableVideo =
  | { kind: 'youtube'; embedUrl: string }
  | { kind: 'file'; src: string }
  | { kind: 'unknown'; src: string }

function extractYouTubeId(raw: string): string | null {
  try {
    const url = new URL(raw.trim())
    const host = url.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0]
      return id || null
    }

    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') return url.searchParams.get('v')
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed' || parts[0] === 'shorts' || parts[0] === 'live' || parts[0] === 'v') {
        return parts[1] ?? null
      }
    }

    if (host === 'youtube-nocookie.com') {
      const parts = url.pathname.split('/').filter(Boolean)
      if (parts[0] === 'embed') return parts[1] ?? null
    }
  } catch {
    // not a URL
  }
  return null
}

function isDirectMediaUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim())
    return /\.(mp4|webm|ogg|m3u8)(\?|$)/i.test(url.pathname)
  } catch {
    return false
  }
}

export function getPlayableVideo(rawUrl: string): PlayableVideo {
  const trimmed = rawUrl.trim()
  if (!trimmed) return { kind: 'unknown', src: trimmed }

  const youtubeId = extractYouTubeId(trimmed)
  if (youtubeId) {
    return {
      kind: 'youtube',
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`,
    }
  }

  if (isDirectMediaUrl(trimmed) || trimmed.startsWith('blob:') || trimmed.startsWith('data:video')) {
    return { kind: 'file', src: trimmed }
  }

  // Supabase public storage URLs without extension still play in <video> often.
  if (/supabase\.co\/storage\//i.test(trimmed)) {
    return { kind: 'file', src: trimmed }
  }

  return { kind: 'unknown', src: trimmed }
}
