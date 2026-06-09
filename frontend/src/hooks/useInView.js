import { useState, useEffect, useRef } from 'react'

/**
 * Hook que detecta si un elemento es visible en el viewport
 * usando IntersectionObserver. Retorna [ref, isVisible].
 */
export default function useInView({ threshold = 0.1, rootMargin = '200px' } = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el) // Solo una vez
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return [ref, isVisible]
}
