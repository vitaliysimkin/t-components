import type { App, Plugin } from 'vue'
import './styles/index.css'
import './globalComponents'

import { componentRegistry } from './components/registry'

// Composables
export { useTheme, currentTheme, applyTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'
export { useNotifications } from './composables/useNotifications'
export type { Notification, NotificationKind } from './composables/useNotifications'

// Re-exports for convenience
export { modalManager } from './components/modal/useModalManager'
export type { ModalBoxConfig, ModalInputConfig } from './components/modal/types'
export type { TElementSize, TFormFieldProps } from './components/types'
export type { TButtonVariant, TButtonSize } from './components/TButton.vue'
export type { TButtonGroupOption } from './components/TButtonGroup.vue'
export type { TTabsVariant, TTabsSize, TTabsAlign, TTabValue, TTabItem } from './components/TTabs.vue'
export type {
  TDatePickerMode,
  TDatePickerViewType,
  TDatePickerView,
  TDatePickerRangeValue,
  TDatePickerProps,
  TDatePickerEmits,
} from './components/TDatePicker.vue'

// Named component exports (tree-shakeable) — single source of truth lives in registry.ts
export {
  TButton,
  TButtonGroup,
  TInput,
  TTextarea,
  TSelect,
  TSwitch,
  TTag,
  TTabs,
  TDropdown,
  TTooltip,
  TSidebar,
  TDateInput,
  TTimeInput,
  TDateTimeInput,
  TTimePicker,
  TCodeEditor,
  TDatePicker,
  TModalBox,
  TModalBoxHost,
  TInputModalBox,
  TNotifications,
} from './components/registry'

export { componentRegistry } from './components/registry'

// Vue plugin — registers all components globally using registry keys as names
export default {
  install(app: App) {
    for (const [name, component] of Object.entries(componentRegistry)) {
      app.component(name, component)
    }
  },
} as Plugin
