import { describe, it, expect, vi } from 'vitest'
import { reactive, ref } from 'vue'
import {
  useFormValidation,
  type FormValidationRules,
} from '../composables/useFormValidation'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeModel() {
  return reactive({
    name: '',
    email: '',
    age: '',
    code: '',
  })
}

// ---------------------------------------------------------------------------
// required
// ---------------------------------------------------------------------------

describe('required rule', () => {
  it('fails when value is empty string', async () => {
    const model = reactive({ name: '' })
    const { validate, errors } = useFormValidation(model, {
      name: { required: true, message: 'Name is required' },
    })
    const ok = await validate()
    expect(ok).toBe(false)
    expect(errors.name).toBe('Name is required')
  })

  it('passes when value is non-empty', async () => {
    const model = reactive({ name: 'Alice' })
    const { validate, errors } = useFormValidation(model, {
      name: { required: true },
    })
    const ok = await validate()
    expect(ok).toBe(true)
    expect(errors.name).toBe('')
  })

  it('uses default message when none supplied', async () => {
    const model = reactive({ name: '' })
    const { validate, errors } = useFormValidation(model, {
      name: { required: true },
    })
    await validate()
    expect(errors.name).toMatch(/required/i)
  })

  it('treats null as empty', async () => {
    const model = reactive({ val: null as string | null })
    const { validate, errors } = useFormValidation(model, {
      val: { required: true },
    })
    await validate()
    expect(errors.val).not.toBe('')
  })

  it('treats false boolean as empty', async () => {
    const model = reactive({ enabled: false })
    const { validate, errors } = useFormValidation(model, {
      enabled: { required: true },
    })
    await validate()
    expect(errors.enabled).not.toBe('')
  })
})

// ---------------------------------------------------------------------------
// min / max
// ---------------------------------------------------------------------------

describe('min / max length', () => {
  it('fails when string is shorter than min', async () => {
    const model = reactive({ code: 'ab' })
    const { validate, errors } = useFormValidation(model, {
      code: { min: 5, message: 'Too short' },
    })
    await validate()
    expect(errors.code).toBe('Too short')
  })

  it('passes when string length equals min', async () => {
    const model = reactive({ code: 'abcde' })
    const { validate, errors } = useFormValidation(model, {
      code: { min: 5 },
    })
    const ok = await validate()
    expect(ok).toBe(true)
  })

  it('fails when string exceeds max', async () => {
    const model = reactive({ code: 'abcdef' })
    const { validate, errors } = useFormValidation(model, {
      code: { max: 3, message: 'Too long' },
    })
    await validate()
    expect(errors.code).toBe('Too long')
  })

  it('skips min/max when value is empty (no required)', async () => {
    const model = reactive({ code: '' })
    const { validate, errors } = useFormValidation(model, {
      code: { min: 5 },
    })
    const ok = await validate()
    expect(ok).toBe(true)
    expect(errors.code).toBe('')
  })
})

// ---------------------------------------------------------------------------
// pattern
// ---------------------------------------------------------------------------

describe('pattern rule', () => {
  it('fails when value does not match pattern', async () => {
    const model = reactive({ email: 'notanemail' })
    const { validate, errors } = useFormValidation(model, {
      email: { pattern: /^[^@]+@[^@]+$/, message: 'Invalid email' },
    })
    await validate()
    expect(errors.email).toBe('Invalid email')
  })

  it('passes when value matches pattern', async () => {
    const model = reactive({ email: 'a@b.com' })
    const { validate, errors } = useFormValidation(model, {
      email: { pattern: /^[^@]+@[^@]+$/ },
    })
    const ok = await validate()
    expect(ok).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// custom validator (sync)
// ---------------------------------------------------------------------------

describe('sync validator', () => {
  it('fails when validator returns false', async () => {
    const model = reactive({ name: 'badvalue' })
    const { validate, errors } = useFormValidation(model, {
      name: {
        validator: () => false,
        message: 'Invalid name',
      },
    })
    await validate()
    expect(errors.name).toBe('Invalid name')
  })

  it('fails with string message from validator', async () => {
    const model = reactive({ name: 'foo' })
    const { validate, errors } = useFormValidation(model, {
      name: {
        validator: () => 'Custom error from validator',
      },
    })
    await validate()
    expect(errors.name).toBe('Custom error from validator')
  })

  it('passes when validator returns true', async () => {
    const model = reactive({ name: 'good' })
    const { validate, errors } = useFormValidation(model, {
      name: { validator: () => true },
    })
    const ok = await validate()
    expect(ok).toBe(true)
    expect(errors.name).toBe('')
  })

  it('validator receives the current model value and model', async () => {
    const model = reactive({ name: 'test' })
    const fn = vi.fn(() => true)
    const { validate } = useFormValidation(model, {
      name: { validator: fn },
    })
    await validate()
    expect(fn).toHaveBeenCalledWith('test', model)
  })
})

// ---------------------------------------------------------------------------
// async validator
// ---------------------------------------------------------------------------

describe('async validator', () => {
  it('fails when async validator resolves to false', async () => {
    const model = reactive({ code: 'taken' })
    const { validate, errors } = useFormValidation(model, {
      code: {
        asyncValidator: async () => false,
        message: 'Code is taken',
      },
    })
    await validate()
    expect(errors.code).toBe('Code is taken')
  })

  it('fails with string returned by async validator', async () => {
    const model = reactive({ code: 'taken' })
    const { validate, errors } = useFormValidation(model, {
      code: {
        asyncValidator: async () => 'That code is already in use',
      },
    })
    await validate()
    expect(errors.code).toBe('That code is already in use')
  })

  it('passes when async validator resolves to true', async () => {
    const model = reactive({ code: 'free' })
    const { validate, errors } = useFormValidation(model, {
      code: {
        asyncValidator: async () => true,
      },
    })
    const ok = await validate()
    expect(ok).toBe(true)
    expect(errors.code).toBe('')
  })
})

// ---------------------------------------------------------------------------
// multiple rules per field
// ---------------------------------------------------------------------------

describe('multiple rules per field', () => {
  it('stops at the first failing rule', async () => {
    const model = reactive({ email: '' })
    const { validate, errors } = useFormValidation(model, {
      email: [
        { required: true, message: 'Required' },
        { pattern: /^[^@]+@[^@]+$/, message: 'Invalid email' },
      ],
    })
    await validate()
    expect(errors.email).toBe('Required')
  })

  it('reaches the second rule when first passes', async () => {
    const model = reactive({ email: 'notvalid' })
    const { validate, errors } = useFormValidation(model, {
      email: [
        { required: true, message: 'Required' },
        { pattern: /^[^@]+@[^@]+$/, message: 'Invalid email' },
      ],
    })
    await validate()
    expect(errors.email).toBe('Invalid email')
  })

  it('all clear when all rules pass', async () => {
    const model = reactive({ email: 'a@b.com' })
    const { validate, errors } = useFormValidation(model, {
      email: [
        { required: true },
        { pattern: /^[^@]+@[^@]+$/ },
      ],
    })
    const ok = await validate()
    expect(ok).toBe(true)
    expect(errors.email).toBe('')
  })
})

// ---------------------------------------------------------------------------
// validateField
// ---------------------------------------------------------------------------

describe('validateField', () => {
  it('validates only the requested field', async () => {
    const model = reactive({ name: '', email: '' })
    const { validateField, errors } = useFormValidation(model, {
      name: { required: true },
      email: { required: true },
    })
    await validateField('name')
    expect(errors.name).not.toBe('')
    // email was NOT validated — should still be empty
    expect(errors.email).toBe('')
  })

  it('returns true when field is valid', async () => {
    const model = reactive({ name: 'Alice' })
    const { validateField } = useFormValidation(model, {
      name: { required: true },
    })
    const ok = await validateField('name')
    expect(ok).toBe(true)
  })

  it('returns false when field is invalid', async () => {
    const model = reactive({ name: '' })
    const { validateField } = useFormValidation(model, {
      name: { required: true },
    })
    const ok = await validateField('name')
    expect(ok).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// clearErrors / clearFieldError
// ---------------------------------------------------------------------------

describe('clearErrors', () => {
  it('clears all errors after validate()', async () => {
    const model = reactive({ name: '', email: '' })
    const { validate, clearErrors, errors } = useFormValidation(model, {
      name: { required: true },
      email: { required: true },
    })
    await validate()
    expect(errors.name).not.toBe('')
    clearErrors()
    expect(errors.name).toBe('')
    expect(errors.email).toBe('')
  })

  it('clearFieldError clears only the specified field', async () => {
    const model = reactive({ name: '', email: '' })
    const { validate, clearFieldError, errors } = useFormValidation(model, {
      name: { required: true },
      email: { required: true },
    })
    await validate()
    clearFieldError('name')
    expect(errors.name).toBe('')
    expect(errors.email).not.toBe('')
  })
})

// ---------------------------------------------------------------------------
// trigger: 'blur' and 'change'
// ---------------------------------------------------------------------------

describe('trigger handling', () => {
  it('handleBlur only runs blur-triggered rules', async () => {
    const model = reactive({ name: '' })
    const rules: FormValidationRules<typeof model> = {
      name: [
        { required: true, trigger: 'blur', message: 'Blur required' },
        { min: 5, trigger: 'change', message: 'Change min' },
      ],
    }
    const { handleBlur, errors } = useFormValidation(model, rules)
    await handleBlur('name')
    // blur rule fires
    expect(errors.name).toBe('Blur required')
  })

  it('handleChange only runs change-triggered rules', async () => {
    const model = reactive({ name: 'ab' })
    const rules: FormValidationRules<typeof model> = {
      name: [
        { required: true, trigger: 'blur', message: 'Blur required' },
        { min: 5, trigger: 'change', message: 'Change min' },
      ],
    }
    const { handleChange, errors } = useFormValidation(model, rules)
    await handleChange('name')
    expect(errors.name).toBe('Change min')
  })

  it('validate() runs all rules regardless of trigger', async () => {
    const model = reactive({ name: '' })
    const rules: FormValidationRules<typeof model> = {
      name: [
        { required: true, trigger: 'blur', message: 'Blur required' },
      ],
    }
    const { validate, errors } = useFormValidation(model, rules)
    await validate()
    expect(errors.name).toBe('Blur required')
  })
})

// ---------------------------------------------------------------------------
// reactive model & rules (ref-based)
// ---------------------------------------------------------------------------

describe('ref model and rules', () => {
  it('picks up updated model value', async () => {
    const model = reactive({ name: '' })
    const { validate, errors } = useFormValidation(model, {
      name: { required: true },
    })
    await validate()
    expect(errors.name).not.toBe('')

    model.name = 'Alice'
    await validate()
    expect(errors.name).toBe('')
  })

  it('accepts rules as a Ref', async () => {
    const model = reactive({ name: 'x' })
    const rulesRef = ref<FormValidationRules<typeof model>>({
      name: { min: 10, message: 'Too short' },
    })
    const { validate, errors } = useFormValidation(model, rulesRef)
    await validate()
    expect(errors.name).toBe('Too short')
  })
})

// ---------------------------------------------------------------------------
// validate() returns true only when ALL fields pass
// ---------------------------------------------------------------------------

describe('validate() aggregate result', () => {
  it('returns false when any field fails', async () => {
    const model = makeModel()
    const { validate } = useFormValidation(model, {
      name: { required: true },
      email: { required: true },
    })
    expect(await validate()).toBe(false)
  })

  it('returns true when all fields pass', async () => {
    const model = reactive({ name: 'Alice', email: 'a@b.com' })
    const { validate } = useFormValidation(model, {
      name: { required: true },
      email: { pattern: /^[^@]+@[^@]+$/ },
    })
    expect(await validate()).toBe(true)
  })
})
