"use client";
import React from "react";
import Profile from "../Components/Profile";
import Cart from "../Components/Cart";

export default function CheckoutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --cream: #FAF8F5; --white: #FFFFFF; --sand: #F2EDE6;
          --ink: #1C1917; --ink-soft: #44403C; --ink-muted: #78716C;
          --ink-ghost: #A8A29E; --amber: #D97706; --amber-lt: #FEF3C7;
          --emerald: #059669; --rose: #E11D48; --sky: #0284C7;
          --border: #E7E2DA; --border-deep: #D6CFC5;
          --shadow-sm: 0 1px 3px rgba(28,25,23,.06), 0 1px 2px rgba(28,25,23,.04);
          --shadow-md: 0 4px 16px rgba(28,25,23,.09), 0 2px 6px rgba(28,25,23,.05);
        }

        .co-page {
          background: var(--cream);
          min-height: 100vh;
          padding: 40px 0 120px;
        }

        /* BREADCRUMB STEPS */
        .co-steps {
          display: flex; align-items: center;
          margin-bottom: 36px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 16px 24px;
          box-shadow: var(--shadow-sm);
        }
        .co-step {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--ink-ghost);
          flex: 1;
        }
        .co-step.done   { color: var(--emerald); }
        .co-step.active { color: var(--amber); }
        .co-step-num {
          width: 30px; height: 30px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700;
          background: var(--sand); color: var(--ink-ghost);
          border: 2px solid var(--border);
          flex-shrink: 0; transition: all .3s;
        }
        .co-step.done .co-step-num {
          background: var(--emerald); color: #fff; border-color: var(--emerald);
        }
        .co-step.active .co-step-num {
          background: var(--amber); color: #fff; border-color: var(--amber);
          box-shadow: 0 0 0 4px rgba(217,119,6,.15);
        }
        .co-step-label { display: flex; flex-direction: column; }
        .co-step-title { line-height: 1.2; }
        .co-step-sub {
          font-size: 10px; font-weight: 400;
          color: var(--ink-ghost); margin-top: 1px;
        }
        .co-step-sep {
          flex: 0; width: 40px; height: 2px;
          background: var(--border); border-radius: 2px; margin: 0 8px;
        }
        .co-step-sep.done { background: var(--emerald); }

        /* PAGE TITLE */
        .co-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 700; color: var(--ink);
          margin-bottom: 8px;
        }
        .co-title span { color: var(--amber); font-style: italic; }
        .co-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; color: var(--ink-ghost);
          margin-bottom: 32px;
        }

        /* SECTION LABELS */
        .co-section-label {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ink-ghost); margin-bottom: 12px;
          display: flex; align-items: center; gap: 8px;
        }
        .co-section-label::after {
          content: ''; flex: 1; height: 1px; background: var(--border);
        }

        /* TRUST BADGES */
        .co-trust {
          display: flex; gap: 10px; flex-wrap: wrap;
          margin-bottom: 28px;
        }
        .co-trust-item {
          display: flex; align-items: center; gap: 7px;
          font-family: 'Outfit', sans-serif;
          font-size: 11.5px; font-weight: 600;
          color: var(--ink-muted);
          background: var(--white);
          border: 1.5px solid var(--border);
          padding: 7px 14px; border-radius: 100px;
          box-shadow: var(--shadow-sm);
        }
        .co-trust-item i { color: var(--amber); font-size: 12px; }

        /* STICKY SIDEBAR */
        .co-sticky { position: sticky; top: 90px; }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .co-steps { padding: 12px 16px; }
          .co-step-sub { display: none; }
          .co-step-sep { width: 20px; }
          .co-trust { gap: 8px; }
        }
        @media (max-width: 480px) {
          .co-step-title { font-size: 11px; }
          .co-step-num { width: 24px; height: 24px; font-size: 10px; }
        }
      `}</style>

      <div className="co-page">
        <div className="container">

          {/* PROGRESS STEPS */}
          <div className="co-steps">
            <div className="co-step done">
              <div className="co-step-num">
                <i className="fa-solid fa-check" style={{ fontSize: 11 }} />
              </div>
              <div className="co-step-label">
                <span className="co-step-title">Cart</span>
                <span className="co-step-sub">Items ready</span>
              </div>
            </div>

            <div className="co-step-sep done" />

            <div className="co-step active">
              <div className="co-step-num">2</div>
              <div className="co-step-label">
                <span className="co-step-title">Checkout</span>
                <span className="co-step-sub">Review & pay</span>
              </div>
            </div>

            <div className="co-step-sep" />

            <div className="co-step">
              <div className="co-step-num">3</div>
              <div className="co-step-label">
                <span className="co-step-title">Confirmation</span>
                <span className="co-step-sub">Order placed</span>
              </div>
            </div>
          </div>

          {/* TITLE */}
          <div className="co-title">Review & <span>Place Order</span></div>
          <div className="co-subtitle">
            Almost there — confirm your items and delivery details below.
          </div>

          {/* TRUST BADGES */}
          <div className="co-trust">
            <div className="co-trust-item">
              <i className="fa-solid fa-lock" /> Secure Checkout
            </div>
            <div className="co-trust-item">
              <i className="fa-solid fa-rotate-left" /> 7-Day Returns
            </div>
            <div className="co-trust-item">
              <i className="fa-solid fa-truck-fast" /> Fast Delivery
            </div>
            <div className="co-trust-item">
              <i className="fa-solid fa-headset" /> 24/7 Support
            </div>
          </div>

          {/* MAIN GRID */}
          <div className="row g-4 align-items-start">

            {/* LEFT — Cart Summary */}
            <div className="col-12 col-lg-7">
              <div className="co-section-label">
                <i className="fa-solid fa-bag-shopping" style={{ color: "var(--amber)" }} />
                Order Items
              </div>
              <Cart title="Checkout" />
            </div>

            {/* RIGHT — Delivery + Payment */}
            <div className="col-12 col-lg-5">
              <div className="co-sticky">
                <div className="co-section-label">
                  <i className="fa-solid fa-location-dot" style={{ color: "var(--amber)" }} />
                  Delivery Address
                </div>
                <Profile title="Checkout" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}