/**
 * Smoke tests for TTable.
 *
 * NOTE: vitest is added by task #02 (`tasks/02-smoke-tests.md`). This file is
 * intentionally `@ts-nocheck`'d so it does not break `npm run typecheck` on
 * branches where vitest is not yet installed. Once #02 lands, remove the
 * `@ts-nocheck` pragma on top.
 */
import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import TTable from '../components/TTable.vue'
import type { TTableColumn } from '../components/TTable.vue'

interface Row {
  id: number
  name: string
  age: number
}

const columns: TTableColumn<Row>[] = [
  { key: 'id', label: 'ID', sortable: true },
  { key: 'name', label: 'Name', sortable: true },
  { key: 'age', label: 'Age', sortable: true },
]

const rows: Row[] = [
  { id: 1, name: 'Ada', age: 36 },
  { id: 2, name: 'Alan', age: 41 },
  { id: 3, name: 'Grace', age: 85 },
]

describe('TTable', () => {
  it('renders one <tr> per row in tbody', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id' },
    })
    const bodyRows = wrapper.findAll('tbody tr')
    expect(bodyRows).toHaveLength(3)
  })

  it('emits update:sort when clicking a sortable header', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id' },
    })
    const nameHeader = wrapper.findAll('thead th')[1]
    await nameHeader.trigger('click')
    const emitted = wrapper.emitted('update:sort')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({ key: 'name', direction: 'asc' })

    await nameHeader.trigger('click')
    expect(wrapper.emitted('update:sort')![1][0]).toEqual({ key: 'name', direction: 'desc' })

    await nameHeader.trigger('click')
    expect(wrapper.emitted('update:sort')![2][0]).toEqual(null)
  })

  it('select-all emits update:selection with every rowKey', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', selectable: true },
    })
    const master = wrapper.find('thead input[type="checkbox"]')
    await master.setValue(true)
    const emitted = wrapper.emitted('update:selection')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual([1, 2, 3])
  })

  it('renders the empty slot when rows is empty and not loading', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows: [], rowKey: 'id' },
      slots: { empty: '<span class="empty-msg">Nothing here</span>' },
    })
    expect(wrapper.find('.empty-msg').exists()).toBe(true)
  })

  it('renders default empty text when no slot provided', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows: [], rowKey: 'id' },
    })
    expect(wrapper.text()).toContain('No data')
  })

  it('emits row-click with row and index', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id' },
    })
    await wrapper.findAll('tbody tr')[1].trigger('click')
    const emitted = wrapper.emitted('row-click')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual(rows[1])
    expect(emitted![0][1]).toBe(1)
  })
})
