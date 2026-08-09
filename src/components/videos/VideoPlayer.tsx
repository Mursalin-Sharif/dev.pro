import { getPlayableVideo } from '@/lib/videoUrl'

export function VideoPlayer({ url, title }: { url: string; title: string }) {
  const playable = getPlayableVideo(url)

  if (playable.kind === 'youtube') {
    return (
      <iframe
        className="h-full w-full"
        src={playable.embedUrl}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    )
  }

  if (playable.kind === 'file') {
    return (
      <video className="h-full w-full" src={playable.src} controls autoPlay playsInline title={title}>
        <track kind="captions" />
      </video>
    )
  }

  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-white">
      <p className="text-sm text-white/70">This video URL can’t be played here.</p>
      <a
        href={playable.src}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-bold text-primary underline"
      >
        Open video link
      </a>
    </div>
  )
}
