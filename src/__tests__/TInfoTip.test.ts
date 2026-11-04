import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/vue'
import TInfoTip from '../components/TInfoTip.vue'

describe('TInfoTip', () => {
  it('is focusable and has an accessible name', () => {
    const { getByRole } = render(TInfoTip, { props: { text: 'Free port by default' } })
    const tip = getByRole('img', { name: 'Free port by default' })
    expect(tip.getAttribute('tabindex')).toBe('0')
  })
})
