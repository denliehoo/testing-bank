import type { Segment } from '@/api/types'
import { useSegment } from '@/lib/preferences'
import styles from './index.module.css'

const OPTIONS: { value: Segment; label: string }[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'premium', label: 'Premium' },
]

export function SegmentSwitch() {
  const { segment, setSegment } = useSegment()

  return (
    <div role="group" aria-label="Customer segment" className={styles.root}>
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          aria-pressed={segment === value}
          onClick={() => setSegment(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
