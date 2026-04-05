import { ref, watch } from 'vue'

export type Theme = 'light' | 'dark' | 'auto'

const savedTheme = (typeof localStorage !== 'undefined'
  ? (localStorage.getItem('theme') as Theme | null)
  : null) ?? 'auto'

export const currentTheme = ref<Theme>(savedTheme)

function getIsDark(theme: Theme): boolean {
  if (theme === 'auto') {
    return typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false
  }
  return theme === 'dark'
}

export function applyTheme(theme: Theme) {
  const dark = getIsDark(theme)
  document.documentElement.classList.remove('dark', 'light')
  document.documentElement.classList.add(dark ? 'dark' : 'light')
}

// Initialize on first load
if (typeof window !== 'undefined') {
  applyTheme(currentTheme.value)

  watch(currentTheme, (theme) => {
    localStorage.setItem('theme', theme)
    applyTheme(theme)
  })

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentTheme.value === 'auto') applyTheme('auto')
  })
}

export function useTheme() {
  return { currentTheme, applyTheme }
}
