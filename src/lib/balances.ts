import { AccountType } from '@/api/types'
import type { Account, Customer } from '@/api/types'

// Money is a float with 2 decimals; round after arithmetic so sums and
// differences don't pick up float noise (e.g. 4879.900000000001).
const roundMoney = (amount: number) =>
  Math.round((amount + Number.EPSILON) * 100) / 100

/** Checking and savings. The credit card is money owed, not money available. */
export function isDepositAccount(account: Account): boolean {
  return account.type !== AccountType.Credit
}

export function totalAvailable(accounts: Account[]): number {
  return roundMoney(
    accounts
      .filter(isDepositAccount)
      .reduce((sum, account) => sum + account.balance, 0),
  )
}

export function remainingDailyLimit(customer: Customer): number {
  return roundMoney(customer.dailyTransferLimit - customer.transferredToday)
}
