import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')
const outDir = join(root, 'public', 'icons')

await mkdir(outDir, { recursive: true })

const source = join(__dirname, 'icon-source.svg')
const sourceMaskable = join(__dirname, 'icon-source-maskable.svg')
const logoSource = join(__dirname, 'assets', 'fmikn-logo.png')

// Matches the moon circle radius baked into icon-source.svg / icon-source-maskable.svg (out of a 512 canvas).
const MOON_DIAMETER_RATIO = (300 / 512)
const MOON_DIAMETER_RATIO_MASKABLE = (260 / 512)
const LOGO_FILL_RATIO = 0.64 // logo occupies ~64% of the moon's diameter, leaving a teal margin
const LOGO_COLOR = [10, 24, 21] // #0a1815, same as the dark background — dark logo on the teal moon for strong contrast

// The source logo is a flat white silhouette (RGB 255,255,255) with an alpha
// mask. sharp's .tint() preserves luminance, so it can't darken a pure-white
// source — instead we overwrite every pixel's RGB directly and keep alpha.
async function recolorSilhouette(inputBuffer, [r, g, b]) {
  const image = sharp(inputBuffer).ensureAlpha()
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
  for (let i = 0; i < data.length; i += info.channels) {
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
  }
  return sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } }).png().toBuffer()
}

async function buildIcon({ baseSvgPath, size, moonDiameterRatio, outPath }) {
  const base = await sharp(baseSvgPath).resize(size, size).png().toBuffer()

  const logoTarget = Math.max(1, Math.round(size * moonDiameterRatio * LOGO_FILL_RATIO))
  const logoResized = await sharp(logoSource).resize(logoTarget, logoTarget, { fit: 'inside' }).png().toBuffer()
  const logo = await recolorSilhouette(logoResized, LOGO_COLOR)
  const logoMeta = await sharp(logo).metadata()

  await sharp(base)
    .composite([
      {
        input: logo,
        left: Math.round((size - logoMeta.width) / 2),
        top: Math.round((size - logoMeta.height) / 2),
      },
    ])
    .png()
    .toFile(outPath)
}

await buildIcon({ baseSvgPath: source, size: 192, moonDiameterRatio: MOON_DIAMETER_RATIO, outPath: join(outDir, 'icon-192.png') })
await buildIcon({ baseSvgPath: source, size: 512, moonDiameterRatio: MOON_DIAMETER_RATIO, outPath: join(outDir, 'icon-512.png') })
await buildIcon({
  baseSvgPath: sourceMaskable,
  size: 512,
  moonDiameterRatio: MOON_DIAMETER_RATIO_MASKABLE,
  outPath: join(outDir, 'icon-maskable-512.png'),
})
await buildIcon({ baseSvgPath: source, size: 180, moonDiameterRatio: MOON_DIAMETER_RATIO, outPath: join(root, 'public', 'apple-touch-icon.png') })

console.log('Icons generated in public/icons and apple-touch-icon.png')
