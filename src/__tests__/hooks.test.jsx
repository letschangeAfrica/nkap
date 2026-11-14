// @vitest-environment jsdom
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, renderHook, act } from '@testing-library/react'
import { useInView } from '../hooks/useInView'
import { useAnimatedNumber } from '../hooks/useAnimatedNumber'
import { stubIntersectionObserver, stubMatchMedia } from './helpers/observer'

describe('useInView', () => {
  function Probe() {
    const [ref, inView] = useInView()
    return <div ref={ref}>{inView ? 'visible' : 'hidden'}</div>
  }

  test('is true straight away without IntersectionObserver', () => {
    render(<Probe />)
    expect(screen.getByText('visible')).toBeInTheDocument()
  })

  test('turns true the first time the element scrolls into view, then stops watching', () => {
    const observers = stubIntersectionObserver()
    render(<Probe />)
    expect(screen.getByText('hidden')).toBeInTheDocument()

    act(() => observers[0].fire(false))
    expect(screen.getByText('hidden')).toBeInTheDocument()

    act(() => observers[0].fire(true))
    expect(screen.getByText('visible')).toBeInTheDocument()
    expect(observers[0].disconnect).toHaveBeenCalled()
  })
})

describe('useAnimatedNumber', () => {
  afterEach(() => vi.useRealTimers())

  test('jumps straight to the target when the user prefers reduced motion', () => {
    stubMatchMedia({ 'prefers-reduced-motion': true })
    const { result, rerender } = renderHook(({ n }) => useAnimatedNumber(n, 300, 0), { initialProps: { n: 100 } })
    expect(result.current).toBe(100)
    rerender({ n: 250 })
    expect(result.current).toBe(250)
  })

  test('rolls from the start value to the target over the duration', () => {
    stubMatchMedia({ 'prefers-reduced-motion': false })
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame', 'performance'] })
    const { result } = renderHook(() => useAnimatedNumber(100, 300, 0))
    expect(result.current).toBe(0)

    act(() => vi.advanceTimersByTime(150))
    expect(result.current).toBeGreaterThan(0)
    expect(result.current).toBeLessThan(100)

    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe(100)
  })
})
