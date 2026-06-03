import { defineComponent, h } from 'vue'
import { vi } from 'vitest'

// Registry of icon names known to the stubbed Iconify runtime. TIcon relies on
// `iconLoaded` to decide between the real icon and the `local:missing`
// fallback, and `offline-icons` registers the whole system-uicons set plus the
// fallback via addCollection/addIcon — so the stub must model all three.
const registered = new Set<string>()

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
  iconLoaded: (name: string) => registered.has(name),
  addIcon: (name: string) => {
    registered.add(name)
  },
  addCollection: (collection: { prefix: string; icons: Record<string, unknown> }) => {
    for (const name of Object.keys(collection.icons ?? {})) {
      registered.add(`${collection.prefix}:${name}`)
    }
  },
}))
