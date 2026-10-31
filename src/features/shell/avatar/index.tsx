import { useQuery } from '@tanstack/react-query'
import { customerQuery } from '@/api/queries'
import styles from './index.module.css'

// Shown while the customer is loading (or if it failed to load).
const PLACEHOLDER_INITIALS = '?'
const PLACEHOLDER_LABEL = 'Account'

export function Avatar() {
  const { data: customer } = useQuery(customerQuery)

  const initials = customer
    ? `${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}`.toUpperCase()
    : PLACEHOLDER_INITIALS
  const label = customer
    ? `${customer.firstName} ${customer.lastName}`
    : PLACEHOLDER_LABEL

  return (
    <span className={styles.avatar} role="img" aria-label={label}>
      {initials}
    </span>
  )
}
