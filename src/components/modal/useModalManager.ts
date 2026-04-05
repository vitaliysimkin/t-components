import { ref, computed } from 'vue'
import type { ModalBoxConfig, ModalInputConfig } from './types'
import TInputModalBox from './TInputModalBox.vue'

export interface ModalBoxInstance {
  id: string
  config: ModalBoxConfig
  label?: string
  icon?: string
  contentComponent?: any
  componentProps?: Record<string, any>
}

// Глобальний стан модальних вікон
const modalBoxes = ref<ModalBoxInstance[]>([])
// Активна модалка (для z-index управління)
const activeModalId = ref<string | null>(null)
// Мінімізовані модалки
const minimizedModals = ref<Set<string>>(new Set())

// Генерація унікального ID
const generateId = (): string => {
  return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function useModalManager() {
  // Computed values
  const modals = computed(() => modalBoxes.value)
  const modalCount = computed(() => modalBoxes.value.length)

  // Розрахунок позиції для нової модалки
  const calculateModalPosition = (): { x: number; y: number } => {
    const padding = 50
    const modalWidth = 400
    const modalHeight = 300
    
    const maxX = window.innerWidth - modalWidth - padding
    const maxY = window.innerHeight - modalHeight - padding
    
    // Каскадний ефект для нових модалок
    const offset = (modalBoxes.value.length % 5) * 30
    
    return {
      x: Math.max(padding, Math.min(maxX, padding + offset)),
      y: Math.max(padding, Math.min(maxY, padding + offset))
    }
  }

  // Створення конфігурації модалки
  const createModalConfig = (customConfig?: Partial<ModalBoxConfig>): ModalBoxConfig => {
    const position = calculateModalPosition()
    
    return {
      id: generateId(),
      position,
      ...customConfig
    }
  }

  const openInputModal = (config?: Partial<ModalBoxConfig> & { 
    label?: string; 
    icon?: string;
    inputs: Array<ModalInputConfig> | ModalInputConfig;
    onSubmit?: (values: Record<string, any>) => void;
  }): string => {
    const { label, icon, inputs, onSubmit, ...modalConfig } = config || { inputs: [] }
    
    const finalConfig = createModalConfig({
      blocking: true,
      blockingDismissible: true,
      resizable: false,
      minimizable: false,
      position: "center",
      ...modalConfig
    })
    
    const modalId = finalConfig.id!
    
    const newModal: ModalBoxInstance = {
      id: modalId,
      config: finalConfig,
      label: label || 'Input',
      icon,
      contentComponent: TInputModalBox,
      componentProps: {
        inputs,
        onSubmit: (values: Record<string, any>) => {
          onSubmit?.(values)
          closeModal(modalId)
        },
        onCancel: () => {
          closeModal(modalId)
        }
      }
    }

    modalBoxes.value.push(newModal)
    setActiveModal(modalId)
    return modalId
  }

  // Основні методи
  const openModal = (config?: Partial<ModalBoxConfig> & { 
    label?: string; 
    icon?: string;
    contentComponent?: any;
    componentProps?: Record<string, any>;
  }): string => {
    const { label, icon, contentComponent, componentProps, ...modalConfig } = config || {}
    const finalConfig = createModalConfig(modalConfig)
    const newModal: ModalBoxInstance = {
      id: finalConfig.id!,
      config: finalConfig,
      label,
      icon,
      contentComponent,
      componentProps
    }

    modalBoxes.value.push(newModal)
    // Робимо нову модалку активною
    setActiveModal(newModal.id)
    return newModal.id
  }

  const closeModal = (id: string): boolean => {
    const index = modalBoxes.value.findIndex(modal => modal.id === id)
    if (index !== -1) {
      modalBoxes.value.splice(index, 1)
      // Очищуємо стани при закритті
      if (activeModalId.value === id) {
        activeModalId.value = null
      }
      minimizedModals.value.delete(id)
      return true
    }
    return false
  }

  const closeAllModals = (): number => {
    const count = modalBoxes.value.length
    modalBoxes.value = []
    activeModalId.value = null
    minimizedModals.value.clear()
    return count
  }

  // Z-index управління
  const setActiveModal = (id: string): void => {
    activeModalId.value = id
  }

  const isModalActive = (id: string): boolean => {
    return activeModalId.value === id
  }

  // Мінімізація модалок
  const toggleMinimize = (id: string): void => {
    if (minimizedModals.value.has(id)) {
      // Максимізуємо: видаляємо з мінімізованих і робимо активною
      minimizedModals.value.delete(id)
      setActiveModal(id)
    } else {
      // Мінімізуємо: додаємо до мінімізованих
      minimizedModals.value.add(id)
      // Якщо мінімізуємо активну модалку, очищаємо активність
      if (activeModalId.value === id) {
        activeModalId.value = null
      }
    }
  }

  const isModalMinimized = (id: string): boolean => {
    return minimizedModals.value.has(id)
  }

  return {
    // Стан
    modals,
    modalCount,
    activeModalId: computed(() => activeModalId.value),
    
    // Методи
    openModal,
    openInputModal,
    closeModal,
    closeAllModals,
    setActiveModal,
    isModalActive,
    toggleMinimize,
    isModalMinimized
  }
}

// Глобальний екземпляр
export const modalManager = useModalManager()