import type { ComponentProps } from 'react'
import styles from './index.module.css'

/** Text for screen readers only. */
export function VisuallyHidden(props: ComponentProps<'span'>) {
  return <span className={styles.root} {...props} />
}
