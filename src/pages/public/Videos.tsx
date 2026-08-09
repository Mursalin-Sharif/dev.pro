import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { PageHero } from '@/components/layout/PageHero'
import { VideoCard } from '@/components/cards/VideoCard'
import { VideoPlayer } from '@/components/videos/VideoPlayer'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Modal } from '@/components/common/Modal'
import { useVideos } from '@/hooks/useVideos'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import type { Video } from '@/types'

export default function Videos() {
  const { data: videos, isLoading } = useVideos()
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  return (
    <>
      <Helmet>
        <title>Videos — {SITE_NAME}</title>
        <meta
          name="description"
          content="Watch highlights, keynotes, and match replays from the Hopeland Global Checkers World Championship."
        />
        <link rel="canonical" href={`${SITE_URL}/videos`} />
      </Helmet>

      <PageHero
        eyebrow="MEDIA HUB"
        title="Videos & Highlights"
        subtitle="Keynotes, match replays, and behind-the-scenes coverage from every stage of the championship."
      />

      <section className="section-y bg-surface-white">
        <div className="container-page">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
              className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {(videos ?? []).map((video) => (
                <VideoCard key={video.id} video={video} onPlay={setActiveVideo} />
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <Modal open={Boolean(activeVideo)} onClose={() => setActiveVideo(null)} title={activeVideo?.title} size="lg">
        {activeVideo && (
          <div className="aspect-video overflow-hidden rounded-xl bg-navy">
            <VideoPlayer url={activeVideo.video_url} title={activeVideo.title} />
          </div>
        )}
      </Modal>
    </>
  )
}
