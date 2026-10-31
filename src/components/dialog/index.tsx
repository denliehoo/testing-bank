import { useEffect, useId, useRef } from 'react'
import type { ReactNode, RefObject } from 'react'
import { Button } from '@/components/button'
import styles from './index.module.css'

interface DialogProps {
  open: boolean
  /** Runs once the dialog has closed, however it was closed (Esc, ✕, or `open`
   * going false). Safe to call more than once. */
  onClose: () => void
  title: string
  /** Shown under the title (e.g. a stepper). */
  subheader?: ReactNode
  footer?: ReactNode
  /** Stops the user closing it (✕ and Esc), e.g. while something is sending. */
  closeDisabled?: boolean
  /** Takes over ✕ and Esc: they ask this instead of closing, and the owner
   * closes it (by setting `open` to false) if it agrees. For a "discard
   * changes?" check. */
  onCloseRequest?: () => void
  /** Where focus goes when the dialog closes. Browsers restore it to the
   * element focused before opening, but Safari doesn't focus a button when
   * it's clicked, so the opener is given explicitly. */
  returnFocusTo?: RefObject<HTMLElement | null>
  children: ReactNode
}

/** A modal dialog on the native <dialog>: the browser traps focus, makes the
 * page behind it inert and closes it on Esc. Full-screen below 1024px. */
export function Dialog({
  open,
  onClose,
  title,
  subheader,
  footer,
  closeDisabled = false,
  onCloseRequest,
  returnFocusTo,
  children,
}: DialogProps) {
  const titleId = useId()
  const dialogRef = useRef<HTMLDialogElement>(null)

  // Keeps the DOM element in step with `open`: this is syncing React with an
  // external system, which is what effects are for.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Fires after every close (Esc, the ✕ button, or dialog.close() above).
  function handleClose() {
    returnFocusTo?.current?.focus()
    onClose()
  }

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby={titleId}
      onClose={handleClose}
      // Esc fires `cancel` first; stopping it keeps the dialog open.
      onCancel={(event) => {
        if (!closeDisabled && !onCloseRequest) return
        event.preventDefault()
        if (!closeDisabled) onCloseRequest?.()
      }}
    >
      {open && (
        <>
          <header className={styles.header}>
            <div className={styles.titleRow}>
              <h2 id={titleId} className={styles.title}>
                {title}
              </h2>
              <Button
                variant="ghost"
                aria-label="Close"
                disabled={closeDisabled}
                onClick={onCloseRequest ?? (() => dialogRef.current?.close())}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
                  <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </Button>
            </div>
            {subheader}
          </header>
          <div className={styles.body}>{children}</div>
          {footer && <footer className={styles.footer}>{footer}</footer>}
        </>
      )}
    </dialog>
  )
}
