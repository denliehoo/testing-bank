import styles from './index.module.css'

interface StepperProps {
  steps: string[]
  /** Index into `steps` of the step the user is on. */
  currentIndex: number
}

function stateClass(index: number, currentIndex: number): string {
  if (index === currentIndex) return styles.current
  if (index < currentIndex) return styles.done
  return ''
}

export function Stepper({ steps, currentIndex }: StepperProps) {
  return (
    <ol className={styles.list} aria-label="Progress">
      {steps.map((label, index) => {
        return (
          <li
            key={label}
            className={`${styles.item} ${stateClass(index, currentIndex)}`}
            aria-current={index === currentIndex ? 'step' : undefined}
          >
            <span className={styles.number}>{index + 1}</span>
            {label}
            {index < steps.length - 1 && (
              <span className={styles.arrow} aria-hidden="true">
                →
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
