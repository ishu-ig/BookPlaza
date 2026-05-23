"use client"
import React, { useEffect, useState } from 'react'
import HeroSection from "../Components/HeroSection"
import Link from 'next/link'

export default function ConfirmationPage() {
  const [visible, setVisible] = useState(false)
  const [checkDone, setCheckDone] = useState(false)

  useEffect(() => {
    // Slight delay so CSS animation triggers after mount
    const t1 = setTimeout(() => setVisible(true), 80)
    const t2 = setTimeout(() => setCheckDone(true), 600)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');

        .confirm-wrapper {
          min-height: 75vh;
          background: linear-gradient(145deg, #F7F0E6 0%, #EDE3D4 55%, #E2D0B8 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 16px;
          font-family: 'Jost', sans-serif;
        }

        .confirm-card {
          background: #FDFAF5;
          border: 1px solid #E0C99A;
          border-radius: 20px;
          box-shadow: 0 16px 60px rgba(26,18,8,0.13), 0 2px 8px rgba(200,146,42,0.08);
          padding: 52px 44px 44px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          opacity: 0;
          transform: translateY(28px);
          transition: opacity 0.55s ease, transform 0.55s ease;
        }

        .confirm-card.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* Animated check ring */
        .check-ring {
          width: 90px;
          height: 90px;
          border-radius: 50%;
          background: linear-gradient(135deg, #F7F0E6, #E8D5B0);
          border: 2.5px solid #C8922A;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px;
          position: relative;
          overflow: hidden;
        }

        .check-ring::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(#C8922A 0deg, transparent 0deg);
          animation: ring-fill 0.7s ease forwards 0.1s;
          mask: radial-gradient(farthest-side, transparent 68%, black 69%);
          -webkit-mask: radial-gradient(farthest-side, transparent 68%, black 69%);
        }

        @keyframes ring-fill {
          to { background: conic-gradient(#C8922A 360deg, transparent 360deg); }
        }

        .check-icon {
          font-size: 36px;
          color: #6B2737;
          opacity: 0;
          transform: scale(0.4);
          transition: opacity 0.3s ease 0.5s, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) 0.5s;
          z-index: 1;
        }

        .check-icon.done {
          opacity: 1;
          transform: scale(1);
        }

        .confirm-eyebrow {
          font-family: 'Jost', sans-serif;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #C8922A;
          margin-bottom: 10px;
        }

        .confirm-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 42px;
          font-weight: 700;
          color: #1A1208;
          line-height: 1.1;
          margin-bottom: 12px;
        }

        .confirm-subtitle {
          font-family: 'Jost', sans-serif;
          font-size: 15px;
          font-weight: 400;
          color: #6B5B45;
          margin-bottom: 0;
          line-height: 1.6;
        }

        /* Decorative divider */
        .ornament {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 28px 0;
        }

        .ornament-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, #D4B483, transparent);
        }

        .ornament-diamond {
          width: 7px;
          height: 7px;
          background: #C8922A;
          transform: rotate(45deg);
          flex-shrink: 0;
        }

        /* Info strip */
        .info-strip {
          background: #F7F0E6;
          border: 1px solid #E0C99A;
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: flex-start;
          gap: 12px;
          text-align: left;
          margin-bottom: 32px;
        }

        .info-strip i {
          color: #C8922A;
          font-size: 16px;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .info-strip p {
          font-size: 13px;
          color: #6B5B45;
          margin: 0;
          line-height: 1.55;
        }

        /* Buttons */
        .confirm-actions {
          display: flex;
          gap: 14px;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-primary-custom {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 13px 28px;
          background: #6B2737;
          color: #FDFAF5;
          border: none;
          border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(107,39,55,0.28);
          transition: background 0.25s, box-shadow 0.25s, transform 0.2s;
        }

        .btn-primary-custom:hover {
          background: #8a3046;
          box-shadow: 0 8px 26px rgba(107,39,55,0.38);
          transform: translateY(-2px);
          color: #FDFAF5;
          text-decoration: none;
        }

        .btn-outline-custom {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 28px;
          background: transparent;
          color: #6B2737;
          border: 1.5px solid #6B2737;
          border-radius: 8px;
          font-family: 'Jost', sans-serif;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.25s, color 0.25s, transform 0.2s;
        }

        .btn-outline-custom:hover {
          background: #6B2737;
          color: #FDFAF5;
          transform: translateY(-2px);
          text-decoration: none;
        }

        .confirm-footer {
          margin-top: 24px;
          font-size: 12px;
          color: #A08C75;
          font-family: 'Jost', sans-serif;
        }

        .confirm-footer a {
          color: #6B2737;
          font-weight: 600;
          text-decoration: none;
        }

        @media (max-width: 480px) {
          .confirm-card { padding: 36px 22px 32px; }
          .confirm-title { font-size: 34px; }
          .confirm-actions { flex-direction: column; align-items: stretch; }
          .btn-primary-custom, .btn-outline-custom { justify-content: center; }
        }
      `}</style>

      <HeroSection title="Order Confirmation" />

      <div className="confirm-wrapper">
        <div className={`confirm-card ${visible ? 'visible' : ''}`}>

          {/* Animated check */}
          <div className="check-ring">
            <i className={`fas fa-check check-icon ${checkDone ? 'done' : ''}`} />
          </div>

          {/* Text */}
          <p className="confirm-eyebrow">Order Confirmed</p>
          <h1 className="confirm-title">Thank You!</h1>
          <p className="confirm-subtitle">
            Your order has been placed successfully.<br />
            We'll notify you as it makes its way to you.
          </p>

          {/* Ornament */}
          <div className="ornament">
            <div className="ornament-line" />
            <div className="ornament-diamond" />
            <div className="ornament-line" />
          </div>

          {/* Info strip */}
          <div className="info-strip">
            <i className="fas fa-truck" />
            <p>
              Track your shipment anytime from the <strong>Orders</strong> section. 
              Expected delivery updates will be sent to your registered email.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="confirm-actions">
            <Link href="/order" className="btn-primary-custom">
              <i className="fas fa-box" />
              Track Orders
            </Link>
            <Link href="/shop" className="btn-outline-custom">
              <i className="fas fa-shopping-bag" />
              Shop More
            </Link>
          </div>

          <p className="confirm-footer">
            Need help? <a href="/contact">Contact Support</a>
          </p>

        </div>
      </div>

      <div style={{ marginBottom: 100 }} />
    </>
  )
}