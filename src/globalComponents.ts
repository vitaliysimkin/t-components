// Volar / Vue Language Tools augmentation for globally-registered components.
// Keep this list in sync with `componentRegistry` in `./components/registry.ts`.
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    TButton: typeof import('./components/TButton.vue')['default']
    TButtonGroup: typeof import('./components/TButtonGroup.vue')['default']
    TInput: typeof import('./components/TInput.vue')['default']
    TTextarea: typeof import('./components/TTextarea.vue')['default']
    TSelect: typeof import('./components/TSelect.vue')['default']
    TSwitch: typeof import('./components/TSwitch.vue')['default']
    TTag: typeof import('./components/TTag.vue')['default']
    TTabs: typeof import('./components/TTabs.vue')['default']
    TDropdown: typeof import('./components/TDropdown.vue')['default']
    TTooltip: typeof import('./components/TTooltip.vue')['default']
    TSidebar: typeof import('./components/TSidebar.vue')['default']
    TDateInput: typeof import('./components/TDateInput.vue')['default']
    TTimeInput: typeof import('./components/TTimeInput.vue')['default']
    TDateTimeInput: typeof import('./components/TDateTimeInput.vue')['default']
    TTimePicker: typeof import('./components/TTimePicker.vue')['default']
    TCodeEditor: typeof import('./components/TCodeEditor.vue')['default']
    TDatePicker: typeof import('./components/TDatePicker.vue')['default']
    TModalBox: typeof import('./components/modal/TModalBox.vue')['default']
    TModalBoxHost: typeof import('./components/modal/TModalBoxHost.vue')['default']
    TInputModalBox: typeof import('./components/modal/TInputModalBox.vue')['default']
    TNotifications: typeof import('./components/TNotifications.vue')['default']
    TTable: typeof import('./components/TTable.vue')['default']
  }
}

export {}
