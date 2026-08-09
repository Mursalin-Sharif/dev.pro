import { Link, Navigate, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Users } from 'lucide-react'
import { SITE_NAME, SITE_URL } from '@/lib/seo'
import { cn } from '@/lib/utils'
import { GAMES, type GameCard } from '@/data/sportsGames'

export default function SportGame() {
  const { gameId } = useParams<{ gameId: string }>()
  const game = GAMES.find((g) => g.id === gameId)

  if (!game) return <Navigate to="/sports" replace />

  return (
    <>
      <Helmet>
        <title>
          {game.title} — {SITE_NAME}
        </title>
        <meta name="description" content={`Play ${game.title} in the Hopeland championship lobby.`} />
        <link rel="canonical" href={`${SITE_URL}/sports/${game.id}`} />
      </Helmet>

      <div className="min-h-[70vh] bg-[#030d43] pb-28 text-white">
        <div className="container-page pt-5 sm:pt-7">
          <Link
            to="/sports"
            className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition-colors hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to Lobby
          </Link>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,320px)_1fr] lg:gap-8">
            <GamePoster game={game} />
            <GameStage game={game} />
          </div>
        </div>
      </div>
    </>
  )
}

function GamePoster({ game }: { game: GameCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden rounded-2xl border border-white/10"
    >
      <div className="relative aspect-square sm:aspect-[4/5]">
        <img
          src={`/games/${game.id}.png`}
          alt={game.title}
          className="absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <p className="text-[10px] font-bold tracking-[0.16em] text-white/50 uppercase">
            {game.provider}
          </p>
          <h1 className="mt-1 font-display text-2xl font-extrabold tracking-wide uppercase">
            {game.title}
          </h1>
        </div>
      </div>
    </motion.div>
  )
}

function GameStage({ game }: { game: GameCard }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 }}
      className="flex flex-col rounded-2xl border border-white/10 bg-[#0b1648]/80 p-4 sm:p-6"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#67e8f9] uppercase">Now playing</p>
          <p className="mt-1 text-sm text-white/55">{SECTION_BLURB[game.category]}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 text-[11px] font-bold text-white/70 uppercase">
          <Users size={12} />
          Demo table
        </span>
      </div>

      <MiniCheckersBoard />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/register"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#2f6bff] px-5 py-3.5 text-sm font-bold tracking-wide text-white uppercase transition-colors hover:bg-[#2557d6]"
        >
          <Play size={16} fill="currentColor" />
          Play for real
        </Link>
        <Link
          to="/sports"
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/15 px-5 py-3.5 text-sm font-bold tracking-wide text-white/80 uppercase transition-colors hover:bg-white/5 hover:text-white"
        >
          More games
        </Link>
      </div>
    </motion.div>
  )
}

const SECTION_BLURB: Record<GameCard['category'], string> = {
  originals: 'Hopeland original — fast championship format.',
  trending: 'Trending table — high traffic board right now.',
  new: 'Fresh release on the championship lobby.',
  live: 'Live table feed — join the open seat.',
  blitz: 'Blitz clock — every second counts.',
  classic: 'Classic rules — pure draughts play.',
  puzzles: 'Solve the board — train like a master.',
  tournaments: 'Bracket table — climb the cup.',
}

function MiniCheckersBoard() {
  const cells = Array.from({ length: 64 }, (_, i) => {
    const row = Math.floor(i / 8)
    const col = i % 8
    const dark = (row + col) % 2 === 1
    let piece: 'red' | 'black' | null = null
    if (dark && row < 3) piece = 'black'
    if (dark && row > 4) piece = 'red'
    return { i, dark, piece }
  })

  return (
    <div
      className="mx-auto aspect-square w-full max-w-md overflow-hidden rounded-xl border border-white/10 shadow-[0_0_40px_-12px_rgba(47,107,255,0.45)]"
      role="img"
      aria-label="Checkers demo board"
    >
      <div className="grid h-full grid-cols-8 grid-rows-8">
        {cells.map((cell) => (
          <div
            key={cell.i}
            className={cn(
              'relative flex items-center justify-center',
              cell.dark ? 'bg-[#1a2a6e]' : 'bg-[#c4b5a0]',
            )}
          >
            {cell.piece && (
              <span
                className={cn(
                  'h-[58%] w-[58%] rounded-full border-2 shadow-md',
                  cell.piece === 'red'
                    ? 'border-[#7f1d1d] bg-gradient-to-br from-[#ef4444] to-[#991b1b]'
                    : 'border-[#0f172a] bg-gradient-to-br from-[#334155] to-[#0f172a]',
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
