import { ref, readonly, type Ref } from 'vue'

export type NotificationKind = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: number
  kind: NotificationKind
  text: string
}

const DEFAULT_TIMEOUT_MS = 5000

const items = ref<Notification[]>([])
let nextId = 1

function push(kind: NotificationKind, text: string, timeoutMs: number = DEFAULT_TIMEOUT_MS): number {
  const id = nextId++
  items.value.push({ id, kind, text })
  if (timeoutMs > 0) {
    setTimeout(() => dismiss(id), timeoutMs)
  }
  return id
}

function dismiss(id: number): void {
  items.value = items.value.filter(n => n.id !== id)
}

function clear(): void {
  items.value = []
}

export function useNotifications() {
  return {
    items: readonly(items) as Readonly<Ref<readonly Notification[]>>,
    push,
    dismiss,
    clear,
    info:    (text: string, timeoutMs?: number) => push('info',    text, timeoutMs),
    success: (text: string, timeoutMs?: number) => push('success', text, timeoutMs),
    warning: (text: string, timeoutMs?: number) => push('warning', text, timeoutMs),
    error:   (text: string, timeoutMs?: number) => push('error',   text, timeoutMs),
  }
}
