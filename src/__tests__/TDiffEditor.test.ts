import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'

// ---------------------------------------------------------------------------
// Minimal stubs for CodeMirror and @codemirror/merge so the test suite
// does not pull in the full CodeMirror bundle (which requires a real browser
// layout engine). We only verify the component's Vue contract (props, emits,
// lifecycle), not the CodeMirror internals.
// ---------------------------------------------------------------------------

const mockDispatch = vi.fn()
const mockDestroy = vi.fn()

const mockEditorA = {
  state: { doc: { toString: () => '' } },
  dispatch: mockDispatch,
}
const mockEditorB = {
  state: { doc: { toString: () => '' } },
  dispatch: mockDispatch,
}

vi.mock('@codemirror/merge', () => ({
  MergeView: class {
    a = mockEditorA
    b = mockEditorB
    destroy = mockDestroy
    constructor(_config: unknown) {
      // record construction so tests can detect it
    }
  },
}))

vi.mock('@codemirror/view', () => ({
  EditorView: class {
    static lineWrapping = []
    static updateListener = { of: (fn: unknown) => fn }
    static theme = () => []
    dispatch = mockDispatch
  },
}))

vi.mock('@codemirror/state', () => ({
  EditorState: {
    readOnly: { of: (v: unknown) => v },
    create: vi.fn(() => ({ doc: { toString: () => '' } })),
  },
  Compartment: class {
    of(ext: unknown) { return ext }
    reconfigure(ext: unknown) { return ext }
  },
}))

vi.mock('codemirror', () => ({
  basicSetup: [],
}))

vi.mock('@codemirror/theme-one-dark', () => ({
  oneDark: [],
}))

// ---------------------------------------------------------------------------

import TDiffEditor from '../components/TDiffEditor.vue'

describe('TDiffEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset mock editor doc values
    mockEditorA.state.doc.toString = () => ''
    mockEditorB.state.doc.toString = () => ''
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('renders a container div', () => {
    const wrapper = mount(TDiffEditor, {
      props: { modelValue: '', original: '' },
    })
    expect(wrapper.find('.diff-editor').exists()).toBe(true)
    wrapper.unmount()
  })

  it('applies height style from prop', () => {
    const wrapper = mount(TDiffEditor, {
      props: { modelValue: '', original: '', height: '400px' },
    })
    const el = wrapper.find('.diff-editor').element as HTMLElement
    expect(el.style.height).toBe('400px')
    wrapper.unmount()
  })

  it('applies maxHeight style from prop', () => {
    const wrapper = mount(TDiffEditor, {
      props: { modelValue: '', original: '', maxHeight: '600px' },
    })
    const el = wrapper.find('.diff-editor').element as HTMLElement
    expect(el.style.maxHeight).toBe('600px')
    wrapper.unmount()
  })

  it('defaults to height auto when height prop is absent', () => {
    const wrapper = mount(TDiffEditor, {
      props: { modelValue: '', original: '' },
    })
    const el = wrapper.find('.diff-editor').element as HTMLElement
    expect(el.style.height).toBe('auto')
    wrapper.unmount()
  })

  it('calls MergeView.destroy on unmount', async () => {
    const wrapper = mount(TDiffEditor, {
      props: { modelValue: 'hello', original: 'world' },
      attachTo: document.body,
    })
    // Flush all microtasks and async import chains
    await nextTick()
    await nextTick()
    await new Promise((r) => setTimeout(r, 10))
    wrapper.unmount()
    expect(mockDestroy).toHaveBeenCalled()
  })

  it('accepts customLanguageExtension prop without error', () => {
    const fakeExt = [] as unknown as import('@codemirror/state').Extension
    expect(() => {
      const wrapper = mount(TDiffEditor, {
        props: { modelValue: '', original: '', customLanguageExtension: fakeExt },
      })
      wrapper.unmount()
    }).not.toThrow()
  })

  it('accepts readonly prop without error', () => {
    expect(() => {
      const wrapper = mount(TDiffEditor, {
        props: { modelValue: '', original: '', readonly: true },
      })
      wrapper.unmount()
    }).not.toThrow()
  })

  it('accepts lineWrapping prop without error', () => {
    expect(() => {
      const wrapper = mount(TDiffEditor, {
        props: { modelValue: '', original: '', lineWrapping: true },
      })
      wrapper.unmount()
    }).not.toThrow()
  })
})
