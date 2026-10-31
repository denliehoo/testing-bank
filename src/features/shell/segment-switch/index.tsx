import { Segment } from '@/api/types'
import { useSegment } from '@/lib/preferences'
import styles from './index.module.css'

// Record<Segment, …> makes adding a segment a compile error until it has a label.
const LABEL: Record<Segment, string> = {
  [Segment.Retail]: 'Retail',
  [Segment.Premium]: 'Premium',
}

export function SegmentSwitch() {
  const { segment, setSegment } = useSegment()

  return (
    <div role="group" aria-label="Customer segment" className={styles.root}>
      {Object.values(Segment).map((value) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          aria-pressed={segment === value}
          onClick={() => setSegment(value)}
        >
          {LABEL[value]}
        </button>
      ))}
    </div>
  )
}
