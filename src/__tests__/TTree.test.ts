import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TTree from '../components/TTree.vue'

interface FileNode {
  id: string
  name: string
  children?: FileNode[]
}

const data: FileNode[] = [
  {
    id: 'root',
    name: 'root',
    children: [
      {
        id: 'src',
        name: 'src',
        children: [
          { id: 'index.ts', name: 'index.ts' },
          { id: 'main.ts',  name: 'main.ts' },
        ],
      },
      { id: 'readme', name: 'README.md' },
    ],
  },
]

describe('TTree', () => {
  it('renders only root nodes initially (collapsed)', () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id' },
    })
    // Only the root node should be visible since nothing is expanded
    const nodes = wrapper.findAll('.t-tree__node')
    expect(nodes).toHaveLength(1)
    expect(nodes[0].text()).toContain('root')
  })

  it('expands root node from defaultExpandedKeys', () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: ['root'] },
    })
    // root + src + readme should be visible (src is not expanded, so its children are hidden)
    const nodes = wrapper.findAll('.t-tree__node')
    expect(nodes).toHaveLength(3)
  })

  it('expands nested nodes from defaultExpandedKeys', () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: ['root', 'src'] },
    })
    // root + src + index.ts + main.ts + readme
    const nodes = wrapper.findAll('.t-tree__node')
    expect(nodes).toHaveLength(5)
  })

  it('toggles expansion when clicking the toggle button', async () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: [] },
    })
    expect(wrapper.findAll('.t-tree__node')).toHaveLength(1)

    const toggle = wrapper.find('.t-tree__toggle')
    await toggle.trigger('click')

    expect(wrapper.findAll('.t-tree__node')).toHaveLength(3)
  })

  it('collapses an expanded node when toggle is clicked again', async () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: ['root'] },
    })
    expect(wrapper.findAll('.t-tree__node')).toHaveLength(3)

    const toggle = wrapper.find('.t-tree__toggle')
    await toggle.trigger('click')

    expect(wrapper.findAll('.t-tree__node')).toHaveLength(1)
  })

  it('emits update:expandedKeys when toggling', async () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: [] },
    })
    await wrapper.find('.t-tree__toggle').trigger('click')
    const emitted = wrapper.emitted('update:expandedKeys')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toContain('root')
  })

  it('emits node-click when a node row is clicked', async () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: [] },
    })
    await wrapper.find('.t-tree__node').trigger('click')
    const emitted = wrapper.emitted('node-click')
    expect(emitted).toBeTruthy()
    expect((emitted![0][0] as FileNode).id).toBe('root')
  })

  it('supports controlled expandedKeys (v-model)', async () => {
    let keys: (string | number)[] = []
    const wrapper = mount(TTree, {
      props: {
        data,
        nodeKey: 'id',
        expandedKeys: keys,
        'onUpdate:expandedKeys': (newKeys: (string | number)[]) => {
          keys = newKeys
          wrapper.setProps({ expandedKeys: newKeys })
        },
      },
    })
    expect(wrapper.findAll('.t-tree__node')).toHaveLength(1)

    await wrapper.find('.t-tree__toggle').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('.t-tree__node')).toHaveLength(3)
  })

  it('uses custom childrenKey', () => {
    interface ItemNode { key: string; label: string; items?: ItemNode[] }
    const itemData: ItemNode[] = [
      {
        key: 'a',
        label: 'A',
        items: [
          { key: 'b', label: 'B' },
        ],
      },
    ]
    const wrapper = mount(TTree, {
      props: {
        data: itemData as unknown as Record<string, unknown>[],
        nodeKey: 'key',
        childrenKey: 'items',
        defaultExpandedKeys: ['a'],
      },
    })
    const nodes = wrapper.findAll('.t-tree__node')
    expect(nodes).toHaveLength(2)
  })

  it('renders the node scoped slot', () => {
    const wrapper = mount(TTree, {
      props: { data, nodeKey: 'id', defaultExpandedKeys: [] },
      slots: {
        node: `<template #node="{ data }"><span class="custom-label">{{ data.name }}</span></template>`,
      },
    })
    expect(wrapper.find('.custom-label').text()).toBe('root')
  })

  it('leaf nodes have no toggle button', () => {
    const leafData: FileNode[] = [{ id: 'leaf', name: 'leaf.ts' }]
    const wrapper = mount(TTree, {
      props: { data: leafData, nodeKey: 'id' },
    })
    expect(wrapper.find('.t-tree__toggle').exists()).toBe(false)
    expect(wrapper.find('.t-tree__toggle-placeholder').exists()).toBe(true)
  })
})
