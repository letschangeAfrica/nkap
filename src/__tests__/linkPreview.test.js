import { describe, test, expect } from 'vitest'
import { readFileSync, statSync } from 'node:fs'

const html = readFileSync('index.html', 'utf8')
const meta = (prop) => html.match(new RegExp(`<meta (?:property|name)="${prop}" content="([^"]+)"`))?.[1]

describe('link preview card (LinkedIn, WhatsApp, X)', () => {
  test('title, description, absolute HTTPS image with its size and alt text', () => {
    expect(meta('og:title')).toMatch(/Nkap/)
    expect(meta('og:description').length).toBeGreaterThan(60)
    expect(meta('og:image')).toBe('https://ismael-nkap.netlify.app/og-image.jpg')
    expect(meta('og:image:width')).toBe('1200')
    expect(meta('og:image:height')).toBe('627')
    expect(meta('og:image:alt')).toBeTruthy()
    expect(meta('twitter:card')).toBe('summary_large_image')
  })

  test('the image exists in public/, is a JPEG of 1200×627 and is small enough to share', () => {
    const buf = readFileSync('public/og-image.jpg')
    expect(buf[0]).toBe(0xff)
    expect(buf[1]).toBe(0xd8) // JPEG
    // read the size from the first SOF marker
    let i = 2
    while (i < buf.length) {
      const marker = buf[i + 1]
      const len = buf.readUInt16BE(i + 2)
      if (marker >= 0xc0 && marker <= 0xc2) {
        expect([buf.readUInt16BE(i + 7), buf.readUInt16BE(i + 5)]).toEqual([1200, 627])
        break
      }
      i += 2 + len
    }
    expect(statSync('public/og-image.jpg').size).toBeLessThan(300 * 1024)
  })
})
