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
img.src = 'parrot.png'

const x = 80
const size = 64
let y = 300
let v = 0
const gravity = 0.5
const jump = -8

function flap() { v = jump }

function loop() {
  ctx.clearRect(0, 0, c.width, c.height)

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