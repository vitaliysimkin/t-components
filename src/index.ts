import type { App, Plugin } from 'vue'
import './styles/index.css'
import './icons/offline-icons'
import './globalComponents'

import { componentRegistry } from './components/registry'

// Composables
export { useTheme, currentTheme, applyTheme } from './composables/useTheme'
export type { Theme } from './composables/useTheme'
export { useNotifications } from './composables/useNotifications'
export type { Notification, NotificationKind, NotificationOptions } from './composables/useNotifications'

// Re-exports for convenience
export { modalManager } from './components/modal/useModalManager'
export type { ModalBoxConfig, ModalInputConfig } from './components/modal/types'
export type { TElementSize, TFormFieldProps, TOption } from './components/types'
export type { TSelectProps } from './components/TSelect.vue'
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
export type {
  TTableColumn,
  TTableSort,
  TTableSortDirection,
} from './components/TTable.vue'

// Named component exports (tree-shakeable) — single source of truth lives in registry.ts
export {
  TIcon,
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
  TBottomNav,
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
  TFormField,
  TTable,
  TLoadingOverlay,
  TTree,
  TEmpty,
  TBadge,
  TCollapseTransition,
  TCard,
  TCheckbox,
  TDiffEditor,
} from './components/registry'

export { TFormFieldContextKey } from './components/TFormField.vue'
export type { TFormFieldContext } from './components/TFormField.vue'

export type { TTreeProps, TTreeNode, TTreeNodeSlotProps } from './components/TTree.vue'
export type { TEmptyProps } from './components/TEmpty.vue'
export type { TBadgeVariant, TBadgeProps } from './components/TBadge.vue'
export type { TCardProps } from './components/TCard.vue'
export type { TCheckboxProps } from './components/TCheckbox.vue'
export type { TDiffEditorProps } from './components/TDiffEditor.vue'

export { useDialog } from './composables/useDialog'
export type { DialogVariant, DialogBaseOpts, ConfirmOpts, AlertOpts, PromptOpts } from './composables/useDialog'

export { useLoading } from './composables/useLoading'
export type { LoadingOptions, LoadingHandle, LoadingInstance } from './composables/useLoading'

export { useFormValidation } from './composables/useFormValidation'
export type { FormValidationTrigger, FormFieldRule, FormValidationRules, FormValidatorFn, FormAsyncValidatorFn, UseFormValidationReturn } from './composables/useFormValidation'

export { componentRegistry } from './components/registry'

// Vue plugin — registers all components globally using registry keys as names
export default {
  install(app: App) {
    for (const [name, component] of Object.entries(componentRegistry)) {
      app.component(name, component)
    }
  },
} as Plugin
