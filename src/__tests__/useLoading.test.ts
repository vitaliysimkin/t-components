import { describe, it, expect, beforeEach } from 'vitest'
import { useLoading } from '../composables/useLoading'

// useLoading() returns a closure over shared module-level state.
// Reset between tests via closeAll().
describe('useLoading', () => {
  let loading: ReturnType<typeof useLoading>

  beforeEach(() => {
    loading = useLoading()
    loading.closeAll()
  })

  it('starts with no active instances', () => {
    expect(loading.instances.value).toHaveLength(0)
  })

  it('show() adds an instance and returns a handle', () => {
    const handle = loading.show({ text: 'Please wait', fullscreen: true })
    expect(loading.instances.value).toHaveLength(1)
    expect(loading.instances.value[0].text).toBe('Please wait')
    expect(loading.instances.value[0].fullscreen).toBe(true)
    handle.close()
  })

  it('handle.close() removes exactly the matching instance', () => {
    const h1 = loading.show({ text: 'A' })
    const h2 = loading.show({ text: 'B' })
    expect(loading.instances.value).toHaveLength(2)

    h1.close()
    expect(loading.instances.value).toHaveLength(1)
    expect(loading.instances.value[0].text).toBe('B')

    h2.close()
    expect(loading.instances.value).toHaveLength(0)
  })

  it('multiple show() calls each produce a unique id', () => {
    const h1 = loading.show()
    const h2 = loading.show()
    const ids = loading.instances.value.map(i => i.id)
    expect(new Set(ids).size).toBe(2)
    h1.close()
    h2.close()
  })

  it('closeAll() clears all active instances', () => {
    loading.show()
    loading.show()
    loading.show()
    expect(loading.instances.value).toHaveLength(3)
    loading.closeAll()
    expect(loading.instances.value).toHaveLength(0)
  })

  it('default options: text empty, fullscreen false, target null, lock false', () => {
    const handle = loading.show()
    const inst = loading.instances.value[0]
    expect(inst.text).toBe('')
    expect(inst.fullscreen).toBe(false)
    expect(inst.target).toBeNull()
    expect(inst.lock).toBe(false)
    handle.close()
  })

  it('respects all provided options', () => {
    const el = document.createElement('div')
    const handle = loading.show({ text: 'Loading...', fullscreen: false, target: el, lock: true })
    const inst = loading.instances.value[0]
    expect(inst.text).toBe('Loading...')
    expect(inst.fullscreen).toBe(false)
    expect(inst.target).toBe(el)
    expect(inst.lock).toBe(true)
    handle.close()
  })

  it('calling close() on an already-closed handle is safe (no-op)', () => {
    const handle = loading.show()
    handle.close()
    expect(loading.instances.value).toHaveLength(0)
    // Should not throw
    expect(() => handle.close()).not.toThrow()
    expect(loading.instances.value).toHaveLength(0)
  })

  it('instances is readonly — direct mutation is silently blocked (Vue readonly warns, does not throw)', () => {
    loading.show()
    const before = loading.instances.value.length
    // @ts-expect-error — intentionally writing to readonly ref
    loading.instances.value = []
    // Vue readonly wrapper silently drops the write (warns in dev, no throw)
    expect(loading.instances.value.length).toBe(before)
    loading.closeAll()
  })
})
