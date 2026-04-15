import type { App, Plugin } from 'vue'
import './styles/index.css'

// Composables
export { useTheme, currentTheme, applyTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'
export { useNotifications } from './composables/useNotifications'
export type { Notification, NotificationKind } from './composables/useNotifications'

// Components
import TButton from './components/TButton.vue'
import TButtonGroup from './components/TButtonGroup.vue'
import TInput from './components/TInput.vue'
import TTextarea from './components/TTextarea.vue'
import TSelect from './components/TSelect.vue'
import TSwitch from './components/TSwitch.vue'
import TTag from './components/TTag.vue'
import TDropdown from './components/TDropdown.vue'
import TTooltip from './components/TTooltip.vue'
import TSidebar from './components/TSidebar.vue'
import TDateInput from './components/TDateInput.vue'
import TTimeInput from './components/TTimeInput.vue'
import TDateTimeInput from './components/TDateTimeInput.vue'
import TTimePicker from './components/TTimePicker.vue'
import CodeEditor from './components/CodeEditor.vue'
import DatePicker from './components/DatePicker.vue'
import TModalBox from './components/modal/TModalBox.vue'
import TModalBoxHost from './components/modal/TModalBoxHost.vue'
import TInputModalBox from './components/modal/TInputModalBox.vue'
import TNotifications from './components/TNotifications.vue'

// Re-exports for convenience
export { modalManager } from './components/modal/useModalManager'
export type { ModalBoxConfig, ModalInputConfig } from './components/modal/types'
export type { TElementSize } from './components/types'
export type { TButtonVariant, TButtonSize } from './components/TButton.vue'
export type { TButtonGroupOption } from './components/TButtonGroup.vue'

// Named component exports (tree-shakeable)
export {
  TButton,
  TButtonGroup,
  TInput,
  TTextarea,
  TSelect,
  TSwitch,
  TTag,
  TDropdown,
  TTooltip,
  TSidebar,
  TDateInput,
  TTimeInput,
  TDateTimeInput,
  TTimePicker,
  CodeEditor,
  DatePicker,
  TModalBox,
  TModalBoxHost,
  TInputModalBox,
  TNotifications,
}

// Vue plugin — registers all components globally
const components = [
  TButton,
  TButtonGroup,
  TInput,
  TTextarea,
  TSelect,
  TSwitch,
  TTag,
  TDropdown,
  TTooltip,
  TSidebar,
  TDateInput,
  TTimeInput,
  TDateTimeInput,
  TTimePicker,
  CodeEditor,
  DatePicker,
  TModalBox,
  TModalBoxHost,
  TInputModalBox,
  TNotifications,
]

export default {
  install(app: App) {
    for (const component of components) {
      app.component(component.__name as string, component)
    }
  },
} as unknown as Plugin
