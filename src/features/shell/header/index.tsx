import { SegmentSwitch } from '@/features/shell/segment-switch'
import { ThemeToggle } from '@/features/shell/theme-toggle'
import styles from './index.module.css'

// Cards, Payments and Insights are out of scope; they're shown but inert.
const DISABLED_NAV = ['Cards', 'Payments', 'Insights']

export function Header() {
  return (
    <div className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.mark} aria-hidden="true">
          M
        </span>
        Meridian
      </div>

      <nav className={styles.nav} aria-label="Main">
        <ul className={styles.navList}>
          <li>
            <span className={styles.navItem} aria-current="page">
              Overview
            </span>
          </li>
          {DISABLED_NAV.map((label) => (
            <li key={label}>
              <span className={styles.navItem} aria-disabled="true">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.segment}>
        <SegmentSwitch />
      </div>

      <div className={styles.actions}>
        <ThemeToggle />
        <span className={styles.avatar} role="img" aria-label="Ava Chen">
          AC
        </span>
      </div>
    </div>
  )
}
