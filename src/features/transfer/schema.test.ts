import { describe, expect, it } from 'vitest'
import type { Account } from '@/api/types'
import { formatMoney } from '@/lib/format'
import { createTransferSchema, NEW_RECIPIENT } from './schema'
import type { TransferFormValues } from './schema'

const checking: Account = {
  id: 'acc_checking',
  name: 'Everyday Checking',
  type: 'checking',
  maskedNumber: '•••• 4821',
  balance: 4280.55,
  currency: 'SGD',
}
const savings: Account = { ...checking, id: 'acc_savings', balance: 12840 }

const schema = createTransferSchema({
  accounts: [checking, savings],
  remainingLimit: 5000,
})

const valid: TransferFormValues = {
  payeeId: 'pay_001',
  name: '',
  accountNumber: '',
  bank: '',
  fromAccountId: checking.id,
  amount: '120',
  note: '',
}

/** Field → message for everything that's wrong with these values. */
function errors(overrides: Partial<TransferFormValues>) {
  const result = schema.safeParse({ ...valid, ...overrides })
  if (result.success) return {}
  return Object.fromEntries(
    result.error.issues.map((issue) => [issue.path[0], issue.message]),
  )
}

describe('transfer schema', () => {
  it('accepts a saved payee with a valid amount', () => {
    expect(errors({})).toEqual({})
  })

  describe('amount', () => {
    it.each([
      ['', 'Enter an amount.'],
      ['abc', 'Enter a valid amount, like 120.00.'],
      ['10.999', 'Use at most 2 decimal places.'],
      ['0.99', `Amount must be at least ${formatMoney(1)}.`],
    ])('rejects %j', (amount, message) => {
      expect(errors({ amount }).amount).toBe(message)
    })

    it.each(['1', '1.00', '120.5', '4280.55'])('accepts %s', (amount) => {
      expect(errors({ amount }).amount).toBeUndefined()
    })

    it("can't be more than the chosen account's balance", () => {
      expect(errors({ amount: '4280.56' }).amount).toBe(
        `Amount can't be more than your available balance (${formatMoney(4280.55)}).`,
      )
      // The same amount is fine from the account that has enough.
      expect(
        errors({ amount: '4280.56', fromAccountId: savings.id }).amount,
      ).toBeUndefined()
    })

    it("can't be more than the remaining daily limit", () => {
      expect(
        errors({ amount: '5000.01', fromAccountId: savings.id }).amount,
      ).toBe(
        `This transfer exceeds your remaining daily limit (${formatMoney(5000)}).`,
      )
    })
  })

  describe('new recipient', () => {
    const newRecipient = {
      payeeId: NEW_RECIPIENT,
      name: 'Alex Lim',
      accountNumber: '12345678',
      bank: 'OCBC',
    }

    it('accepts valid details', () => {
      expect(errors(newRecipient)).toEqual({})
    })

    it('needs exactly 8 digits for the account number', () => {
      const message = 'Enter a valid 8-digit account number.'
      expect(errors({ ...newRecipient, accountNumber: '1234567' }).accountNumber).toBe(message)
      expect(errors({ ...newRecipient, accountNumber: '123456789' }).accountNumber).toBe(message)
      expect(errors({ ...newRecipient, accountNumber: '1234abcd' }).accountNumber).toBe(message)
    })

    it('needs a name of 2 to 50 characters', () => {
      expect(errors({ ...newRecipient, name: 'A' }).name).toBeDefined()
      expect(errors({ ...newRecipient, name: 'Al' }).name).toBeUndefined()
      expect(errors({ ...newRecipient, name: 'A'.repeat(51) }).name).toBeDefined()
    })

    it('needs a bank', () => {
      expect(errors({ ...newRecipient, bank: '' }).bank).toBe('Choose a bank.')
    })

    it("isn't asked for when a saved payee is chosen", () => {
      expect(errors({ name: '', accountNumber: '', bank: '' })).toEqual({})
    })
  })

  it('needs a recipient to be chosen', () => {
    expect(errors({ payeeId: '' }).payeeId).toBeDefined()
  })

  it('allows a note of up to 50 characters', () => {
    expect(errors({ note: 'n'.repeat(50) }).note).toBeUndefined()
    expect(errors({ note: 'n'.repeat(51) }).note).toBeDefined()
  })
})
