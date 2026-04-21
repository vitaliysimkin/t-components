import { defineComponent, h } from 'vue'
import { vi } from 'vitest'

vi.mock('@iconify/vue', () => ({
  Icon: defineComponent({
    name: 'IconifyTestStub',
    props: {
      icon: {
        type: String,
        default: '',
      },
    },
    setup(props, { attrs }) {
      return () =>
        h('span', {
          ...attrs,
          'data-icon': props.icon,
          'aria-hidden': 'true',
        })
    },
  }),
}))
