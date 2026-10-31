import type { ReactNode } from 'react'
import styles from './index.module.css'

interface LayoutProps {
  header: ReactNode
  /** Optional right-hand column (stacks below the main column on small screens). */
  rail?: ReactNode
  children: ReactNode
}

export function Layout({ header, rail, children }: LayoutProps) {
  const contentClasses = [styles.content, rail && styles.withRail]
    .filter(Boolean)
    .join(' ')

  return (
    <>
      <header className={styles.headerBar}>
        <div className={styles.container}>{header}</div>
      </header>
      <div className={`${styles.container} ${contentClasses}`}>
        <main className={styles.main}>{children}</main>
        {rail && <aside>{rail}</aside>}
      </div>
    </>
  )
}
