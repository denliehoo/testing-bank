import styles from './index.module.css'

interface SkeletonProps {
  /** Set `width` and `height` in a class of the component the skeleton stands
   * in for, next to the rules of the real element. Without one it is a
   * full-width line of text height. */
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={className ? `${styles.root} ${className}` : styles.root}
    />
  )
}
