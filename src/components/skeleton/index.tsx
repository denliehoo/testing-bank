import styles from './index.module.css'

interface SkeletonProps {
  width?: string
  /** Defaults to the line height of the element it sits in, so swapping
   * text for a skeleton doesn't change the layout. */
  height?: string
}

export function Skeleton({ width = '100%', height = '1lh' }: SkeletonProps) {
  return <span aria-hidden="true" className={styles.root} style={{ width, height }} />
}
