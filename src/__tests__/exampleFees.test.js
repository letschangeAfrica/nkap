import { describe, test, expect } from 'vitest'
import { compareServices, exampleFee, EXAMPLE_SERVICES } from '../utils/exampleFees'

const [wise, orange, wu] = EXAMPLE_SERVICES

describe('exampleFee', () => {
  test('fixed part plus a percentage, rounded to the cent', () => {
    expect(exampleFee(100, wise)).toBe(1.2)
    expect(exampleFee(100, orange)).toBe(4.3)
    expect(exampleFee(100, wu)).toBe(8.4)
    expect(exampleFee(150, wise)).toBe(1.65)
  })
})

describe('compareServices', () => {
  test('Wise leaves the most for the family at 100 €', () => {
    expect(compareServices(100).best.name).toBe('Wise')
  })

  test('no valid row and no best service when the amount is not a number', () => {
    const { rows, best } = compareServices(NaN)
    expect(rows.every((r) => !r.valid)).toBe(true)
    expect(best).toBeNull()
  })

  test('a fee larger than a tiny amount makes that row invalid', () => {
    const rows = compareServices(3).rows
    expect(rows.find((r) => r.name === 'Western Union').valid).toBe(false)
    expect(rows.find((r) => r.name === 'Wise').valid).toBe(true)
  })
})
