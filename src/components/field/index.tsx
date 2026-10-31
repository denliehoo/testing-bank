import { useId } from 'react'
import type { ReactNode } from 'react'
import styles from './index.module.css'

/** What a control inside a `Field` needs to be labelled and described. */
export interface FieldControlProps {
  id: string
  'aria-describedby'?: string
  'aria-invalid'?: true
}

interface FieldProps {
  label: string
  /** Extra text on the label's row, right-aligned (e.g. a character counter). */
  aside?: string
  /** Help text under the control. */
  hint?: ReactNode
  error?: string
  /** Gets the props to spread on the input or select. */
  children: (control: FieldControlProps) => ReactNode
}

export function Field({ label, aside, hint, error, children }: FieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`
  const describedBy =
    [hint ? hintId : '', error ? errorId : ''].filter(Boolean).join(' ') ||
    undefined

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {aside && <span className={styles.aside}>{aside}</span>}
      </div>
      {children({
        id,
        'aria-describedby': describedBy,
        'aria-invalid': error ? true : undefined,
      })}
      {hint && (
        <p id={hintId} className={styles.hint}>
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  )
}
