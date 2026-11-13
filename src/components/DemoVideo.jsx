import { useEffect, useRef, useState } from 'react'
import mp4 from '../assets/demo-transfer.mp4'
import poster from '../assets/demo-transfer-poster.webp'

const wantsStill = () => {
  if (typeof window === 'undefined') return true
  const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const saveData = navigator.connection?.saveData === true
  return reduced || saveData
}

/**
 * 12-second silent loop of the real app in a phone frame.
 * Loads nothing until it is near the screen, plays only while visible, and
 * stays a still image (with a play button) for reduced motion or Data Saver.
 */
function DemoVideo({ className = '' }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [userPaused, setUserPaused] = useState(() => wantsStill())

  const play = () => {
    const v = ref.current
    if (!v) return
    try {
      const p = v.play()
      if (p && typeof p.catch === 'function') p.catch(() => setPlaying(false))
    } catch {
      setPlaying(false)
    }
  }

  useEffect(() => {
    const v = ref.current
    if (!v || userPaused || !('IntersectionObserver' in window)) return undefined
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) play()
      else v.pause()
    }, { threshold: 0.4 })
    observer.observe(v)
    return () => observer.disconnect()
  }, [userPaused])

  const toggle = () => {
    if (playing) {
      ref.current?.pause()
      setUserPaused(true)
    } else {
      setUserPaused(false)
      play()
    }
  }

  return (
    <figure className={`relative mx-auto w-60 sm:w-64 ${className}`}>
      <div className="overflow-hidden rounded-[2.2rem] border-[10px] border-indigo-950 bg-indigo-950 shadow-[0_24px_60px_rgba(10,18,51,0.35)]">
        <video
          ref={ref}
          className="block aspect-[390/760] w-full bg-white"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          width="390"
          height="760"
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          aria-label="Demo: a 100 € transfer with a 1.20 € fee is recorded, Nkap shows 64,809 XAF received at a low 1.2% cost, and the dashboard updates."
        >
          <source src={mp4} type="video/mp4" />
        </video>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause the demo' : 'Play the demo'}
        className="absolute -bottom-14 left-1/2 inline-flex -translate-x-1/2 sm:-right-14 sm:bottom-2 sm:left-auto sm:translate-x-0 h-10 w-10 items-center justify-center rounded-full border border-indigo-100 bg-white text-indigo-950 shadow-md hover:bg-indigo-100"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
          {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M7 4l13 8-13 8z" />}
        </svg>
      </button>
    </figure>
  )
}

export default DemoVideo
