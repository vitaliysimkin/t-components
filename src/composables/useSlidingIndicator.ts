import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref, type WatchSource } from 'vue'

export interface IndicatorBox { x: number, w: number, h: number }

/** Internal: measures the element `find` returns (offset box) and re-measures on `deps` change and root resize. */
export function useSlidingIndicator(
  root: Ref<HTMLElement | null>,
  find: () => HTMLElement | null | undefined,
  deps: WatchSource[]
) {
  const box = ref<IndicatorBox | null>(null)
  const measure = () => {
    const el = find()
    box.value = el ? { x: el.offsetLeft, w: el.offsetWidth, h: el.offsetHeight } : null
  }
  let observer: ResizeObserver | undefined
  onMounted(() => {
    measure()
    if (typeof ResizeObserver === 'undefined' || !root.value) return
    observer = new ResizeObserver(measure)
    observer.observe(root.value)
  })
  onBeforeUnmount(() => observer?.disconnect())
  watch(deps, () => nextTick(measure), { flush: 'post' })
  return box
}
