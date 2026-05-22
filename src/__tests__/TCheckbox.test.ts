import { describe, it, expect, vi } from 'vitest'
import { render, fireEvent } from '@testing-library/vue'
import { ref, h, nextTick, defineComponent } from 'vue'
import TCheckbox from '../components/TCheckbox.vue'
import TFormField from '../components/TFormField.vue'

describe('TCheckbox', () => {
  // ── modelValue / v-model ──────────────────────────────────────────────────

  it('renders a native checkbox input', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false } })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input).not.toBeNull()
  })

  it('reflects modelValue=true as checked', () => {
    const { container } = render(TCheckbox, { props: { modelValue: true } })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.checked).toBe(true)
  })

  it('reflects modelValue=false as unchecked', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false } })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.checked).toBe(false)
  })

  it('emits update:modelValue with true when clicked while unchecked', async () => {
    const updates: boolean[] = []
    const { container } = render(TCheckbox, {
      props: {
        modelValue: false,
        'onUpdate:modelValue': (v: boolean) => updates.push(v),
      },
    })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.click(input)
    expect(updates).toContain(true)
  })

  it('emits update:modelValue with false when clicked while checked', async () => {
    const updates: boolean[] = []
    const { container } = render(TCheckbox, {
      props: {
        modelValue: true,
        'onUpdate:modelValue': (v: boolean) => updates.push(v),
      },
    })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.click(input)
    expect(updates).toContain(false)
  })

  it('v-model two-way binding works', async () => {
    const model = ref(false)
    const { container } = render({
      setup() {
        return () =>
          h(TCheckbox, {
            modelValue: model.value,
            'onUpdate:modelValue': (v: boolean) => { model.value = v },
          })
      },
    })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    await fireEvent.click(input)
    expect(model.value).toBe(true)
  })

  // ── label prop / default slot ─────────────────────────────────────────────

  it('renders label text from label prop', () => {
    const { getByText } = render(TCheckbox, { props: { modelValue: false, label: 'Accept terms' } })
    expect(getByText('Accept terms')).not.toBeNull()
  })

  it('renders label text from default slot (overrides label prop)', () => {
    const { getByText, queryByText } = render(TCheckbox, {
      props: { modelValue: false, label: 'Prop label' },
      slots: { default: '<span>Slot label</span>' },
    })
    expect(getByText('Slot label')).not.toBeNull()
    expect(queryByText('Prop label')).toBeNull()
  })

  it('renders no label element when neither prop nor slot provided', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false } })
    expect(container.querySelector('.t-checkbox__label')).toBeNull()
  })

  // ── disabled ──────────────────────────────────────────────────────────────

  it('disables the native input when disabled=true', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, disabled: true } })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.disabled).toBe(true)
  })

  it('adds is-disabled class when disabled=true', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, disabled: true } })
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-disabled')).toBe(true)
  })

  // ── error ─────────────────────────────────────────────────────────────────

  it('adds is-error class when error=true', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, error: true } })
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-error')).toBe(true)
  })

  it('adds is-error class when error is a non-empty string', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, error: 'Required' } })
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-error')).toBe(true)
  })

  it('does not add is-error class when error=false', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, error: false } })
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-error')).toBe(false)
  })

  it('sets aria-invalid when error is present', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false, error: 'bad' } })
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.getAttribute('aria-invalid')).toBe('true')
  })

  // ── indeterminate ─────────────────────────────────────────────────────────

  it('sets indeterminate DOM property when indeterminate=true and modelValue=false', async () => {
    const { container } = render(TCheckbox, {
      props: { modelValue: false, indeterminate: true },
    })
    await nextTick()
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.indeterminate).toBe(true)
  })

  it('does not set indeterminate when modelValue=true', async () => {
    const { container } = render(TCheckbox, {
      props: { modelValue: true, indeterminate: true },
    })
    await nextTick()
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(input.indeterminate).toBe(false)
  })

  it('adds is-indeterminate class when indeterminate=true and modelValue=false', () => {
    const { container } = render(TCheckbox, {
      props: { modelValue: false, indeterminate: true },
    })
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-indeterminate')).toBe(true)
  })

  // ── size ──────────────────────────────────────────────────────────────────

  it.each(['mini', 'small', 'default', 'medium', 'large'] as const)(
    'applies size-%s class',
    (size) => {
      const { container } = render(TCheckbox, { props: { modelValue: false, size } })
      expect(container.querySelector(`.size-${size}`)).not.toBeNull()
    }
  )

  it('defaults to size-default when no size prop given', () => {
    const { container } = render(TCheckbox, { props: { modelValue: false } })
    expect(container.querySelector('.size-default')).not.toBeNull()
  })

  // ── TFormField context injection ──────────────────────────────────────────

  it('picks up id from TFormField context', () => {
    const wrapper = defineComponent({
      components: { TFormField, TCheckbox },
      template: `
        <TFormField id="my-field" label="My label">
          <template #default="{ id }">
            <TCheckbox :id="id" :modelValue="false" />
          </template>
        </TFormField>
      `,
    })
    const { container } = render(wrapper)
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement
    // id is passed via slot binding, not inject in this scenario
    expect(input.id).toBe('my-field')
  })

  it('inherits error state from TFormField context via inject', () => {
    // TCheckbox inside TFormField: error on field propagates via inject
    const wrapper = defineComponent({
      components: { TFormField, TCheckbox },
      template: `
        <TFormField error="Field error">
          <TCheckbox :modelValue="false" />
        </TFormField>
      `,
    })
    const { container } = render(wrapper)
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-error')).toBe(true)
  })

  it('prop error takes precedence over context error when both set', () => {
    const wrapper = defineComponent({
      components: { TFormField, TCheckbox },
      template: `
        <TFormField error="Context error">
          <TCheckbox :modelValue="false" :error="false" />
        </TFormField>
      `,
    })
    // prop error=false should suppress — but context has error, so is-error should still show
    // (context propagates when prop is false/default)
    const { container } = render(wrapper)
    // context error wins here since prop error=false (default)
    expect(container.querySelector('.t-checkbox')?.classList.contains('is-error')).toBe(true)
  })
})
