import { ref, readonly, type Ref } from 'vue'

export interface LoadingOptions {
  /** Text shown beneath the spinner */
  text?: string
  /** Mount the overlay over the entire viewport (full-screen mode) */
  fullscreen?: boolean
  /** Target element to overlay in element-scoped mode */
  target?: HTMLElement | null
  /** Prevent scrolling on the target/body while loading */
  lock?: boolean
}

export interface LoadingHandle {
  close(): void
}

export interface LoadingInstance {
  id: number
  text: string
  fullscreen: boolean
  target: HTMLElement | null
  lock: boolean
}

// ── Module-level singleton state (same pattern as useNotifications) ──────────

const instances = ref<LoadingInstance[]>([])
let nextId = 1

function show(opts: LoadingOptions = {}): LoadingHandle {
  const {
    text = '',
    fullscreen = false,
    target = null,
    lock = false,
  } = opts

  const id = nextId++
  const instance: LoadingInstance = { id, text, fullscreen, target, lock }
  instances.value.push(instance)

  return {
    close() {
      closeById(id)
    },
  }
}

function closeById(id: number): void {
  instances.value = instances.value.filter(i => i.id !== id)
}

function closeAll(): void {
  instances.value = []
}

export function useLoading() {
  return {
    /** Reactive list of active loading instances (read-only) */
    instances: readonly(instances) as Readonly<Ref<readonly LoadingInstance[]>>,
    /** Show a loading overlay. Returns a handle with `.close()`. */
    show,
    /** Close all active loading overlays */
    closeAll,
  }
}
