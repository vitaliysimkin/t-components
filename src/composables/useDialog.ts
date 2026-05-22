import { watchEffect, type Component } from 'vue'
import { modalManager } from '../components/modal/useModalManager'
import TConfirmDialog from '../components/modal/TConfirmDialog.vue'
import TPromptDialog from '../components/modal/TPromptDialog.vue'

// ─── Public types ────────────────────────────────────────────────────────────

export type DialogVariant = 'neutral' | 'info' | 'success' | 'warning' | 'danger'

export interface DialogBaseOpts {
  /** Dialog window title (shown in the modal header bar) */
  title?: string
  /** Body message text (ignored when contentComponent is provided) */
  message?: string
  /** Label for the confirm/OK button */
  confirmText?: string
  /** Semantic colour for the icon and confirm button */
  variant?: DialogVariant
  /** Render a custom component as the dialog body */
  contentComponent?: Component
  /** Props forwarded to contentComponent */
  componentProps?: Record<string, unknown>
}

export interface ConfirmOpts extends DialogBaseOpts {
  /** Label for the cancel button */
  cancelText?: string
}

export type AlertOpts = DialogBaseOpts

export interface PromptOpts extends ConfirmOpts {
  /** Pre-filled input value */
  inputValue?: string
  /** Placeholder text for the input field */
  placeholder?: string
  /** Label rendered above the input field */
  inputLabel?: string
}

// ─── Composable ──────────────────────────────────────────────────────────────

/**
 * `useDialog()` — Promise-based dialog API built on `modalManager`.
 *
 * @example
 * ```ts
 * const { confirm, alert, prompt } = useDialog()
 *
 * const ok = await confirm({ title: 'Delete?', message: 'This cannot be undone.', variant: 'danger' })
 * if (ok) { ... }
 *
 * await alert({ title: 'Done', message: 'Operation succeeded.', variant: 'success' })
 *
 * const name = await prompt({ title: 'Rename', inputLabel: 'New name', placeholder: 'Enter name…' })
 * if (name !== null) { ... }
 * ```
 */
export function useDialog() {
  /**
   * Opens a confirmation dialog with Confirm / Cancel buttons.
   * Resolves `true` when confirmed, `false` when cancelled (or Escape / backdrop-click).
   */
  function confirm(opts: ConfirmOpts = {}): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let resolved = false

      const settle = (value: boolean) => {
        if (resolved) return
        resolved = true
        resolve(value)
      }

      const modalId = modalManager.openModal({
        label: opts.title ?? 'Confirm',
        contentComponent: TConfirmDialog,
        componentProps: {
          title: opts.title,
          message: opts.message,
          confirmText: opts.confirmText ?? 'OK',
          cancelText: opts.cancelText ?? 'Cancel',
          variant: opts.variant ?? 'neutral',
          alertMode: false,
          contentComponent: opts.contentComponent ?? null,
          componentProps: opts.componentProps ?? {},
          onConfirm: () => {
            modalManager.closeModal(modalId)
            settle(true)
          },
          onCancel: () => {
            modalManager.closeModal(modalId)
            settle(false)
          },
        },
        // Modal configuration: blocking, no chrome, centered
        blocking: true,
        blockingDismissible: true,
        resizable: false,
        minimizable: false,
        draggable: false,
        closable: false,
        position: 'center',
        size: { width: 400, height: 'min-content' },
      })

      // Handle external close (Escape / backdrop-click via TModalBoxHost)
      _watchModalRemoval(modalId, () => settle(false))
    })
  }

  /**
   * Opens an informational alert dialog with a single OK button.
   * Resolves when the user clicks OK, Escape, or the backdrop.
   */
  function alert(opts: AlertOpts = {}): Promise<void> {
    return new Promise<void>(resolve => {
      let resolved = false

      const settle = () => {
        if (resolved) return
        resolved = true
        resolve()
      }

      const modalId = modalManager.openModal({
        label: opts.title ?? 'Alert',
        contentComponent: TConfirmDialog,
        componentProps: {
          title: opts.title,
          message: opts.message,
          confirmText: opts.confirmText ?? 'OK',
          variant: opts.variant ?? 'neutral',
          alertMode: true,
          contentComponent: opts.contentComponent ?? null,
          componentProps: opts.componentProps ?? {},
          onConfirm: () => {
            modalManager.closeModal(modalId)
            settle()
          },
          onCancel: () => {
            // not reachable in alertMode but wired for safety
            modalManager.closeModal(modalId)
            settle()
          },
        },
        blocking: true,
        blockingDismissible: true,
        resizable: false,
        minimizable: false,
        draggable: false,
        closable: false,
        position: 'center',
        size: { width: 400, height: 'min-content' },
      })

      _watchModalRemoval(modalId, settle)
    })
  }

  /**
   * Opens a prompt dialog with a text input field.
   * Resolves to the entered string when confirmed, or `null` on cancel / Escape / backdrop.
   */
  function prompt(opts: PromptOpts = {}): Promise<string | null> {
    return new Promise<string | null>(resolve => {
      let resolved = false

      const settle = (value: string | null) => {
        if (resolved) return
        resolved = true
        resolve(value)
      }

      const modalId = modalManager.openModal({
        label: opts.title ?? 'Prompt',
        contentComponent: TPromptDialog,
        componentProps: {
          title: opts.title,
          message: opts.message,
          confirmText: opts.confirmText ?? 'OK',
          cancelText: opts.cancelText ?? 'Cancel',
          variant: opts.variant ?? 'neutral',
          inputValue: opts.inputValue ?? '',
          placeholder: opts.placeholder,
          inputLabel: opts.inputLabel,
          contentComponent: opts.contentComponent ?? null,
          componentProps: opts.componentProps ?? {},
          onConfirm: (value: string) => {
            modalManager.closeModal(modalId)
            settle(value)
          },
          onCancel: () => {
            modalManager.closeModal(modalId)
            settle(null)
          },
        },
        blocking: true,
        blockingDismissible: true,
        resizable: false,
        minimizable: false,
        draggable: false,
        closable: false,
        position: 'center',
        size: { width: 400, height: 'min-content' },
      })

      _watchModalRemoval(modalId, () => settle(null))
    })
  }

  return { confirm, alert, prompt }
}

// ─── Internal helper ──────────────────────────────────────────────────────────

/**
 * Watches the reactive modal list; fires `callback` once when the modal with
 * the given `id` is no longer present.  This handles external close events
 * (Escape key / backdrop-click processed by TModalBoxHost) that bypass the
 * dialog's own onCancel/onConfirm callbacks.
 *
 * Uses `watchEffect` so it reacts to the same reactive source (`modalManager.modals`)
 * as the rest of the system.  The stop handle is called after firing so the
 * watcher is cleaned up and cannot leak.
 */
function _watchModalRemoval(id: string, callback: () => void): void {
  const stop = watchEffect(() => {
    const still = modalManager.modals.value.some(m => m.id === id)
    if (!still) {
      stop()
      callback()
    }
  })
}
