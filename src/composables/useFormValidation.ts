import { reactive, type Ref, type MaybeRefOrGetter, toValue } from 'vue'

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

/** When a rule fires: 'blur' = on field blur, 'change' = on value change,
 *  'submit' = only when validate() is called explicitly. */
export type FormValidationTrigger = 'blur' | 'change' | 'submit'

/** Synchronous custom validator.  Return true = valid, false = invalid (uses
 *  `message`), or a non-empty string to override the error message. */
export type FormValidatorFn<T extends object, K extends keyof T = keyof T> =
  (value: T[K], model: T) => boolean | string

/** Asynchronous custom validator.  Resolve true = valid, false = invalid,
 *  or a non-empty string to override the error message. */
export type FormAsyncValidatorFn<T extends object, K extends keyof T = keyof T> =
  (value: T[K], model: T) => Promise<boolean | string>

/**
 * A single validation rule for one field.
 *
 * At least one of `required`, `min`, `max`, `pattern`, `validator`, or
 * `asyncValidator` must be set for the rule to do anything.
 */
export interface FormFieldRule<T extends object, K extends keyof T = keyof T> {
  /** Field must be non-empty (not null / undefined / '' / false). */
  required?: boolean
  /** Minimum string / array length. */
  min?: number
  /** Maximum string / array length. */
  max?: number
  /** Value must match this regex. */
  pattern?: RegExp
  /** Custom synchronous validator. */
  validator?: FormValidatorFn<T, K>
  /** Custom asynchronous validator (takes precedence over `validator` when
   *  both are present). */
  asyncValidator?: FormAsyncValidatorFn<T, K>
  /** Error message for built-in checks (`required`, `min`, `max`, `pattern`).
   *  For custom validators this is the fallback when the fn returns `false`. */
  message?: string
  /** When this rule fires.  Defaults to `'submit'` when omitted. */
  trigger?: FormValidationTrigger
}

/** Rule map keyed by model field name.  Each field may have one rule or an
 *  array of rules — all rules are evaluated in order; the first failure wins. */
export type FormValidationRules<T extends object> = {
  [K in keyof T]?: FormFieldRule<T, K> | FormFieldRule<T, K>[]
}

/** Return value of `useFormValidation`. */
export interface UseFormValidationReturn<T extends object> {
  /** Reactive map of field → error message (empty string = no error). */
  errors: Record<keyof T, string>
  /** Run all rules (including 'submit'-only ones).
   *  Returns `true` when every field is valid. */
  validate: () => Promise<boolean>
  /** Run all rules for a single field (including 'submit'-only ones). */
  validateField: (field: keyof T) => Promise<boolean>
  /** Clear all error messages. */
  clearErrors: () => void
  /** Clear the error message for a single field. */
  clearFieldError: (field: keyof T) => void
  /**
   * Call this from an input's `@blur` handler.
   * Runs rules that have `trigger: 'blur'` for the given field.
   */
  handleBlur: (field: keyof T) => Promise<void>
  /**
   * Call this from an input's `@update:modelValue` / `@change` handler.
   * Runs rules that have `trigger: 'change'` for the given field.
   */
  handleChange: (field: keyof T) => Promise<void>
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true
  if (typeof value === 'string') return value.trim() === ''
  if (typeof value === 'boolean') return !value
  if (Array.isArray(value)) return value.length === 0
  return false
}

function getLength(value: unknown): number {
  if (typeof value === 'string' || Array.isArray(value)) return value.length
  return 0
}

async function runRule<T extends object>(
  rule: FormFieldRule<T>,
  value: unknown,
  model: T,
): Promise<string | null> {
  // --- required ---
  if (rule.required && isEmpty(value)) {
    return rule.message ?? 'This field is required'
  }

  // --- min / max (only when value is non-empty or rule has no required) ---
  if (!isEmpty(value)) {
    if (rule.min !== undefined && getLength(value) < rule.min) {
      return rule.message ?? `Minimum length is ${rule.min}`
    }
    if (rule.max !== undefined && getLength(value) > rule.max) {
      return rule.message ?? `Maximum length is ${rule.max}`
    }

    // --- pattern ---
    if (rule.pattern !== undefined) {
      if (typeof value !== 'string' || !rule.pattern.test(value)) {
        return rule.message ?? 'Invalid format'
      }
    }
  }

  // --- async validator (takes precedence) ---
  if (rule.asyncValidator) {
    const result = await rule.asyncValidator(value as never, model)
    if (result === false) return rule.message ?? 'Invalid value'
    if (typeof result === 'string' && result.length > 0) return result
    return null
  }

  // --- sync validator ---
  if (rule.validator) {
    const result = rule.validator(value as never, model)
    if (result === false) return rule.message ?? 'Invalid value'
    if (typeof result === 'string' && result.length > 0) return result
  }

  return null
}

async function runRulesForField<T extends object>(
  field: keyof T,
  model: T,
  rules: FormValidationRules<T>,
  triggerFilter?: FormValidationTrigger,
): Promise<string> {
  const fieldRules = rules[field]
  if (!fieldRules) return ''

  const list: FormFieldRule<T>[] = Array.isArray(fieldRules)
    ? (fieldRules as FormFieldRule<T>[])
    : [fieldRules as FormFieldRule<T>]

  for (const rule of list) {
    // If a trigger filter is active, skip rules that don't match.
    // When triggerFilter is undefined (full validate()), run everything.
    if (triggerFilter !== undefined) {
      const t = rule.trigger ?? 'submit'
      if (t !== triggerFilter) continue
    }

    const error = await runRule(rule, model[field], model)
    if (error !== null) return error
  }

  return ''
}

// ---------------------------------------------------------------------------
// Composable
// ---------------------------------------------------------------------------

/**
 * Lightweight form-validation composable.
 *
 * ```ts
 * const model = reactive({ name: '', email: '' })
 * const rules: FormValidationRules<typeof model> = {
 *   name: { required: true, message: 'Name is required' },
 *   email: [
 *     { required: true },
 *     { pattern: /^[^@]+@[^@]+$/, message: 'Invalid email' },
 *   ],
 * }
 * const { errors, validate, validateField, clearErrors, handleBlur, handleChange } =
 *   useFormValidation(model, rules)
 * ```
 *
 * Feed `errors.fieldName` into `TFormField`/`TInput` `:error` props.
 */
export function useFormValidation<T extends object>(
  model: T | Ref<T> | MaybeRefOrGetter<T>,
  rules: FormValidationRules<T> | Ref<FormValidationRules<T>> | MaybeRefOrGetter<FormValidationRules<T>>,
): UseFormValidationReturn<T> {
  // Collect all field keys from the current rules snapshot for error initialisation.
  const getModel = () => toValue(model) as T
  const getRules = () => toValue(rules) as FormValidationRules<T>

  // Build initial errors object from all known field keys.
  const initialKeys = Object.keys(getRules()) as (keyof T)[]
  const errorsInit: Partial<Record<keyof T, string>> = {}
  for (const k of initialKeys) errorsInit[k] = ''
  const errors = reactive(errorsInit) as Record<keyof T, string>

  // Ensure a key exists in errors even if not in the initial rules snapshot.
  function ensureKey(field: keyof T) {
    if (!(field in errors)) {
      ;(errors as Record<keyof T, string>)[field] = ''
    }
  }

  async function validateField(field: keyof T): Promise<boolean> {
    ensureKey(field)
    const error = await runRulesForField(field, getModel(), getRules())
    errors[field] = error
    return error === ''
  }

  async function validate(): Promise<boolean> {
    const currentRules = getRules()
    const fields = Object.keys(currentRules) as (keyof T)[]
    const results = await Promise.all(fields.map(f => validateField(f)))
    return results.every(Boolean)
  }

  function clearErrors(): void {
    const keys = Object.keys(errors) as (keyof T)[]
    for (const k of keys) errors[k] = ''
  }

  function clearFieldError(field: keyof T): void {
    ensureKey(field)
    errors[field] = ''
  }

  async function handleBlur(field: keyof T): Promise<void> {
    ensureKey(field)
    const error = await runRulesForField(field, getModel(), getRules(), 'blur')
    // Only update if we actually found an error (don't clear errors set by validate()).
    if (error !== '') {
      errors[field] = error
    } else if (errors[field]) {
      // Re-run ALL rules so clearing blur-triggered error doesn't hide submit errors.
      const full = await runRulesForField(field, getModel(), getRules())
      errors[field] = full
    }
  }

  async function handleChange(field: keyof T): Promise<void> {
    ensureKey(field)
    const error = await runRulesForField(field, getModel(), getRules(), 'change')
    if (error !== '') {
      errors[field] = error
    } else if (errors[field]) {
      const full = await runRulesForField(field, getModel(), getRules())
      errors[field] = full
    }
  }

  return {
    errors,
    validate,
    validateField,
    clearErrors,
    clearFieldError,
    handleBlur,
    handleChange,
  }
}
