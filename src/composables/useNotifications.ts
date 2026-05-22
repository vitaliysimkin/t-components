import { ref, readonly, type Ref } from 'vue'

export type NotificationKind = 'info' | 'success' | 'warning' | 'error'

export interface Notification {
  id: number
  kind: NotificationKind
  text: string
  onClick?: () => void
}

/** Options object accepted by `push` and the shorthand helpers. */
export interface NotificationOptions {
  timeoutMs?: number
  onClick?: () => void
}

const DEFAULT_TIMEOUT_MS = 5000

const items = ref<Notification[]>([])
let nextId = 1

/**
 * Add a notification.
 *
 * Overloads:
 *   push(kind, text)
 *   push(kind, text, timeoutMs)
 *   push(kind, text, options)
 */
function push(kind: NotificationKind, text: string, timeoutMsOrOptions?: number | NotificationOptions): number {
  const id = nextId++

  let timeoutMs = DEFAULT_TIMEOUT_MS
  let onClick: (() => void) | undefined

  if (typeof timeoutMsOrOptions === 'number') {
    timeoutMs = timeoutMsOrOptions
  } else if (timeoutMsOrOptions != null) {
    if (timeoutMsOrOptions.timeoutMs !== undefined) {
      timeoutMs = timeoutMsOrOptions.timeoutMs
    }
    onClick = timeoutMsOrOptions.onClick
  }

  items.value.push({ id, kind, text, onClick })

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
    info:    (text: string, timeoutMsOrOptions?: number | NotificationOptions) => push('info',    text, timeoutMsOrOptions),
    success: (text: string, timeoutMsOrOptions?: number | NotificationOptions) => push('success', text, timeoutMsOrOptions),
    warning: (text: string, timeoutMsOrOptions?: number | NotificationOptions) => push('warning', text, timeoutMsOrOptions),
    error:   (text: string, timeoutMsOrOptions?: number | NotificationOptions) => push('error',   text, timeoutMsOrOptions),
  }
}
