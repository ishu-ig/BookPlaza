"use client"
import Link from 'next/link'
import React, { useEffect } from 'react'

const STYLE_ID = 'about-section-styles'
const CSS = `
  .about-section {
    background: #F7F0E6;
    padding: 80px 0;
    font-family: 'Lato', sans-serif;
  }
  .about-container {
    max-width: 1140px;
    margin: 0 auto;
    padding: 0 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 64px;
    align-items: center;
  }
  .about-images {
    position: relative;
    height: 500px;
  }
  .img-main-wrap {
    position: absolute;
    top: 0; left: 0;
    width: 65%; height: 73%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(26,18,8,0.18);
    z-index: 1;
  }
  .img-main {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.5s ease;
  }
  .img-main-wrap:hover .img-main { transform: scale(1.05); }

  .img-secondary-wrap {
    position: absolute;
    bottom: 0; right: 0;
    width: 62%; height: 66%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 12px 40px rgba(26,18,8,0.18);
    border: 5px solid #F7F0E6;
    z-index: 2;
  }
  .img-secondary {
    width: 100%; height: 100%;
    object-fit: cover; display: block;
    transition: transform 0.5s ease;
  }
  .img-secondary-wrap:hover .img-secondary { transform: scale(1.05); }

  .years-badge {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    z-index: 3;
    background: #C8922A;
    color: #1A1208;
    width: 96px; height: 96px;
    border-radius: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 4px solid #F7F0E6;
    box-shadow: 0 6px 24px rgba(200,146,42,0.45);
    font-family: 'Playfair Display', Georgia, serif;
    text-align: center;
    animation: badgePulse 3s ease-in-out infinite;
  }
  @keyframes badgePulse {
    0%, 100% { box-shadow: 0 6px 24px rgba(200,146,42,0.45); }
    50%       { box-shadow: 0 6px 36px rgba(200,146,42,0.7); }
  }
  .badge-number {
    display: block;
    font-size: 24px; font-weight: 700; line-height: 1;
  }
  .badge-label {
    display: block;
    font-size: 9px; font-weight: 700;
    letter-spacing: 1px; text-transform: uppercase;
    line-height: 1.3; margin-top: 2px;
  }

  .about-content {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .about-eyebrow {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 14px;
  }
  .about-eyebrow-line {
    display: block;
    width: 36px; height: 2px;
    background: #C8922A;
    border-radius: 2px;
  }
  .about-eyebrow-text {
    font-size: 11px; font-weight: 700;
    letter-spacing: 3.5px; text-transform: uppercase;
    color: #C8922A;
  }
  .about-heading {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(1.7rem, 3vw, 2.3rem);
    font-weight: 700;
    color: #1A1208;
    line-height: 1.2;
    margin: 0;
  }
  .about-heading em { color: #6B2737; font-style: italic; }

  .heading-divider {
    width: 48px; height: 3px;
    background: #6B2737;
    border-radius: 2px;
    margin: 18px 0 20px;
  }
  .about-body {
    font-size: 0.93rem;
    color: #8C7B6B;
    line-height: 1.85;
    margin: 0 0 12px;
  }
  .about-features-grid {
    list-style: none;
    padding: 0;
    margin: 20px 0 28px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px 16px;
  }
  .about-feature-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem; font-weight: 700;
    color: #1A1208;
    letter-spacing: 0.04em;
  }
  .about-feature-dot {
    display: inline-block;
    width: 8px; height: 8px;
    background: #C8922A;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .about-btn {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: #6B2737;
    color: #FDFAF5;
    font-family: 'Lato', sans-serif;
    font-weight: 700;
    font-size: 0.78rem;
    letter-spacing: 2.5px;
    text-transform: uppercase;
    padding: 14px 36px;
    border-radius: 4px;
    text-decoration: none;
    width: fit-content;
    transition: background 0.3s, transform 0.3s, box-shadow 0.3s;
  }
  .about-btn:hover {
    background: #C8922A;
    color: #1A1208;
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(200,146,42,0.4);
    text-decoration: none;
  }
  .about-btn-arrow {
    font-size: 1.1rem;
    transition: transform 0.3s;
    display: inline-block;
  }
  .about-btn:hover .about-btn-arrow { transform: translateX(5px); }

  @media (max-width: 991px) {
    .about-container { grid-template-columns: 1fr; gap: 48px; }
    .about-images { height: 400px; }
  }
  @media (max-width: 576px) {
    .about-section { padding: 60px 0; }
    .about-images { height: 320px; }
    .about-features-grid { grid-template-columns: 1fr; }
  }
`

export default function About({ title }) {
  // Inject CSS into <head> on mount — survives client-side navigation
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return
    const tag = document.createElement('style')
    tag.id = STYLE_ID
    tag.textContent = CSS
    document.head.appendChild(tag)
  }, [])

  return (
    <section className="about-section">
      <div className="about-container">

        {/* ── Image Column ── */}
        <div className="about-images">
          <div className="img-main-wrap">
            <img
              className="img-main"
              src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=600&q=80"
              alt="Library interior"
            />
          </div>
          <div className="img-secondary-wrap">
            <img
              className="img-secondary"
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&q=80"
              alt="Books on shelf"
            />
          </div>
          <div className="years-badge">
            <span className="badge-number">25+</span>
            <span className="badge-label">Years of Stories</span>
          </div>
        </div>

        {/* ── Content Column ── */}
        <div className="about-content">
          <div className="about-eyebrow">
            <span className="about-eyebrow-line" />
            <span className="about-eyebrow-text">Our Story</span>
          </div>

          <h2 className="about-heading">
            About <em>BookPlaza</em><br />Bookstore
          </h2>

          <div className="heading-divider" />

          <p className="about-body">
            We believe every book opens a door to a new world. Founded in the heart of the city,
            BookPlaza has been a sanctuary for readers, thinkers, and dreamers for over two decades —
            curating titles that inspire, challenge, and endure.
          </p>
          <p className="about-body">
            From timeless classics to contemporary voices, our shelves are chosen with care
            and a deep love for the written word.
          </p>

          <ul className="about-features-grid">
            {['Curated Collections', 'Expert Recommendations', 'Rare & First Editions', 'Reading Events'].map(f => (
              <li key={f} className="about-feature-item">
                <span className="about-feature-dot" />
                {f}
              </li>
            ))}
          </ul>

          {title && (
            <Link href="/about" className="about-btn">
              Discover Our Story <span className="about-btn-arrow">→</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}