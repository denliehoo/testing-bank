import { useId, useRef } from 'react'
import { VisuallyHidden } from '@/components/visually-hidden'
import styles from './index.module.css'

interface SearchInputProps {
  label: string
  placeholder?: string
  /** Short status text shown inside the field's right edge (e.g. "3 results"). */
  hint?: string
  value: string
  onChange: (value: string) => void
}

export function SearchInput({
  label,
  placeholder,
  hint,
  value,
  onChange,
}: SearchInputProps) {
  const id = useId()
  const inputRef = useRef<HTMLInputElement>(null)

  // Room on the right for the clear button, and for the hint if there is one,
  // but only once there's text. Reserving it while empty would clip the
  // placeholder on narrow screens.
  const rightPadding = !value
    ? ''
    : hint !== undefined
      ? styles.withClearAndHint
      : styles.withClear

  function clear() {
    onChange('')
    inputRef.current?.focus()
  }

  return (
    <div className={styles.root}>
      <label htmlFor={id}>
        <VisuallyHidden>{label}</VisuallyHidden>
      </label>
      <svg
        className={styles.icon}
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <input
        ref={inputRef}
        id={id}
        type="search"
        className={`${styles.input} ${rightPadding}`}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {hint !== undefined && (
        <span role="status" className={styles.hint}>
          {hint}
        </span>
      )}
      {value && (
        <button
          type="button"
          className={styles.clear}
          aria-label="Clear search text"
          onClick={clear}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      )}
    </div>
  )
}
