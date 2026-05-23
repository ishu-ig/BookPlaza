"use client"
import React, { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const facts = [
  { value: 100,    suffix: "+",    label: "Top Publishers", description: "Curated house names", icon: "❧" },
  { value: 12000,  suffix: "+",    label: "Titles in Stock", description: "Across every genre",  icon: "§" },
  { value: 7,      suffix: "-Day", label: "Refund Policy",   description: "Hassle-free returns", icon: "¶" },
  { value: 100000, suffix: "+",    label: "Happy Readers",   description: "And counting",        icon: "✦" },
]

/* ─── count-up hook ─── */
function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    if (!start) { setCount(0); return }
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const p = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setCount(Math.floor(eased * target))
      if (p < 1) rafRef.current = requestAnimationFrame(step)
    }
    rafRef.current = requestAnimationFrame(step)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [target, duration, start])

  return count
}

/* ─── inject a <style> tag once into <head>, idempotently ─── */
const STYLE_ID = 'fact-section-styles'
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=DM+Sans:wght@400;500&display=swap');

  .fact-section {
    background: #1A1208;
    position: relative;
    overflow: hidden;
  }
  .fact-section::before,
  .fact-section::after {
    content: '';
    position: absolute;
    left: 0; right: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, rgba(200,146,42,0.4) 20%, rgba(200,146,42,0.4) 80%, transparent 100%);
  }
  .fact-section::before { top: 0; }
  .fact-section::after  { bottom: 0; }

  .fact-watermark {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(6rem, 14vw, 12rem);
    font-weight: 600;
    color: rgba(200,146,42,0.04);
    white-space: nowrap;
    pointer-events: none;
    user-select: none;
    letter-spacing: 0.08em;
    line-height: 1;
  }

  .fact-inner {
    position: relative;
    z-index: 1;
    padding: 16px 0;
  }

  /* ── Desktop grid ── */
  .fact-card-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  .fact-card {
    position: relative;
    padding: 20px 24px;
    text-align: center;
    border-right: 1px solid rgba(200,146,42,0.2);
    transition: background 0.3s ease;
  }
  .fact-card:last-child { border-right: none; }

  .fact-card::after {
    content: '';
    position: absolute;
    bottom: 0; left: 50%;
    transform: translateX(-50%) scaleX(0);
    width: 40px; height: 2px;
    background: #C8922A;
    transition: transform 0.4s ease;
  }
  .fact-card:hover::after {
    transform: translateX(-50%) scaleX(1);
  }

  .fact-glyph {
    font-size: 1.4rem;
    color: rgba(200,146,42,0.5);
    display: block;
    margin-bottom: 16px;
    line-height: 1;
    transition: color 0.3s ease, transform 0.3s ease;
  }
  .fact-card:hover .fact-glyph {
    color: #C8922A;
    transform: scale(1.15);
  }

  .fact-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: clamp(2.6rem, 4vw, 3.8rem);
    font-weight: 600;
    line-height: 1;
    color: #FDFAF5;
    letter-spacing: -0.02em;
    display: block;
    margin-bottom: 4px;
  }
  .fact-suffix { color: #C8922A; }

  .fact-label {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.72rem;
    font-weight: 500;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #C8922A;
    display: block;
    margin-bottom: 6px;
    margin-top: 10px;
  }

  .fact-desc {
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    color: rgba(253,250,245,0.4);
    letter-spacing: 0.04em;
  }

  /* ── Mobile slider ── */
  .fact-slider { display: none; position: relative; }

  .fact-slides-wrapper { overflow: hidden; }

  .fact-slides {
    display: flex;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .fact-slide {
    min-width: 100%;
    padding: 24px 32px 16px; 
    text-align: center;
    box-sizing: border-box;
  }

  .fact-slide .fact-glyph {
    font-size: 1.8rem;
    color: rgba(200,146,42,0.5);
    display: block;
    margin-bottom: 18px;
    line-height: 1;
  }

  .fact-slide .fact-number {
    font-family: 'Cormorant Garamond', Georgia, serif;
    font-size: 3.6rem;
    font-weight: 600;
    line-height: 1;
    color: #FDFAF5;
    letter-spacing: -0.02em;
    display: block;
    margin-bottom: 4px;
  }

  .fact-arrows {
    position: absolute;
    top: 50%;
    transform: translateY(-60%);
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    box-sizing: border-box;
    pointer-events: none;
  }

  .fact-arrow {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: rgba(200,146,42,0.12);
    border: 1px solid rgba(200,146,42,0.3);
    color: #C8922A;
    font-size: 18px;
    line-height: 1;
    cursor: pointer;
    pointer-events: all;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .fact-arrow:hover { background: rgba(200,146,42,0.25); }

  .fact-dots {
    display: flex;
    justify-content: center;
    gap: 8px;
    padding: 4px 0 20px;
  }

  .fact-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: rgba(200,146,42,0.25);
    border: none;
    cursor: pointer;
    padding: 0;
    transition: background 0.2s, transform 0.2s;
  }
  .fact-dot.active {
    background: #C8922A;
    transform: scale(1.35);
  }

  @media (max-width: 767px) {
    .fact-card-grid { display: none; }
    .fact-slider    { display: block; }
    .fact-section {padding : 30px}
  }
`

function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent = CSS
    document.head.appendChild(tag)
  }, [])
}

/* ─── desktop stat card ─── */
function StatCard({ fact, index, inView }) {
  const count     = useCountUp(fact.value, 1600 + index * 100, inView)
  const formatted = count >= 1000 ? count.toLocaleString() : count

  return (
    <div className="fact-card">
      <span className="fact-glyph" aria-hidden="true">{fact.icon}</span>
      <span className="fact-number">
        {formatted}
        <span className="fact-suffix">{fact.suffix}</span>
      </span>
      <span className="fact-label">{fact.label}</span>
      <span className="fact-desc">{fact.description}</span>
    </div>
  )
}

/* ─── mobile slide card ─── */
function SlideCard({ fact, inView }) {
  const count     = useCountUp(fact.value, 1400, inView)
  const formatted = count >= 1000 ? count.toLocaleString() : count

  return (
    <div className="fact-slide">
      <span className="fact-glyph" aria-hidden="true">{fact.icon}</span>
      <span className="fact-number">
        {formatted}
        <span className="fact-suffix">{fact.suffix}</span>
      </span>
      <span className="fact-label">{fact.label}</span>
      <span className="fact-desc">{fact.description}</span>
    </div>
  )
}

/* ─── main component ─── */
export default function Fact() {
  useInjectStyles()

  const sectionRef  = useRef(null)
  const sliderRef   = useRef(null)
  const observerRef = useRef(null)
  const autoRef     = useRef(null)
  const pathname    = usePathname()

  const [inView, setInView]   = useState(false)
  const [slide,  setSlide]    = useState(0)

  /* ── go to slide ── */
  function goTo(n) {
    const next = (n + facts.length) % facts.length
    setSlide(next)
    if (sliderRef.current)
      sliderRef.current.style.transform = `translateX(-${next * 100}%)`
    resetAutoPlay()
  }

  /* ── auto-play ── */
  function resetAutoPlay() {
    if (autoRef.current) clearInterval(autoRef.current)
    autoRef.current = setInterval(() => {
      setSlide(prev => {
        const next = (prev + 1) % facts.length
        if (sliderRef.current)
          sliderRef.current.style.transform = `translateX(-${next * 100}%)`
        return next
      })
    }, 3000)
  }

  useEffect(() => {
    resetAutoPlay()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [])

  /* ── swipe support ── */
  useEffect(() => {
    const wrapper = sliderRef.current?.parentElement
    if (!wrapper) return
    let startX = 0
    const onTouchStart = e => { startX = e.touches[0].clientX }
    const onTouchEnd   = e => {
      const diff = startX - e.changedTouches[0].clientX
      if (Math.abs(diff) > 40)
        setSlide(prev => {
          const next = (prev + (diff > 0 ? 1 : -1) + facts.length) % facts.length
          if (sliderRef.current)
            sliderRef.current.style.transform = `translateX(-${next * 100}%)`
          return next
        })
    }
    wrapper.addEventListener('touchstart', onTouchStart, { passive: true })
    wrapper.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      wrapper.removeEventListener('touchstart', onTouchStart)
      wrapper.removeEventListener('touchend',   onTouchEnd)
    }
  }, [])

  /* ── intersection observer ── */
  const attachObserver = () => {
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null }
    if (!sectionRef.current) return
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observerRef.current?.disconnect()
        }
      },
      { threshold: 0.25 }
    )
    observerRef.current.observe(sectionRef.current)
  }

  useEffect(() => {
    setInView(false)
    const timer = setTimeout(attachObserver, 120)
    return () => {
      clearTimeout(timer)
      observerRef.current?.disconnect()
    }
  }, [pathname])

  return (
    <section className="fact-section" ref={sectionRef}>
      <div className="fact-watermark" aria-hidden="true">Est. Readers</div>
      <div className="container fact-inner">

        {/* ── Desktop grid ── */}
        <div className="fact-card-grid">
          {facts.map((fact, i) => (
            <StatCard key={i} fact={fact} index={i} inView={inView} />
          ))}
        </div>

        {/* ── Mobile slider ── */}
        <div className="fact-slider">
          <div className="fact-slides-wrapper">
            <div className="fact-slides" ref={sliderRef}>
              {facts.map((fact, i) => (
                <SlideCard key={i} fact={fact} inView={inView} />
              ))}
            </div>
          </div>

          {/* Arrows */}
          <div className="fact-arrows">
            <button className="fact-arrow" onClick={() => goTo(slide - 1)} aria-label="Previous">&#8249;</button>
            <button className="fact-arrow" onClick={() => goTo(slide + 1)} aria-label="Next">&#8250;</button>
          </div>

          {/* Dots */}
          <div className="fact-dots">
            {facts.map((_, i) => (
              <button
                key={i}
                className={`fact-dot ${i === slide ? 'active' : ''}`}
                onClick={() => goTo(i)}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}