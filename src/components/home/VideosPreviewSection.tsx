import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { SectionHeading } from '@/components/common/SectionHeading'
import { Button } from '@/components/common/Button'
import { Carousel } from '@/components/common/Carousel'
import { VideoCard } from '@/components/cards/VideoCard'
import { VideoPlayer } from '@/components/videos/VideoPlayer'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { Modal } from '@/components/common/Modal'
import { useVideos } from '@/hooks/useVideos'
import { slideByIndex, viewportOnce } from '@/lib/motion'
import type { Video } from '@/types'

export function VideosPreviewSection() {
  const { data: videos, isLoading } = useVideos()
  const [activeVideo, setActiveVideo] = useState<Video | null>(null)

  return (
    <section className="section-y bg-surface-light">
      <div className="container-page">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <SectionHeading
            eyebrow="MEDIA HUB"
            title="Watch The Road To The Title"
            align="left"
            className="mx-0 text-left"
          />
          <Link to="/videos" className="shrink-0">
            <Button variant="outline" size="sm" icon={<ArrowRight size={16} />}>
              All videos
            </Button>
          </Link>
        </div>

        <div className="mt-12">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size={28} className="text-primary" />
            </div>
          ) : (
            <Carousel slideClassName="w-[80%] sm:w-[45%] lg:w-[30%]">
              {(videos ?? []).map((video, i) => (
                <motion.div
                  key={video.id}
                  initial="hidden"
                  whileInView="visible"
                  viewport={viewportOnce}
                  variants={slideByIndex(i)}
                  className="w-full"
                >
                  <VideoCard video={video} onPlay={setActiveVideo} />
                </motion.div>
              ))}
            </Carousel>
          )}
        </div>
      </div>

      <Modal open={Boolean(activeVideo)} onClose={() => setActiveVideo(null)} title={activeVideo?.title} size="lg">
        {activeVideo && (
          <div className="aspect-video overflow-hidden rounded-xl bg-navy">
            <VideoPlayer url={activeVideo.video_url} title={activeVideo.title} />
          </div>
        )}
      </Modal>
    </section>
  )
}
