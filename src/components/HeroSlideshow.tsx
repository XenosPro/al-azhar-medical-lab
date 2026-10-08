import { useEffect, useState } from 'react'
import './HeroSlideshow.css'

const slides = [
  {
    eyebrow: 'MODERN LABORATORY',
    title: 'Precision in every sample.',
    description: 'A closer look at the science behind dependable laboratory testing.',
    image:
      'https://images.pexels.com/photos/8442147/pexels-photo-8442147.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Laboratory professional working with diagnostic samples',
  },
  {
    eyebrow: 'CAREFUL ANALYSIS',
    title: 'Details matter.',
    description: 'Laboratory workflows built around care, attention, and accuracy.',
    image:
      'https://images.pexels.com/photos/2280547/pexels-photo-2280547.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Clinical laboratory workspace and scientific equipment',
  },
  {
    eyebrow: 'DIAGNOSTIC SCIENCE',
    title: 'Science at work.',
    description: 'Specialized equipment supports a broad range of laboratory tests.',
    image:
      'https://images.pexels.com/photos/3786157/pexels-photo-3786157.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Scientist carrying out work in a medical laboratory',
  },
  {
    eyebrow: 'PATIENT-FOCUSED CARE',
    title: 'Clearer steps. Better care.',
    description: 'A straightforward experience from booking to laboratory testing.',
    image:
      'https://images.pexels.com/photos/4031818/pexels-photo-4031818.jpeg?auto=compress&cs=tinysrgb&w=1400',
    alt: 'Healthcare professional in a clean clinical environment',
  },
]

const SLIDE_INTERVAL = 6500

export default function HeroSlideshow() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length)
    }, SLIDE_INTERVAL)

    return () => window.clearInterval(intervalId)
  }, [paused])

  const showPrevious = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length)
  }

  const showNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length)
  }

  return (
    <div
      className="hero-visual hero-slideshow-visual"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setPaused(false)
        }
      }}
      aria-label="Al-Azhar Medical Lab photo slideshow"
    >
      <div className="hero-slideshow">
        {slides.map((slide, index) => (
          <div
            className={`hero-slide ${index === activeIndex ? 'is-active' : ''}`}
            key={slide.image}
            aria-hidden={index !== activeIndex}
          >
            <img
              src={slide.image}
              alt={slide.alt}
              className="hero-slide-image"
              loading={index === 0 ? 'eager' : 'lazy'}
              fetchPriority={index === 0 ? 'high' : 'auto'}
            />
          </div>
        ))}

        <div className="hero-slide-shade" />

        <div className="hero-slide-topline">
          <span className="hero-slide-brand">
            <span className="hero-slide-brand-mark">+</span>
            <span>AL-AZHAR MEDICAL LAB</span>
          </span>
          <span className="hero-slide-status">
            <i />
            CHERCHELL, ALGERIA
          </span>
        </div>

        <div className="hero-slide-copy" aria-live="polite" aria-atomic="true">
          <span className="hero-slide-eyebrow">{slides[activeIndex].eyebrow}</span>
          <h2>{slides[activeIndex].title}</h2>
          <p>{slides[activeIndex].description}</p>
        </div>

        <div className="hero-slide-controls">
          <div className="hero-slide-dots" aria-label="Choose slideshow image">
            {slides.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                className={`hero-slide-dot ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => setActiveIndex(index)}
                aria-label={`Show image ${index + 1}: ${slide.eyebrow.toLowerCase()}`}
                aria-pressed={index === activeIndex}
              />
            ))}
          </div>

          <div className="hero-slide-arrows">
            <button type="button" onClick={showPrevious} aria-label="Previous image">
              <span aria-hidden="true">←</span>
            </button>
            <button type="button" onClick={showNext} aria-label="Next image">
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </div>

      <div className="floating-card result-card hero-slide-floating-card">
        <span className="result-icon">✓</span>
        <div>
          <strong>Patient focused</strong>
          <small>Simple &amp; clear process</small>
        </div>
      </div>

      <div className="floating-card accuracy-card hero-slide-floating-card">
        <span className="result-icon">+</span>
        <div>
          <strong>Laboratory care</strong>
          <small>Testing &amp; diagnostics</small>
        </div>
      </div>
    </div>
  )
}
