import { describe, it, expect } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import TFileTree from '../components/TFileTree.vue'
import TPathCrumbs from '../components/TPathCrumbs.vue'
import { buildPathTree, splitMiddle } from '../components/path-tree'

const paths = ['logs/2026/09/Common.log', 'logs/2026/09/Error.log', 'src/a.ts', 'README.md']

describe('path-tree', () => {
  it('builds a tree: folders first, single-folder chains merged', () => {
    const [logs, src, readme] = buildPathTree(paths)
    expect(logs).toMatchObject({ key: 'logs/2026/09', label: 'logs/2026/09' })
    expect(logs!.children!.map((n) => n.key)).toEqual(['logs/2026/09/Common.log', 'logs/2026/09/Error.log'])
    expect(src).toMatchObject({ key: 'src', children: [{ key: 'src/a.ts', label: 'a.ts' }] })
    expect(readme).toEqual({ key: 'README.md', label: 'README.md' })
  })

  it('splitMiddle keeps short labels and splits long ones', () => {
    expect(splitMiddle('Common.log')).toBeNull()
    expect(splitMiddle('very-long-file-name-2026-09-26.log')).toEqual(['very-long-file-name-2', '026-09-26.log'])
    expect(splitMiddle('Application/Instances/Production/09')).toEqual(['Application/Instances/Production/', '09'])
  })
})

describe('TPathCrumbs', () => {
  it('shows folders and the bold file name', () => {
    const { container, getByText } = render(TPathCrumbs, { props: { path: 'logs/09/Common.log' }, slots: { default: '2 KB' } })
    expect(container.querySelector('b')!.textContent).toBe('Common.log')
    expect(getByText('logs')).toBeTruthy()
    expect(container.textContent).toContain('2 KB')
  })
})

describe('TFileTree', () => {
  it('selecting a file emits its path', async () => {
    const { getByText, emitted } = render(TFileTree, { props: { paths } })
    await fireEvent.click(getByText('Error.log'))
    expect(emitted()['update:modelValue']).toEqual([['logs/2026/09/Error.log']])
  })

  it('collapses into a rail with folder buttons', async () => {
    const { getByRole, emitted, rerender, queryByRole } = render(TFileTree, { props: { paths, modelValue: 'src/a.ts' } })
    await fireEvent.click(getByRole('button', { name: 'Collapse tree' }))
    expect(emitted()['update:collapsed']).toEqual([[true]])
    await rerender({ collapsed: true })
    expect(queryByRole('tree')).toBeNull()
    expect(getByRole('button', { name: 'Show tree' })).toBeTruthy()
    expect(getByRole('button', { name: 'src' }).classList).toContain('is-path')
    expect(getByRole('button', { name: 'Files in root' })).toBeTruthy()
  })
})
