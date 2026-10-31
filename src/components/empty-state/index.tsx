import type { ReactNode } from 'react'
import styles from './index.module.css'

interface EmptyStateProps {
  message: string
  action?: ReactNode
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <p className={styles.message}>{message}</p>
      {action}
    </div>
  )
}
