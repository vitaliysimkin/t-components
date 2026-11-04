import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import { h, nextTick } from 'vue'
import TDropdown from '../components/TDropdown.vue'

const renderOpen = async (card?: boolean) => {
  const { getByText } = render(TDropdown, {
    props: { card },
    slots: {
      trigger: ({ triggerProps }: { triggerProps: Record<string, unknown> }) => h('button', triggerProps, 'Open'),
      default: () => 'Panel',
    },
  })
  getByText('Open').click()
  await nextTick()
  return document.body.querySelector('.t-dropdown-panel') as HTMLElement
}

describe('TDropdown', () => {
  it('card: panel gets the card look', async () => {
    expect((await renderOpen(true)).classList.contains('is-card')).toBe(true)
  })

  it('without card the panel stays plain', async () => {
    expect((await renderOpen()).classList.contains('is-card')).toBe(false)
  })
})
