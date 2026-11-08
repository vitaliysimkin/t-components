import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setMotion, currentMotion, motionLevel, getMotionLevel } from '../composables/useMotion'

const html = document.documentElement

function mockReducedMotion(matches: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

describe('useMotion', () => {
  beforeEach(() => {
    localStorage.clear()
    html.removeAttribute('data-t-motion')
    mockReducedMotion(false)
  })

  afterEach(() => vi.unstubAllGlobals())

  it.each(['full', 'reduced', 'off'] as const)('setMotion(%s) sets level and <html> attribute', (level) => {
    setMotion(level)
    expect(currentMotion.value).toBe(level)
    expect(motionLevel.value).toBe(level)
    expect(html.getAttribute('data-t-motion')).toBe(level)
  })

  it('auto resolves to reduced when the OS prefers reduced motion', () => {
    mockReducedMotion(true)
    setMotion('auto')
    expect(currentMotion.value).toBe('auto')
    expect(motionLevel.value).toBe('reduced')
    expect(html.getAttribute('data-t-motion')).toBe('reduced')
  })

  it('auto resolves to full otherwise', () => {
    setMotion('auto')
    expect(motionLevel.value).toBe('full')
    expect(html.getAttribute('data-t-motion')).toBe('full')
  })

  it('explicit setting overrides the OS preference', () => {
    mockReducedMotion(true)
    setMotion('full')
    expect(motionLevel.value).toBe('full')
  })

  it('persists the setting under t-motion', () => {
    setMotion('off')
    expect(localStorage.getItem('t-motion')).toBe('off')
    setMotion('auto')
    expect(localStorage.getItem('t-motion')).toBe('auto')
  })

  it('restores the stored setting on load without rewriting it', async () => {
    localStorage.setItem('t-motion', 'reduced')
    vi.resetModules()
    const fresh = await import('../composables/useMotion')
    expect(fresh.currentMotion.value).toBe('reduced')
    expect(fresh.motionLevel.value).toBe('reduced')
    expect(html.getAttribute('data-t-motion')).toBe('reduced')
    expect(localStorage.getItem('t-motion')).toBe('reduced')
  })

  it('getMotionLevel uses the nearest [data-t-motion] ancestor, else <html>', () => {
    setMotion('reduced')
    const section = document.createElement('section')
    section.setAttribute('data-t-motion', 'off')
    const child = document.createElement('div')
    section.appendChild(child)
    document.body.append(section)
    const plain = document.createElement('div')
    document.body.append(plain)

    expect(getMotionLevel(child)).toBe('off')
    expect(getMotionLevel(section)).toBe('off')
    expect(getMotionLevel(plain)).toBe('reduced')
    expect(getMotionLevel()).toBe('reduced')

    section.remove()
    plain.remove()
  })
})
