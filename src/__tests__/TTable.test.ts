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
    let sort = null
    const wrapper = mount(TTable, {
      props: {
        columns,
        rows,
        rowKey: 'id',
        sort,
        'onUpdate:sort': (value) => {
          sort = value
          wrapper.setProps({ sort })
        },
      },
    })
    const nameHeader = wrapper.findAll('thead th')[1]
    await nameHeader.trigger('click')
    await wrapper.vm.$nextTick()
    const emitted = wrapper.emitted('update:sort')
    expect(emitted).toBeTruthy()
    expect(emitted![0][0]).toEqual({ key: 'name', direction: 'asc' })

    await nameHeader.trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:sort')![1][0]).toEqual({ key: 'name', direction: 'desc' })

    await nameHeader.trigger('click')
    await wrapper.vm.$nextTick()
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

  it('shows no pager without pageSize', () => {
    const wrapper = mount(TTable, { props: { columns, rows, rowKey: 'id' } })
    expect(wrapper.find('.t-table__footer').exists()).toBe(false)
  })

  it('pager shows the range and the page, and moves the offset by pageSize', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', pageSize: 3, offset: 3, hasMore: true },
    })
    expect(wrapper.find('.t-table__range').text()).toBe('4–6')
    expect(wrapper.find('.t-table__page').text()).toBe('Page 2')
    const prev = wrapper.find('[data-action="previous"]')
    const next = wrapper.find('[data-action="next"]')
    expect(prev.attributes('aria-label')).toBe('Previous')
    expect(next.attributes('aria-label')).toBe('Next')
    await next.trigger('click')
    await prev.trigger('click')
    expect(wrapper.emitted('update:offset')).toEqual([[6], [0]])
  })

  it('pager disables Previous on the first page and Next without hasMore', () => {
    const wrapper = mount(TTable, { props: { columns, rows, rowKey: 'id', pageSize: 3 } })
    expect(wrapper.find('[data-action="previous"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-action="next"]').attributes('disabled')).toBeDefined()
  })

  it('pager with total: shows "of total" and disables Next on the last page', async () => {
    const wrapper = mount(TTable, { props: { columns, rows, rowKey: 'id', pageSize: 3, total: 7 } })
    expect(wrapper.find('.t-table__range').text()).toBe('1–3 of 7')
    expect(wrapper.find('[data-action="next"]').attributes('disabled')).toBeUndefined()
    await wrapper.setProps({ offset: 6, rows: rows.slice(0, 1) })
    expect(wrapper.find('.t-table__range').text()).toBe('7–7 of 7')
    expect(wrapper.find('[data-action="next"]').attributes('disabled')).toBeDefined()
  })

  it('pager is disabled while loading', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', pageSize: 3, offset: 3, hasMore: true, loading: true },
    })
    expect(wrapper.find('[data-action="previous"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('[data-action="next"]').attributes('disabled')).toBeDefined()
  })

  it('pager: range slot, custom labels', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', pageSize: 3, previousLabel: 'Назад', nextLabel: 'Далі', pageLabel: 'Сторінка' },
      slots: { range: '<template #range="{ from, to }">{{ from }}–{{ to }} · newest first</template>' },
    })
    expect(wrapper.find('.t-table__range').text()).toBe('1–3 · newest first')
    expect(wrapper.find('.t-table__page').text()).toBe('Сторінка 1')
    expect(wrapper.find('[data-action="previous"]').attributes('title')).toBe('Назад')
    expect(wrapper.find('[data-action="next"]').attributes('aria-label')).toBe('Далі')
  })

  it('adds is-sticky-header only with stickyHeader', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id' },
    })
    expect(wrapper.classes()).not.toContain('is-sticky-header')
    await wrapper.setProps({ stickyHeader: true })
    expect(wrapper.classes()).toContain('is-sticky-header')
  })

  it('expanded: a full-width details row under each expanded row', async () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', expanded: [2] },
      slots: { expanded: '<template #expanded="{ row }"><p class="details">{{ row.name }} details</p></template>' },
    })
    const trs = wrapper.findAll('tbody tr')
    expect(trs).toHaveLength(4)
    expect(trs[1].classes()).toContain('is-expanded')
    expect(trs[1].attributes('aria-expanded')).toBe('true')
    expect(trs[0].attributes('aria-expanded')).toBe('false')
    expect(trs[2].classes()).toContain('t-table__details-row')
    const cell = trs[2].find('td')
    expect(cell.attributes('colspan')).toBe('3')
    expect(cell.text()).toBe('Alan details')
    await wrapper.setProps({ expanded: [] })
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    expect(wrapper.find('.details').exists()).toBe(false)
  })

  it('expanded without the slot renders no details row', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', expanded: [1] },
    })
    expect(wrapper.findAll('tbody tr')).toHaveLength(3)
    expect(wrapper.find('tbody tr').attributes('aria-expanded')).toBeUndefined()
  })
  it('resizable: a grip per header only with resizable', async () => {
    const wrapper = mount(TTable, { props: { columns, rows, rowKey: 'id' } })
    expect(wrapper.find('.t-table__resizer').exists()).toBe(false)
    await wrapper.setProps({ resizable: true })
    const grips = wrapper.findAll('.t-table__resizer')
    expect(grips).toHaveLength(3)
    expect(grips[0].attributes('role')).toBe('separator')
    expect(grips[0].attributes('aria-label')).toBe('Resize column')
  })

  it('resizable: widths set the col widths and a fixed layout', () => {
    const wrapper = mount(TTable, {
      props: { columns, rows, rowKey: 'id', resizable: true, widths: { id: 80, name: 200, age: 90 } },
    })
    const cols = wrapper.findAll('col')
    expect(cols[1].attributes('style')).toContain('width: 200px')
    expect(wrapper.classes()).toContain('is-fixed-layout')
    expect(wrapper.find('table').attributes('style')).toContain('width: 370px')
  })

  it('resizable: arrow keys on the grip change the width and emit update:widths', async () => {
    const wrapper = mount(TTable, {
      props: {
        columns: columns.map((c) => ({ ...c, minWidth: 40 })),
        rows,
        rowKey: 'id',
        resizable: true,
        widths: { id: 80, name: 200, age: 90 },
      },
    })
    const grip = wrapper.findAll('.t-table__resizer')[1]
    await grip.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.emitted('update:widths')![0][0]).toEqual({ id: 80, name: 210, age: 90 })
    await grip.trigger('keydown', { key: 'ArrowLeft', shiftKey: true })
    expect(wrapper.emitted('update:widths')![1][0]).toEqual({ id: 80, name: 160, age: 90 })
  })

  it('resizable: dragging the grip resizes, keeps the minimum and does not sort', async () => {
    const wrapper = mount(TTable, {
      attachTo: document.body,
      props: {
        columns: columns.map((c) => ({ ...c, minWidth: 60 })),
        rows,
        rowKey: 'id',
        resizable: true,
        widths: { id: 80, name: 200, age: 90 },
      },
    })
    const grip = wrapper.findAll('.t-table__resizer')[0]
    await grip.trigger('pointerdown', { clientX: 100, button: 0 })
    expect(wrapper.find('thead th').classes()).toContain('is-resize-edge')
    expect(wrapper.find('tbody td').classes()).toContain('is-resize-edge')
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 150 }))
    await wrapper.vm.$nextTick()
    expect(wrapper.findAll('col')[0].attributes('style')).toContain('width: 130px')
    window.dispatchEvent(new MouseEvent('pointermove', { clientX: 0 }))
    window.dispatchEvent(new MouseEvent('pointerup', { clientX: 0 }))
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('update:widths')![0][0]).toEqual({ id: 60, name: 200, age: 90 })
    expect(wrapper.find('thead th').classes()).not.toContain('is-resize-edge')
    await grip.trigger('click')
    expect(wrapper.emitted('update:sort')).toBeUndefined()
    wrapper.unmount()
  })
})
