import { defineComponent, h } from 'vue'
import { vi } from 'vitest'

// Registry of icon names known to the stubbed Iconify runtime. TIcon relies on
// `iconLoaded` to decide between the real icon and the `ticon:missing`
// fallback. `ticon-set` registers the curated set via addIcon and the optional
// `icons` entry registers the whole system-uicons set via addCollection — so
// the stub must model both addIcon and addCollection.
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
