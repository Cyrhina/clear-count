/**
 * Company color theme from the logo: find the logo's dominant color, spread it into the 11-step `brand` scale
 * the whole UI is built on (`--color-brand-50 … 950` → buttons, links, charts, focus rings, badges) and tint the
 * sidebar. Lightness steps are fixed (the same ones as the default blue scale) so text on `brand-600` stays
 * readable whatever the logo's color — only hue and saturation come from the logo.
 */

export const BRAND_SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const
export type BrandShade = (typeof BRAND_SHADES)[number]

/** The built-in Clear Count blue theme, used when a company hasn't turned on the logo theme. */
export const DEFAULT_BRAND_COLOR = '#1e3765'

const LIGHTNESS: Record<BrandShade, number> = { 50: 95, 100: 90, 200: 80, 300: 67, 400: 56, 500: 46, 600: 39, 700: 31, 800: 24, 900: 19, 950: 12 }

interface Hsl {
  h: number
  s: number
  l: number
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim())
  const n = m ? parseInt(m[1], 16) : 0x1f6f5f
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHsl(r: number, g: number, b: number): Hsl {
  const rn = r / 255
  const gn = g / 255
  const bn = b / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l: l * 100 }
  const s = d / (1 - Math.abs(2 * l - 1))
  let h = 0
  if (max === rn) h = ((gn - bn) / d) % 6
  else if (max === gn) h = (bn - rn) / d + 2
  else h = (rn - gn) / d + 4
  return { h: (h * 60 + 360) % 360, s: s * 100, l: l * 100 }
}

function hslToHex({ h, s, l }: Hsl): string {
  const sn = s / 100
  const ln = l / 100
  const c = (1 - Math.abs(2 * ln - 1)) * sn
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = ln - c / 2
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]
  const hex = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0')
  return `#${hex(r)}${hex(g)}${hex(b)}`
}

/** The 11-step scale for a brand color. Saturation is kept in a range that stays pleasant on buttons and tints. */
export function buildBrandScale(hex: string): Record<BrandShade, string> {
  const { h, s } = rgbToHsl(...hexToRgb(hex))
  const base = Math.min(72, Math.max(s < 12 ? s : 30, s))
  const scale = {} as Record<BrandShade, string>
  for (const shade of BRAND_SHADES) {
    // Very light and very dark steps lose saturation, like the default scale does.
    const sat = shade <= 100 ? base * 0.75 : shade >= 900 ? base * 0.6 : base
    scale[shade] = hslToHex({ h, s: sat, l: LIGHTNESS[shade] })
  }
  return scale
}

/** Loads an image (data URL or same-origin URL) and returns its most prominent color as `#rrggbb`, or null if it has none (blank / fully transparent). */
export function extractBrandColor(src: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onerror = () => resolve(null)
    img.onload = () => {
      const size = 64
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (!ctx) return resolve(null)
      const scale = Math.min(size / img.width, size / img.height)
      ctx.drawImage(img, 0, 0, Math.max(1, Math.round(img.width * scale)), Math.max(1, Math.round(img.height * scale)))
      let data: Uint8ClampedArray
      try {
        data = ctx.getImageData(0, 0, size, size).data
      } catch {
        return resolve(null)
      }

      // 24 hue buckets weighted by saturation, ignoring transparent pixels, near-white backgrounds and near-black outlines.
      const buckets = Array.from({ length: 24 }, () => ({ weight: 0, r: 0, g: 0, b: 0 }))
      const grays = { count: 0, r: 0, g: 0, b: 0 }
      for (let i = 0; i < data.length; i += 4) {
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]]
        if (a < 128) continue
        const { h, s, l } = rgbToHsl(r, g, b)
        if (l > 92 || l < 8) continue
        if (s < 18) {
          grays.count += 1
          grays.r += r
          grays.g += g
          grays.b += b
          continue
        }
        const bucket = buckets[Math.floor(h / 15) % 24]
        const weight = (s / 100) * (1 - Math.abs(l - 50) / 60)
        bucket.weight += weight
        bucket.r += r * weight
        bucket.g += g * weight
        bucket.b += b * weight
      }
      const best = buckets.reduce((top, b) => (b.weight > top.weight ? b : top), buckets[0])
      if (best.weight > 0.5) return resolve(hslToHex(rgbToHsl(best.r / best.weight, best.g / best.weight, best.b / best.weight)))
      // A black / white / gray logo: a muted slate theme in its own tone.
      if (grays.count > 20) return resolve(hslToHex({ ...rgbToHsl(grays.r / grays.count, grays.g / grays.count, grays.b / grays.count), s: 14 }))
      resolve(null)
    }
    img.src = src
  })
}

const SHADE_VARS = BRAND_SHADES.map((s) => `--color-brand-${s}`)
const EXTRA_VARS = ['--brand-sidebar', '--brand-sidebar-dark', '--brand-sidebar-muted']

/** Sets (or, with no color, clears) the brand scale and sidebar tint on <html>; every `brand-*` utility, `--primary` and chart color follows. */
export function applyBrandTheme(hex: string | undefined | null) {
  const root = document.documentElement
  if (!hex) {
    for (const name of [...SHADE_VARS, ...EXTRA_VARS]) root.style.removeProperty(name)
    return
  }
  const scale = buildBrandScale(hex)
  for (const shade of BRAND_SHADES) root.style.setProperty(`--color-brand-${shade}`, scale[shade])
  const { h, s } = rgbToHsl(...hexToRgb(hex))
  const tint = Math.min(35, s)
  root.style.setProperty('--brand-sidebar', hslToHex({ h, s: tint, l: 12 }))
  root.style.setProperty('--brand-sidebar-dark', hslToHex({ h, s: tint * 0.5, l: 6 }))
  root.style.setProperty('--brand-sidebar-muted', hslToHex({ h, s: tint * 0.4, l: 62 }))
}
