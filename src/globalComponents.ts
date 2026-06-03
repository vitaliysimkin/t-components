// Volar / Vue Language Tools augmentation for globally-registered components.
// Keep this list in sync with `componentRegistry` in `./components/registry.ts`.
declare module '@vue/runtime-core' {
  interface GlobalComponents {
    TIcon: typeof import('./components/TIcon.vue')['default']
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
    TBottomNav: typeof import('./components/TBottomNav.vue')['default']
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
    TFormField: typeof import('./components/TFormField.vue')['default']
    TTable: typeof import('./components/TTable.vue')['default']
    TLoadingOverlay: typeof import('./components/TLoadingOverlay.vue')['default']
    TTree: typeof import('./components/TTree.vue')['default']
    TEmpty: typeof import('./components/TEmpty.vue')['default']
    TBadge: typeof import('./components/TBadge.vue')['default']
    TCollapseTransition: typeof import('./components/TCollapseTransition.vue')['default']
    TCard: typeof import('./components/TCard.vue')['default']
    TCheckbox: typeof import('./components/TCheckbox.vue')['default']
    TDiffEditor: typeof import('./components/TDiffEditor.vue')['default']
  }
}

export {}
