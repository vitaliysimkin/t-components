import { ref, reactive, computed, onMounted, onUnmounted, watch, type Ref } from 'vue'

interface Position {
  x: number
  y: number
}

interface DragOptions {
  enabled?: boolean
  throttleTimeout?: number
  minVisiblePixels?: number
  onDragStart?: () => void
}

/**
 * Global reactive state that indicates whether overlay elements should be visible.
 * This is used during drag operations to show protective overlays that:
 * - Prevent mouse events from "falling through" to elements behind modal windows
 * - Maintain consistent cursor appearance during drag
 * - Block hover/focus effects on background elements
 * 
 * TModalBoxHost should watch this property and apply CSS classes accordingly.
 */
export const overlayVisible = ref(false)

const updateOverlaysVisibility = (visible: boolean) => {
  overlayVisible.value = visible
}

export function useDragger(
  dragControlEl: Ref<HTMLElement | undefined>,
  dragEl?: Ref<HTMLElement | undefined>,
  options: DragOptions = {}
) {
  // Стани
  const active = ref(false)
  const enabled = ref(options.enabled ?? true)
  
  // Позиції
  const initialPosition = reactive<Position>({ x: 0, y: 0 })
  const currentPosition = reactive<Position>({ x: 0, y: 0 })
  const offsetPosition = reactive<Position>({ x: 0, y: 0 })
  const lastPosition = reactive<Position>({ x: 0, y: 0 })

  // RAF для плавної анімації синхронізованої з дисплеєм
  let rafId = 0
  let lastMouseEvent: MouseEvent | TouchEvent | null = null

  // Event listeners registry
  const eventListeners: Array<{
    element: HTMLElement | Window | Document
    event: string
    handler: EventListener
    throttledHandler?: EventListener
  }> = []

  // Throttle функція з правильною типізацією
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- generic throttle wraps arbitrary handler signatures (MouseEvent/TouchEvent/ResizeObserver); unknown[] breaks contravariant param check
  const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): (this: ThisParameterType<T>, ...args: Parameters<T>) => ReturnType<T> | undefined => {
    let timeoutId: ReturnType<typeof setTimeout>
    let lastExecTime = 0
    
    return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
      const currentTime = Date.now()
      
      if (currentTime - lastExecTime > delay) {
        const result = func.apply(this, args)
        lastExecTime = currentTime
        return result
      } else {
        clearTimeout(timeoutId)
        timeoutId = setTimeout(() => {
          func.apply(this, args)
          lastExecTime = Date.now()
        }, delay - (currentTime - lastExecTime))
        return undefined
      }
    }
  }

  // Перевірка дозволу на drag
  const isAllowDrag = (element: HTMLElement | null): boolean => {
    if (element == null) {
      return false
    }
    if (element === dragControlEl.value) {
      return true
    } else if (element.hasAttribute("ignore-drag")) {
      return false
    } else {
      return isAllowDrag(element.parentElement)
    }
  }

  // Коректування позиції в межах viewport (залишаємо мінімум 10px dragControl елемента видимими)
  const correctPosition = (position: Position) => {
    const targetEl = dragEl?.value || dragControlEl.value
    const controlEl = dragControlEl.value
    if (!targetEl || !controlEl) return
    
    // Отримуємо розміри dragControl елемента (заголовок)
    const controlRect = controlEl.getBoundingClientRect()
    // Отримуємо розміри всього елемента для розрахунку offset
    const targetRect = targetEl.getBoundingClientRect()
    
    // Враховуємо viewport з safe-area
    const viewPort = window.visualViewport || window
    const viewportWidth = viewPort instanceof VisualViewport ? viewPort.width : window.innerWidth
    const viewportHeight = viewPort instanceof VisualViewport ? viewPort.height : window.innerHeight
    
    // Мінімум видимої частини dragControl елемента
    const minVisiblePixels = options.minVisiblePixels ?? 20
    
    // Розраховуємо offset між dragControl та target елементом
    const offsetX = controlRect.left - targetRect.left
    const offsetY = controlRect.top - targetRect.top
    
    // Розраховуємо межі: дозволяємо виходити за viewport, але залишаємо 10px dragControl видимими
    const minX = -(offsetX + controlRect.width - minVisiblePixels) // можна винести ліворуч, залишивши 10px заголовка
    const maxX = viewportWidth - offsetX - minVisiblePixels // можна винести праворуч, залишивши 10px заголовка
    const minY = -(offsetY + controlRect.height - minVisiblePixels) // можна винести вгору, залишивши 10px заголовка  
    const maxY = viewportHeight - offsetY - minVisiblePixels // можна винести вниз, залишивши 10px заголовка
    
    // Обмежуємо позицію
    if (position.x < minX) {
      position.x = minX
    } else if (position.x > maxX) {
      position.x = maxX
    }
    
    if (position.y < minY) {
      position.y = minY
    } else if (position.y > maxY) {
      position.y = maxY
    }
  }

  // Drag handlers
  const dragStart = (e: MouseEvent | TouchEvent) => {
    if (!enabled.value || !isAllowDrag(e.target as HTMLElement)) {
      return
    }
    
    e.stopPropagation()
    e.preventDefault()
    
    const isTouch = e.type === "touchstart"
    const clientX = isTouch ? (e as TouchEvent).touches[0]?.clientX ?? 0 : (e as MouseEvent).clientX
    const clientY = isTouch ? (e as TouchEvent).touches[0]?.clientY ?? 0 : (e as MouseEvent).clientY
    
    initialPosition.x = clientX - offsetPosition.x
    initialPosition.y = clientY - offsetPosition.y
    
    // Викликаємо коллбек активації модалки
    options.onDragStart?.()
    
    updateOverlaysVisibility(true)
    active.value = true
    addMouseMoveListeners()
  }

  const drag = (e: MouseEvent | TouchEvent) => {
    if (!active.value) {
      removeMouseMoveListeners()
      return
    }
    
    // Запобігаємо поведінці за замовчуванням тільки коли active
    e.preventDefault()
    
    // Зберігаємо останню подію
    lastMouseEvent = e
    
    // Якщо RAF вже запланований, просто оновлюємо подію
    if (rafId) return
    
    // Плануємо обробку на наступний кадр
    rafId = requestAnimationFrame(() => {
      if (!lastMouseEvent || !active.value) {
        rafId = 0
        return
      }
      
      const isTouch = lastMouseEvent.type === "touchmove"
      const clientX = isTouch ? (lastMouseEvent as TouchEvent).touches[0]?.clientX ?? 0 : (lastMouseEvent as MouseEvent).clientX
      const clientY = isTouch ? (lastMouseEvent as TouchEvent).touches[0]?.clientY ?? 0 : (lastMouseEvent as MouseEvent).clientY
      
      const position = {
        x: clientX - initialPosition.x,
        y: clientY - initialPosition.y
      }
      
      setPosition(position)
      rafId = 0
    })
  }

  const dragEnd = (e: MouseEvent | TouchEvent) => {
    // Для touch подій запобігаємо поведінці за замовчуванням
    if (e.type.startsWith("touch")) {
      e.preventDefault()
    }
    
    // Скасовуємо pending RAF
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    
    lastMouseEvent = null
    initialPosition.x = currentPosition.x
    initialPosition.y = currentPosition.y
    
    updateOverlaysVisibility(false)
    active.value = false
    removeMouseMoveListeners()
  }

  // Resize handler
  const onDocumentResize = () => {
    setPosition({ x: currentPosition.x, y: currentPosition.y })
  }

  // Event management
  const addEventListener = (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener,
    useThrottle = true,
    timeout = options.throttleTimeout || 50
  ) => {
    const finalHandler = useThrottle ? throttle(handler, timeout) as EventListener : handler
    
    element.addEventListener(event, finalHandler)
    eventListeners.push({
      element,
      event,
      handler,
      throttledHandler: finalHandler
    })
  }

  const removeEventListener = (
    element: HTMLElement | Window | Document,
    event: string,
    handler: EventListener
  ) => {
    const index = eventListeners.findIndex(
      listener => listener.element === element && 
                 listener.event === event && 
                 listener.handler === handler
    )
    
    if (index !== -1) {
      const listener = eventListeners[index]
      const handlerToRemove = listener?.throttledHandler || listener?.handler
      if (handlerToRemove) {
        element.removeEventListener(event, handlerToRemove)
      }
      eventListeners.splice(index, 1)
    }
  }

  const addMouseMoveListeners = () => {
    if (dragControlEl.value) {
      // Без throttle для плавного drag'у
      addEventListener(dragControlEl.value, "mousemove", drag as EventListener, false)
      addEventListener(dragControlEl.value, "touchmove", drag as EventListener, false)
    }
    // Без throttle для плавного drag'у
    addEventListener(document, "mouseup", dragEnd as EventListener, false)
    addEventListener(document, "mousemove", drag as EventListener, false)
    addEventListener(document, "touchend", dragEnd as EventListener, false)
    addEventListener(document, "touchmove", drag as EventListener, false)
  }

  const removeMouseMoveListeners = () => {
    if (dragControlEl.value) {
      removeEventListener(dragControlEl.value, "mousemove", drag as EventListener)
      removeEventListener(dragControlEl.value, "touchmove", drag as EventListener)
    }
    removeEventListener(document, "mouseup", dragEnd as EventListener)
    removeEventListener(document, "mousemove", drag as EventListener)
    removeEventListener(document, "touchend", dragEnd as EventListener)
    removeEventListener(document, "touchmove", drag as EventListener)
  }

  const setupDragElement = (element: HTMLElement | undefined) => {
    if (!element) return
    
    // Mouse events
    addEventListener(element, "mousedown", dragStart as EventListener, false)
    addEventListener(element, "mouseup", dragEnd as EventListener, false)
    
    // Touch events
    addEventListener(element, "touchstart", dragStart as EventListener, false)
    addEventListener(element, "touchend", dragEnd as EventListener, false)
  }

  const cleanupDragElement = (element: HTMLElement | undefined) => {
    if (!element) return
    
    // Mouse events
    removeEventListener(element, "mousedown", dragStart as EventListener)
    removeEventListener(element, "mouseup", dragEnd as EventListener)
    
    // Touch events
    removeEventListener(element, "touchstart", dragStart as EventListener)
    removeEventListener(element, "touchend", dragEnd as EventListener)
  }

  // Public methods
  const setPosition = (position: Position) => {
    correctPosition(position)
    
    offsetPosition.x = position.x
    offsetPosition.y = position.y
    currentPosition.x = position.x
    currentPosition.y = position.y
  }

  const disable = () => {
    lastPosition.x = currentPosition.x
    lastPosition.y = currentPosition.y
    enabled.value = false
  }

  const enable = () => {
    enabled.value = true
    setPosition({ x: lastPosition.x, y: lastPosition.y })
  }

  const destroy = () => {
    // Скасовуємо pending RAF
    if (rafId) {
      cancelAnimationFrame(rafId)
      rafId = 0
    }
    
    // Очищаємо всі event listeners
    eventListeners.forEach(listener => {
      const handlerToRemove = listener.throttledHandler || listener.handler
      if (handlerToRemove) {
        listener.element.removeEventListener(listener.event, handlerToRemove)
      }
    })
    eventListeners.length = 0
    lastMouseEvent = null
  }

  // CSS стиль для transform
  const dragStyle = computed(() => ({
    transform: `translate3d(${currentPosition.x}px, ${currentPosition.y}px, 0)`
  }))

  // Lifecycle
  let stopWatcher: (() => void) | null = null
  
  onMounted(() => {
    // Setup resize listener
    addEventListener(window, "resize", onDocumentResize, true, 200)
    
    // Watch for dragControlEl changes
    stopWatcher = watch(
      dragControlEl,
      (newElement, oldElement) => {
        // Cleanup old element
        if (oldElement) {
          cleanupDragElement(oldElement)
        }
        
        // Setup new element
        if (newElement) {
          setupDragElement(newElement)
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
    active: computed(() => active.value),
    enabled: computed(() => enabled.value),
    isDragging: computed(() => active.value),
    position: computed(() => ({ x: currentPosition.x, y: currentPosition.y })),
    
    // Styles
    dragStyle,
    
    // Methods
    setPosition,
    enable,
    disable,
    destroy
  }
}