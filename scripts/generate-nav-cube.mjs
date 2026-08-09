/**
 * Original Hopeland glass wireframe cube GIF for mobile nav.
 * BlockDAG-style presentation (50px gif in 60px disc) — original art, not their asset.
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createCanvas } from '@napi-rs/canvas'
import { GifWriter } from 'omggif'

const __dirname = dirname(fileURLToPath(import.meta.url))
const outPath = join(__dirname, '../public/nav-cube.gif')

const SIZE = 120
const FRAMES = 48
const COLORS = 64

const corners = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
]

const faces = [
  { idx: [0, 1, 2, 3], n: [0, 0, -1] },
  { idx: [4, 5, 6, 7], n: [0, 0, 1] },
  { idx: [0, 1, 5, 4], n: [0, -1, 0] },
  { idx: [3, 2, 6, 7], n: [0, 1, 0] },
  { idx: [0, 3, 7, 4], n: [-1, 0, 0] },
  { idx: [1, 2, 6, 5], n: [1, 0, 0] },
]

function rotate(p, ax, ay, az) {
  let [x, y, z] = p
  let c = Math.cos(ay)
  let s = Math.sin(ay)
  let nx = x * c + z * s
  let nz = -x * s + z * c
  x = nx
  z = nz
  c = Math.cos(ax)
  s = Math.sin(ax)
  let ny = y * c - z * s
  nz = y * s + z * c
  y = ny
  z = nz
  c = Math.cos(az)
  s = Math.sin(az)
  nx = x * c - y * s
  ny = x * s + y * c
  return [nx, ny, nz]
}

function project(p, cx, cy, scale) {
  const perspective = 3.8
  const depth = perspective / (perspective - p[2] * 0.65)
  return {
    x: cx + p[0] * scale * depth,
    y: cy + p[1] * scale * depth,
    z: p[2],
  }
}

function rotateVec(n, ax, ay, az) {
  return rotate(n, ax, ay, az)
}

function drawRoundedFace(ctx, pts, color, width, alpha, blur, ox = 0, oy = 0) {
  ctx.save()
  ctx.globalAlpha = alpha
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.shadowColor = color
  ctx.shadowBlur = blur
  ctx.beginPath()
  const r = 0.28
  for (let i = 0; i < 4; i++) {
    const curr = pts[i]
    const next = pts[(i + 1) % 4]
    const prev = pts[(i + 3) % 4]
    const start = {
      x: curr.x + (prev.x - curr.x) * r + ox,
      y: curr.y + (prev.y - curr.y) * r + oy,
    }
    const end = {
      x: curr.x + (next.x - curr.x) * r + ox,
      y: curr.y + (next.y - curr.y) * r + oy,
    }
    if (i === 0) ctx.moveTo(start.x, start.y)
    else ctx.lineTo(start.x, start.y)
    ctx.quadraticCurveTo(curr.x + ox, curr.y + oy, end.x, end.y)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}

function renderFrame(angleY) {
  const canvas = createCanvas(SIZE, SIZE)
  const ctx = canvas.getContext('2d')
  const cx = SIZE / 2
  const cy = SIZE / 2
  const scale = SIZE * 0.3

  ctx.fillStyle = '#030d43'
  ctx.fillRect(0, 0, SIZE, SIZE)

  const glow = ctx.createRadialGradient(cx, cy, 4, cx, cy, SIZE * 0.5)
  glow.addColorStop(0, 'rgba(56,189,248,0.35)')
  glow.addColorStop(0.45, 'rgba(34,211,238,0.12)')
  glow.addColorStop(1, 'rgba(3,13,67,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, SIZE, SIZE)

  const ax = -0.42
  const az = 0.52
  const pts = corners.map((c) => project(rotate(c, ax, angleY, az), cx, cy, scale))

  // Only camera-facing faces (view looks down +Z), back → front
  const visible = faces
    .map((f) => {
      const n = rotateVec(f.n, ax, angleY, az)
      const zAvg = f.idx.reduce((s, i) => s + pts[i].z, 0) / 4
      return { f, facing: n[2], zAvg }
    })
    .filter((x) => x.facing > 0.05)
    .sort((a, b) => a.zAvg - b.zAvg)

  for (const { f } of visible) {
    const quad = f.idx.map((i) => pts[i])
    drawRoundedFace(ctx, quad, '#e879f9', 2.6, 0.55, 6, 1.3, -0.7)
    drawRoundedFace(ctx, quad, '#a3e635', 2.3, 0.42, 5, -1.1, 1.0)
    drawRoundedFace(ctx, quad, '#67e8f9', 3.6, 0.95, 10)
    drawRoundedFace(ctx, quad, '#e0f2fe', 1.4, 0.5, 2)
  }

  return ctx.getImageData(0, 0, SIZE, SIZE)
}

function buildPalette() {
  const palette = [0x030d43]
  // Cyan ramp
  for (let i = 1; i <= 20; i++) {
    const t = i / 20
    const r = Math.round(3 + (103 - 3) * t)
    const g = Math.round(13 + (232 - 13) * t)
    const b = Math.round(67 + (249 - 67) * t)
    palette.push((r << 16) | (g << 8) | b)
  }
  // Magenta / lime / white accents
  const extras = [
    0xe879f9, 0xc084fc, 0xf0abfc, 0xa3e635, 0xfde047, 0xffffff, 0xe0f2fe, 0x22d3ee, 0x38bdf8,
    0x0ea5e9, 0x0284c7, 0x1e3a8a, 0x0b1648, 0x082f49, 0x164e63, 0x155e75, 0x67e8f9, 0xa5f3fc,
    0x7dd3fc, 0xbae6fd, 0xfbbf24, 0x4ade80, 0xd946ef, 0x86198f, 0x365314, 0x422006, 0x1e293b,
    0x334155, 0x475569, 0x94a3b8, 0xcbd5e1, 0xf8fafc, 0x06b6d4, 0x0891b2, 0x0e7490, 0x155e75,
    0x083344, 0x172554, 0x1e40af, 0x2563eb, 0x3b82f6, 0x60a5fa, 0x93c5fd,
  ]
  for (const c of extras) {
    if (palette.length >= COLORS) break
    palette.push(c)
  }
  while (palette.length < COLORS) palette.push(0x030d43)
  return palette.slice(0, COLORS)
}

function quantize(imageData, palette) {
  const { data, width, height } = imageData
  const indexed = new Uint8Array(width * height)
  const cache = new Map()
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const key = (r << 16) | (g << 8) | b
    let best = cache.get(key)
    if (best === undefined) {
      let bestD = Infinity
      best = 0
      for (let j = 0; j < palette.length; j++) {
        const c = palette[j]
        const dr = r - ((c >> 16) & 255)
        const dg = g - ((c >> 8) & 255)
        const db = b - (c & 255)
        const d = dr * dr + dg * dg + db * db
        if (d < bestD) {
          bestD = d
          best = j
        }
      }
      cache.set(key, best)
    }
    indexed[p] = best
  }
  return indexed
}

const palette = buildPalette()
mkdirSync(dirname(outPath), { recursive: true })

const buf = Buffer.alloc(SIZE * SIZE * FRAMES * 2 + 1024 * 256)
const gf = new GifWriter(buf, SIZE, SIZE, { palette, loop: 0 })

for (let i = 0; i < FRAMES; i++) {
  const angle = (i / FRAMES) * Math.PI * 2
  const imageData = renderFrame(angle)
  const indexed = quantize(imageData, palette)
  gf.addFrame(0, 0, SIZE, SIZE, indexed, { palette, delay: 7 })
}

const gif = buf.subarray(0, gf.end())
writeFileSync(outPath, gif)
console.log(`Wrote ${outPath} (${gif.length} bytes, ${FRAMES} frames)`)
