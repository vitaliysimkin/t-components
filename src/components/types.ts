export type TElementSize = 'mini' | 'small' | 'default' | 'medium' | 'large'

/**
 * Shared form-field props. Used by input-like components (TInput, TTextarea,
 * TSelect, TSwitch) to keep a consistent API for state & validation.
 *
 * - `disabled` — interaction disabled, semantic state (not styled opacity-only).
 * - `readonly` — value not editable, but focusable and selectable.
 * - `error`   — validation state. `true` toggles the visual error state only;
 *               a string also renders the message under the control where
 *               supported (TInput / TTextarea / TSelect).
 * - `size`    — control size token, reuses `TElementSize`.
 */
export interface TFormFieldProps {
  disabled?: boolean
  readonly?: boolean
  error?: string | boolean
  size?: TElementSize
}

// Base option type for TSelect and similar choosers.
export type TOption = string | number | Record<string, unknown>
