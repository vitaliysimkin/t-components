import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useDialog } from '../composables/useDialog'
import { modalManager } from '../components/modal/useModalManager'

describe('useDialog', () => {
  beforeEach(() => {
    modalManager.closeAllModals()
  })

  afterEach(() => {
    modalManager.closeAllModals()
  })

  // ── confirm ───────────────────────────────────────────────────────────────

  describe('confirm()', () => {
    it('opens exactly one modal and marks it active', () => {
      const { confirm } = useDialog()
      confirm({ title: 'Test', message: 'Hello' })
      expect(modalManager.modalCount.value).toBe(1)
      const id = modalManager.activeModalId.value
      expect(id).not.toBeNull()
    })

    it('resolves true when onConfirm callback fires', async () => {
      const { confirm } = useDialog()
      const promise = confirm({ title: 'Delete?' })

      const modal = modalManager.modals.value[0]
      const { onConfirm } = modal.componentProps as { onConfirm: () => void }
      onConfirm()

      const result = await promise
      expect(result).toBe(true)
    })

    it('resolves false when onCancel callback fires', async () => {
      const { confirm } = useDialog()
      const promise = confirm({ title: 'Delete?' })

      const modal = modalManager.modals.value[0]
      const { onCancel } = modal.componentProps as { onCancel: () => void }
      onCancel()

      const result = await promise
      expect(result).toBe(false)
    })

    it('resolves false when modal is removed externally (backdrop/Escape)', async () => {
      const { confirm } = useDialog()
      const promise = confirm({ title: 'Delete?' })

      const id = modalManager.activeModalId.value!
      // Simulate external close (backdrop / Escape)
      modalManager.closeModal(id)
      await nextTick()

      const result = await promise
      expect(result).toBe(false)
    })

    it('closes the modal after confirm', async () => {
      const { confirm } = useDialog()
      confirm({ title: 'Test' })
      expect(modalManager.modalCount.value).toBe(1)

      const modal = modalManager.modals.value[0]
      ;(modal.componentProps as { onConfirm: () => void }).onConfirm()

      expect(modalManager.modalCount.value).toBe(0)
    })

    it('forwards title, message, variant, confirmText, cancelText to the dialog component', () => {
      const { confirm } = useDialog()
      confirm({
        title: 'My Title',
        message: 'My Message',
        variant: 'danger',
        confirmText: 'Yes',
        cancelText: 'No',
      })
      const props = modalManager.modals.value[0].componentProps as Record<string, unknown>
      expect(props.title).toBe('My Title')
      expect(props.message).toBe('My Message')
      expect(props.variant).toBe('danger')
      expect(props.confirmText).toBe('Yes')
      expect(props.cancelText).toBe('No')
    })

    it('defaults to neutral variant and standard labels', () => {
      const { confirm } = useDialog()
      confirm()
      const props = modalManager.modals.value[0].componentProps as Record<string, unknown>
      expect(props.variant).toBe('neutral')
      expect(props.confirmText).toBe('OK')
      expect(props.cancelText).toBe('Cancel')
    })
  })

  // ── alert ─────────────────────────────────────────────────────────────────

  describe('alert()', () => {
    it('resolves (void) when onConfirm fires', async () => {
      const { alert } = useDialog()
      const promise = alert({ title: 'Done', message: 'All good.' })

      const modal = modalManager.modals.value[0]
      ;(modal.componentProps as { onConfirm: () => void }).onConfirm()

      await expect(promise).resolves.toBeUndefined()
    })

    it('sets alertMode: true on the dialog component props', () => {
      const { alert } = useDialog()
      alert({ title: 'Info' })
      const props = modalManager.modals.value[0].componentProps as Record<string, unknown>
      expect(props.alertMode).toBe(true)
    })

    it('resolves when modal is removed externally', async () => {
      const { alert } = useDialog()
      const promise = alert({ title: 'Info' })

      modalManager.closeModal(modalManager.activeModalId.value!)
      await nextTick()

      await expect(promise).resolves.toBeUndefined()
    })
  })

  // ── prompt ────────────────────────────────────────────────────────────────

  describe('prompt()', () => {
    it('resolves with the string value when onConfirm fires', async () => {
      const { prompt } = useDialog()
      const promise = prompt({ title: 'Enter name', inputValue: 'default' })

      const modal = modalManager.modals.value[0]
      const { onConfirm } = modal.componentProps as { onConfirm: (v: string) => void }
      onConfirm('Alice')

      const result = await promise
      expect(result).toBe('Alice')
    })

    it('resolves null when onCancel fires', async () => {
      const { prompt } = useDialog()
      const promise = prompt({ title: 'Enter name' })

      const modal = modalManager.modals.value[0]
      ;(modal.componentProps as { onCancel: () => void }).onCancel()

      const result = await promise
      expect(result).toBeNull()
    })

    it('resolves null when modal is removed externally', async () => {
      const { prompt } = useDialog()
      const promise = prompt({ title: 'Enter name' })

      modalManager.closeModal(modalManager.activeModalId.value!)
      await nextTick()

      const result = await promise
      expect(result).toBeNull()
    })

    it('forwards prompt-specific options to the dialog component', () => {
      const { prompt } = useDialog()
      prompt({
        inputValue: 'hello',
        placeholder: 'type here…',
        inputLabel: 'Your input',
      })
      const props = modalManager.modals.value[0].componentProps as Record<string, unknown>
      expect(props.inputValue).toBe('hello')
      expect(props.placeholder).toBe('type here…')
      expect(props.inputLabel).toBe('Your input')
    })
  })

  // ── multiple concurrent dialogs ───────────────────────────────────────────

  it('stacks multiple concurrent dialogs independently', async () => {
    const { confirm, alert } = useDialog()

    confirm({ title: 'First' })
    alert({ title: 'Second' })

    expect(modalManager.modalCount.value).toBe(2)

    // Resolve first dialog
    const first = modalManager.modals.value[0]
    ;(first.componentProps as { onConfirm: () => void }).onConfirm()

    expect(modalManager.modalCount.value).toBe(1)

    // Resolve second dialog
    const second = modalManager.modals.value[0]
    ;(second.componentProps as { onConfirm: () => void }).onConfirm()

    expect(modalManager.modalCount.value).toBe(0)
  })
})
