import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'

/** Open/closed state for a dialog that asks before closing when `hasChanges`.
 * Every way of closing (Cancel, ✕, Esc) goes through `requestClose`. When the
 * question is dismissed, focus goes to `focusAfterKeepEditing`: the control that
 * had it was removed while the question showed. */
export function useCloseGuard(
  hasChanges: boolean,
  focusAfterKeepEditing: RefObject<HTMLElement | null>,
) {
  // Closing through the dialog (rather than unmounting it) is what hands focus
  // back to the button that opened it.
  const [isOpen, setOpen] = useState(true)
  // Asking whether to throw away what's been typed.
  const [confirmingDiscard, setConfirmingDiscard] = useState(false)

  // Asking again (✕ or Esc on the question) means keep editing.
  function requestClose() {
    if (confirmingDiscard) setConfirmingDiscard(false)
    else if (hasChanges) setConfirmingDiscard(true)
    else setOpen(false)
  }

  const wasConfirming = useRef(false)
  // Syncing focus with the DOM after the question has gone, which is what
  // effects are for.
  useEffect(() => {
    if (wasConfirming.current && !confirmingDiscard) {
      focusAfterKeepEditing.current?.focus()
    }
    wasConfirming.current = confirmingDiscard
  }, [confirmingDiscard, focusAfterKeepEditing])

  return {
    isOpen,
    confirmingDiscard,
    requestClose,
    keepEditing: () => setConfirmingDiscard(false),
    close: () => setOpen(false),
  }
}
