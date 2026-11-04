import { describe, it, expect, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'

const mockDispatch = vi.fn()
const mockXml = vi.fn(() => [])

vi.mock('@codemirror/view', () => ({
  EditorView: class {
    static lineWrapping = []
    static updateListener = { of: (fn: unknown) => fn }
    static theme = () => []
    static scrollIntoView = (pos: number, opts: unknown) => ({ scrollTo: pos, opts })
    state = { doc: { length: 42, toString: () => '' } }
    dispatch = mockDispatch
    destroy = vi.fn()
  },
}))

vi.mock('@codemirror/state', () => ({
  EditorState: {
    readOnly: { of: (v: unknown) => v },
    create: vi.fn(() => ({})),
  },
  Compartment: class {
    of(ext: unknown) { return ext }
    reconfigure(ext: unknown) { return ext }
  },
}))

vi.mock('codemirror', () => ({ basicSetup: [] }))
vi.mock('@codemirror/theme-one-dark', () => ({ oneDark: [] }))
vi.mock('@codemirror/lang-xml', () => ({ xml: mockXml }))

import TCodeEditor from '../components/TCodeEditor.vue'

describe('TCodeEditor', () => {
  it('loads the xml language', async () => {
    const wrapper = mount(TCodeEditor, { props: { modelValue: '<a/>', language: 'xml' } })
    await flushPromises()
    expect(mockXml).toHaveBeenCalled()
    wrapper.unmount()
  })

  it('height="fill" fills the parent instead of a fixed height', () => {
    const wrapper = mount(TCodeEditor, { props: { modelValue: '', height: 'fill' } })
    expect(wrapper.classes()).toContain('code-editor--fill')
    expect((wrapper.find('.codemirror-container').element as HTMLElement).style.height).toBe('')
    wrapper.unmount()
  })

  it('exposes view and scrollToEnd scrolls to the document end', async () => {
    const wrapper = mount(TCodeEditor, { props: { modelValue: 'x' } })
    await flushPromises()
    expect(wrapper.vm.view).toBeTruthy()
    mockDispatch.mockClear()
    await wrapper.vm.scrollToEnd()
    expect(mockDispatch).toHaveBeenCalledWith({ effects: { scrollTo: 42, opts: { y: 'end' } } })
    wrapper.unmount()
  })
})
