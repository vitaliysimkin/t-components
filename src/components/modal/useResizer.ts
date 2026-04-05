import { reactive, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'
import type { Size, ResizeOptions } from './types'

export function useResizer(
  resizeEl: Ref<HTMLElement | undefined>,
  options: ResizeOptions = {}
) {
  // Поточний розмір елемента
  const currentSize = reactive<Size>({ width: 400, height: 300 })
  
  // ResizeObserver для відслідковування змін розміру
  let resizeObserver: ResizeObserver | null = null

  // Throttle для оптимізації
  const throttle = (func: Function, delay: number) => {
    let timeoutId: ReturnType<typeof setTimeout>
    let lastExecTime = 0
    
    return function (...args: any[]) {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        func(...args)
        lastExecTime = currentTime
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func(...args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
      }
    }
  }

  // Обробник зміни розміру (як в BnzModalBox)
  const onElementResized = throttle((entries: ResizeObserverEntry[]) => {
    const entry = entries[0]
    if (!entry) return
    
    const { width, height } = entry.contentRect
    
    // Оновлюємо поточний розмір
    currentSize.width = width
    currentSize.height = height
    
  }, options.throttleTimeout || 100)

  // Встановити розмір (як setSize в BnzModalBox)
  const setSize = (size: Size) => {
    if (!resizeEl.value) return
    
    const element = resizeEl.value
    element.style.width = typeof size.width === "string" ? size.width : (size.width + "px")
    element.style.height = typeof size.height === "string" ? size.height : (size.height + "px")
    
    // Оновлюємо внутрішній стан
    currentSize.width = size.width
    currentSize.height = size.height
  }

  const setMinSize = (size: Size) => {
    if (!resizeEl.value) return
    
    const element = resizeEl.value
    element.style.minWidth = typeof size.width === "string" ? size.width : (size.width + "px")
    element.style.minHeight = typeof size.height === "string" ? size.height : (size.height + "px")
  }

  const setMaxSize = (size: Size) => {
    if (!resizeEl.value) return
    
    const element = resizeEl.value
    element.style.maxWidth = typeof size.width === "string" ? size.width : (size.width + "px")
    element.style.maxHeight = typeof size.height === "string" ? size.height : (size.height + "px")
  }

  // Setup ResizeObserver
  const setupResizeObserver = (element: HTMLElement) => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
    
    resizeObserver = new ResizeObserver(onElementResized)
    resizeObserver.observe(element)
  }

  const destroy = () => {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
  }

  // CSS стиль для resizable
  const resizeStyle = computed(() => ({
    resize: (options.enabled !== false ? 'both' : 'none') as 'both' | 'none',
    overflow: 'auto' as const
  }))

  // Lifecycle
  let stopWatcher: (() => void) | null = null
  
  onMounted(() => {
    // Watch for resizeEl changes
    stopWatcher = watch(
      resizeEl,
      (newElement, oldElement) => {
        if (oldElement && resizeObserver) {
          resizeObserver.unobserve(oldElement)
        }
        
        if (newElement) {
          setupResizeObserver(newElement)
        }
      },
      { immediate: true }
    )
  })

  onUnmounted(() => {
    stopWatcher?.()
    destroy()
  })

  return {
    // States
    size: computed(() => ({ width: currentSize.width, height: currentSize.height })),
    
    // Styles
    resizeStyle,
    
    // Methods
    setSize,
    setMinSize,
    setMaxSize,
    destroy
  }
}