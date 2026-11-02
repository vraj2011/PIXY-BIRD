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
