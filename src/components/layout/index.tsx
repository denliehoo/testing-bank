import type { ReactNode } from 'react'
import styles from './index.module.css'

interface LayoutProps {
  header: ReactNode
  /** Full-width block above the columns (e.g. a greeting). */
  intro?: ReactNode
  /** Optional right-hand column (stacks below the main column on small screens). */
  rail?: ReactNode
  children: ReactNode
}

export function Layout({ header, intro, rail, children }: LayoutProps) {
  const bodyClasses = [styles.body, rail && styles.withRail]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={styles.headerBar}>
        <div className={styles.container}>{header}</div>
      </header>
      <div className={`${styles.container} ${styles.content}`}>
        {intro}
        <div className={bodyClasses}>
          <main className={styles.main}>{children}</main>
          {rail && <aside>{rail}</aside>}
        </div>
      </div>
    </>
  )
}
