const c = document.getElementById('c')
const ctx = c.getContext('2d')
const over = document.getElementById('over')
const scoreEl = document.getElementById('score')
const res = document.getElementById('res')
const hint = document.getElementById('hint')

let score = 0
let muted = false
let audio

function sound(f1, f2, dur, type, vol) {
if (muted) return
audio = audio || new AudioContext()
if (audio.state === 'suspended') audio.resume()

const t = audio.currentTime
const o = audio.createOscillator()
const g = audio.createGain()

o.type = type
o.frequency.setValueAtTime(f1, t)
  o.frequency.exponentialRampToValueAtTime(f2, t + dur)
  g.gain.setValueAtTime(vol, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + dur)
  o.connect(g)
  g.connect(audio.destination)
  o.start(t)
  o.stop(t + dur)
}


let best = Number(localStorage.getItem('best')) || 0

function fit() {
  c.width = innerWidth
  c.height = innerHeight
  ctx.imageSmoothingEnabled = false
}
fit()
addEventListener('resize', fit)

const img = new Image()
img.src = 'PARROT.png'

const sheet = new Image()
sheet.src = 'CLOUD.png'

const poleImg = new Image()
poleImg.src = 'poles.png'

const k = 8
const clouds = [
  { sx: 49, sy: 0,  w: 28, h: 15, x: 200,  y: 0.12, s: 0.3 },
  { sx: 4,  sy: 3,  w: 28, h: 13, x: 600,  y: 0.30, s: 0.2 },
  { sx: 79, sy: 3,  w: 21, h: 13, x: 900,  y: 0.20, s: 0.4 },
  { sx: 10, sy: 45, w: 28, h: 15, x: 1300, y: 0.40, s: 0.25 },
]

const x = 700
const size = 135
let y = 300
let v = 0
const gravity = 0.5
const jump = -8

const ps = 5
let poles = []
let started = false
const space = 640
let dead = false
let dieAt = 0
let last = performance.now()

function spawn(px = c.width) {
  const gap = c.height * 0.3
  const top = c.height * 0.1 + Math.random() * (c.height * 0.8 - gap)
  poles.push({ x: px, top, gap, passed: false })
}

function seed() {
  poles = []
  let px = x + 400
  do {
    spawn(px)
    px += space
  } while (px < c.width)
}

function pole(px, len) {
  ctx.drawImage(poleImg, 14, 16, 34, 10, px, 0, 34 * ps, 10 * ps)
  ctx.drawImage(poleImg, 20, 40, 21, 1, px + 6 * ps, 10 * ps, 21 * ps, Math.max(0, len - 10 * ps))
}

function die() {
  if (dead) return
  dead = true
  sound(300, 60, 0.5, 'sawtooth', 0.12)
  dieAt = Date.now()
  if (score > best) {
    best = score
    localStorage.setItem('best', best)
  }
  res.textContent = 'SCORE ' + score + '  BEST ' + best
  over.classList.remove('off')
}

function reset() {
  y = 300
  v = 0
  dead = false
  started = false
  score = 0
  scoreEl.textContent = 0
  over.classList.add('off')
  seed()
  hint.classList.remove('off')
}

function overlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

function hit(p) {
  const bx = x + 20
  const by = y + 20
  const bs = size - 40
  const cw = 34 * ps
  const ch = 10 * ps
  const bodyX = p.x + 6 * ps
  const bodyW = 21 * ps
  const lo = p.top + p.gap
  return (
    overlap(bx, by, bs, bs, p.x, p.top - ch, cw, ch) ||
    overlap(bx, by, bs, bs, bodyX, 0, bodyW, p.top - ch) ||
    overlap(bx, by, bs, bs, p.x, lo, cw, ch) ||
    overlap(bx, by, bs, bs, bodyX, lo + ch, bodyW, c.height - lo - ch)
  )
}

function flap() {
  if (dead) {
    if (Date.now() - dieAt > 500) reset()
    return
  }
  started = true
  hint.classList.add('off')
  v = jump
  sound(400, 700, 0.12, 'square', 0.08)
}

function loop(t) {
  const dt = Math.min((t - last) / 16.67, 3)
  last = t
  ctx.fillStyle = '#8af5f4'
  ctx.fillRect(0, 0, c.width, c.height)

  ctx.drawImage(sheet, 144, 4, 13, 12, c.width - 140, 40, 13 * k, 12 * k)

  for (const cl of clouds) {
    cl.x -= cl.s * dt
    if (cl.x < -cl.w * k) cl.x = c.width
    ctx.drawImage(sheet, cl.sx, cl.sy, cl.w, cl.h, cl.x, cl.y * c.height, cl.w * k, cl.h * k)
  }

  if (started && !dead) {
  const last = poles[poles.length - 1]
  if (!last || last.x < c.width - space) spawn()
}

  for (const p of poles) {
   if (started && !dead) p.x -= 4 * dt

    if (!dead && !p.passed && p.x + 34 * ps < x) {
      p.passed = true
      score++
      scoreEl.textContent = score
      sound(880, 1320, 0.15, 'square', 0.08)
    }

    ctx.save()
    ctx.translate(0, p.top)
    ctx.scale(1, -1)
    pole(p.x, p.top)
    ctx.restore()

    ctx.save()
    ctx.translate(0, p.top + p.gap)
    pole(p.x, c.height - p.top - p.gap)
    ctx.restore()
  }
  poles = poles.filter(p => p.x > -34 * ps)

if (started) {
  v += gravity * dt
  y += v * dt
} else {
  y = 300 + Math.sin(t / 200) * 10
}

 if (started && y > c.height - size) { y = c.height - size; v = 0; die() }
  if (y < 0) { y = 0; v = 0 }
  if (!dead) for (const p of poles) if (hit(p)) die()

  const f = v < 0 ? 32 : 0
  ctx.drawImage(img, 0, f, 32, 32, x, y, size, size)

  requestAnimationFrame(loop)
}

addEventListener('click', flap)
addEventListener('keydown', e => {
  if (e.repeat) return
  if (e.code === 'KeyM') muted = !muted
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault()
    flap()
  }
})

seed()
img.onload = () => requestAnimationFrame(loop)
