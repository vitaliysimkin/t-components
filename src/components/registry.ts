import type { Component } from 'vue'
import TButton from './TButton.vue'
import TButtonGroup from './TButtonGroup.vue'
import TInput from './TInput.vue'
import TTextarea from './TTextarea.vue'
import TSelect from './TSelect.vue'
import TSwitch from './TSwitch.vue'
import TTag from './TTag.vue'
import TDropdown from './TDropdown.vue'
import TTooltip from './TTooltip.vue'
import TSidebar from './TSidebar.vue'
import TDateInput from './TDateInput.vue'
import TTimeInput from './TTimeInput.vue'
import TDateTimeInput from './TDateTimeInput.vue'
import TTimePicker from './TTimePicker.vue'
import TTabs from './TTabs.vue'
import TCodeEditor from './TCodeEditor.vue'
import TDatePicker from './TDatePicker.vue'
import TModalBox from './modal/TModalBox.vue'
import TModalBoxHost from './modal/TModalBoxHost.vue'
import TInputModalBox from './modal/TInputModalBox.vue'
import TNotifications from './TNotifications.vue'

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
}

// Plugin registration source of truth. Types are intentionally erased to
// `Component` so the registry value does not depend on per-component prop
// types — that avoids a circular type reference when `GlobalComponents` is
// augmented from this same list (see `../globalComponents.ts`).
export const componentRegistry: Record<string, Component> = {
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
}
