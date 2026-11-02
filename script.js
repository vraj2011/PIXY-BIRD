const c = document.getElementById('c')
const ctx = c.getContext('2d')

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
const size = 115
let y = 300
let v = 0
const gravity = 0.5
const jump = -8

const ps = 5
let poles = []
let timer = 0

function spawn() {
  const gap = c.height * 0.3
  const top = c.height * 0.1 + Math.random() * (c.height * 0.8 - gap)
  poles.push({ x: c.width, top, gap })
}

function pole(px, len) {
  ctx.drawImage(poleImg, 14, 16, 34, 10, px, 0, 34 * ps, 10 * ps)
    ctx.drawImage(poleImg, 20, 40, 21, 1, px + 6 * ps, 10 * ps, 21 * ps, Math.max(0, len - 10 * ps))
}

function flap() { v = jump }

function loop() {
  ctx.fillStyle = '#8af5f4'
  ctx.fillRect(0, 0, c.width, c.height)

  ctx.drawImage(sheet, 144, 4, 13, 12, c.width - 140, 40, 13 * k, 12 * k)

  for (const cl of clouds) {
    cl.x -= cl.s
    if (cl.x < -cl.w * k) cl.x = c.width
    ctx.drawImage(sheet, cl.sx, cl.sy, cl.w, cl.h, cl.x, cl.y * c.height, cl.w * k, cl.h * k)
  }

  timer++
  if (timer % 160 === 0) spawn()

    for (const p of poles) {
      p.x -= 4

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

  v += gravity
  y += v

  if (y > c.height - size) { y = c.height - size; v = 0 }
  if (y < 0) { y = 0; v = 0 }

  const f = v < 0 ? 32 : 0
  ctx.drawImage(img, 0, f, 32, 32, x, y, size, size)
  requestAnimationFrame(loop)
}

addEventListener('click', flap)
addEventListener('keydown', e => {
  if (e.repeat) return
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault()
    flap()
  }
})

img.onload = loop
