import { describe, it, expect, beforeEach } from 'vitest'
import { useModalManager } from '../components/modal/useModalManager'

// NOTE: useModalManager() returns a *new* closure over the shared module-level
// state each call. We use the same instance per test, but state carries across
// tests — explicitly clean it up in `beforeEach`.

describe('useModalManager', () => {
  let mgr: ReturnType<typeof useModalManager>

  beforeEach(() => {
    mgr = useModalManager()
    mgr.closeAllModals()
  })

  it('openModal adds a modal and returns an id; closeModal removes it and resets state', () => {
    expect(mgr.modalCount.value).toBe(0)
    const id = mgr.openModal({ label: 'Hello' })
    expect(typeof id).toBe('string')
    expect(mgr.modalCount.value).toBe(1)
    expect(mgr.activeModalId.value).toBe(id)

    const removed = mgr.closeModal(id)
    expect(removed).toBe(true)
    expect(mgr.modalCount.value).toBe(0)
    expect(mgr.activeModalId.value).toBeNull()
  })

  it('closeModal returns false for an unknown id', () => {
    expect(mgr.closeModal('does-not-exist')).toBe(false)
  })

  it('closeAllModals clears everything and returns the number closed', () => {
    mgr.openModal({ label: 'A' })
    mgr.openModal({ label: 'B' })
    mgr.openModal({ label: 'C' })
    expect(mgr.modalCount.value).toBe(3)
    const count = mgr.closeAllModals()
    expect(count).toBe(3)
    expect(mgr.modalCount.value).toBe(0)
    expect(mgr.activeModalId.value).toBeNull()
  })

  it('toggleMinimize twice returns the modal to a non-minimized state', () => {
    const id = mgr.openModal({ label: 'M' })
    expect(mgr.isModalMinimized(id)).toBe(false)

    mgr.toggleMinimize(id)
    expect(mgr.isModalMinimized(id)).toBe(true)
    // Minimizing the active modal deactivates it.
    expect(mgr.activeModalId.value).toBeNull()

    mgr.toggleMinimize(id)
    expect(mgr.isModalMinimized(id)).toBe(false)
    // Unminimizing reactivates the modal.
    expect(mgr.activeModalId.value).toBe(id)
  })

  it('setActiveModal updates the active id', () => {
    const a = mgr.openModal({ label: 'A' })
    const b = mgr.openModal({ label: 'B' })
    expect(mgr.activeModalId.value).toBe(b)
    mgr.setActiveModal(a)
    expect(mgr.isModalActive(a)).toBe(true)
    expect(mgr.isModalActive(b)).toBe(false)
  })
})
