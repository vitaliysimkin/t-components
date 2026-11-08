import { readonly, ref, shallowRef } from 'vue'

export type MotionLevel = 'full' | 'reduced' | 'off'
export type MotionSetting = MotionLevel | 'auto'

const KEY = 't-motion'
const QUERY = '(prefers-reduced-motion: reduce)'
const isBrowser = typeof window !== 'undefined'

const saved = isBrowser ? localStorage.getItem(KEY) : null

const setting = ref<MotionSetting>(['full', 'reduced', 'off'].includes(saved as string) ? (saved as MotionSetting) : 'auto')
const level = shallowRef<MotionLevel>('full')

export const currentMotion = readonly(setting)
export const motionLevel = readonly(level)

function apply() {
  const s = setting.value
  level.value = s !== 'auto' ? s : window.matchMedia(QUERY).matches ? 'reduced' : 'full'
  document.documentElement.setAttribute('data-t-motion', level.value)
}

export function setMotion(next: MotionSetting) {
  setting.value = next
  localStorage.setItem(KEY, next)
  apply()
}

/** Level of the nearest `[data-t-motion]` ancestor of `el` (or `el` itself), else `<html>`, else `full`. */
export function getMotionLevel(el?: Element): MotionLevel {
  const holder = (el ?? (isBrowser ? document.documentElement : null))?.closest('[data-t-motion]')
  return (holder?.getAttribute('data-t-motion') as MotionLevel | null) ?? 'full'
}

if (isBrowser) {
  apply()
  window.matchMedia(QUERY).addEventListener('change', () => {
    if (setting.value === 'auto') apply()
  })
}
