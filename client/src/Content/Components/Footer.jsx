"use client";
import Link from "next/link";
import React, { useState } from "react";

const quickLinks = [
  { label: "Home",         href: "/" },
  { label: "About Us",     href: "/about" },
  { label: "Features",     href: "/feature" },
  { label: "Shop",         href: "/shop" },
  { label: "Testimonials", href: "/testimonial" },
  { label: "Contact",      href: "/contactUs" },
];

const policyLinks = [
  { label: "Privacy Policy",     href: "#" },
  { label: "Terms & Conditions", href: "#" },
  { label: "Refund Policy",      href: "#" },
  { label: "Delivery Policy",    href: "#" },
];

const socials = [
  { icon: "fab fa-facebook-f",  href: "#", label: "Facebook"  },
  { icon: "fab fa-instagram",   href: "#", label: "Instagram" },
  { icon: "fab fa-twitter",     href: "#", label: "Twitter"   },
  { icon: "fab fa-linkedin-in", href: "#", label: "LinkedIn"  },
];

const contactItems = [
  { icon: "fa-solid fa-location-dot", text: "123 Street, New York, USA",    href: "/" },
  { icon: "fa-solid fa-phone",        text: "+123 456 7890",                 href: "tel:+11234567890" },
  { icon: "fab fa-whatsapp",          text: "+123 456 7890 (WhatsApp)",      href: "https://wa.me/8218635344", external: true },
  { icon: "fa-solid fa-envelope",     text: "info@shopkaro.com",             href: "mailto:info@shopkaro.com", external: true },
];

export default function Footer() {
  const [email,   setEmail]   = useState("");
  const [message, setMessage] = useState("");
  const [status,  setStatus]  = useState("idle"); // idle | loading | success | error

  async function handleSubscribe(e) {
    e.preventDefault();
    if (!email.trim()) { setMessage("Please enter a valid email address."); setStatus("error"); return; }
    setStatus("loading");
    try {
      let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/newsletter`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      res = await res.json();
      if (res.result === "Done") {
        setMessage("You're in! Expect the best deals soon."); setStatus("success"); setEmail("");
      } else {
        setMessage(res.reason?.email || "Something went wrong — please try again."); setStatus("error");
      }
    } catch {
      setMessage("Something went wrong — please try again."); setStatus("error");
    }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        /* ─── ROOT ─── */
        .sk-footer {
          background: #080808;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        /* ambient glow top-left */
        .sk-footer::before {
          content: '';
          position: absolute;
          top: -180px; left: -180px;
          width: 560px; height: 560px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.045) 0%, transparent 65%);
          pointer-events: none;
        }
        /* subtle grid texture */
        .sk-footer::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(245,158,11,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(245,158,11,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
          z-index: 0;
        }

        .sk-footer-inner { position: relative; z-index: 1; }

        /* ─── TOP BAND ─── */
        .sk-footer-topband {
          border-bottom: 1px solid #141414;
          padding: 48px 0;
        }

        .sk-footer-brand-link {
          font-family: 'Syne', sans-serif;
          font-size: 30px; font-weight: 800;
          letter-spacing: -0.03em;
          color: #FAFAFA; text-decoration: none;
          display: inline-block; margin-bottom: 14px;
          transition: color 0.2s;
        }
        .sk-footer-brand-link:hover { color: #F59E0B; text-decoration: none; }
        .sk-footer-brand-link span { color: #F59E0B; }

        .sk-footer-tagline {
          font-size: 13px; font-weight: 300;
          color: #4B5058; line-height: 1.75;
          max-width: 240px; margin-bottom: 28px;
        }

        /* social row */
        .sk-socials { display: flex; gap: 10px; }

        .sk-social-btn {
          width: 38px; height: 38px;
          border-radius: 10px;
          border: 1px solid #1E1E1E;
          background: #101010;
          display: flex; align-items: center; justify-content: center;
          color: #4B5058; font-size: 14px;
          text-decoration: none;
          transition: background 0.25s, border-color 0.25s, color 0.25s, transform 0.2s;
        }
        .sk-social-btn:hover {
          background: #F59E0B;
          border-color: #F59E0B;
          color: #080808;
          transform: translateY(-3px);
          text-decoration: none;
        }

        /* ─── COLUMN HEADINGS ─── */
        .sk-col-head {
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #F59E0B; margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
        }
        .sk-col-head::after {
          content: '';
          flex: 1; height: 1px;
          background: linear-gradient(90deg, #1E1E1E, transparent);
        }

        /* ─── LINKS ─── */
        .sk-footer-link {
          display: flex; align-items: center; gap: 0;
          font-size: 13px; font-weight: 300;
          color: #4B5058; text-decoration: none;
          margin-bottom: 11px; line-height: 1;
          transition: color 0.2s, gap 0.2s;
          position: relative; padding-left: 0;
        }
        .sk-footer-link::before {
          content: '—';
          font-size: 10px;
          color: #F59E0B;
          margin-right: 0;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.2s, transform 0.2s, margin-right 0.2s;
        }
        .sk-footer-link:hover { color: #FAFAFA; text-decoration: none; }
        .sk-footer-link:hover::before {
          opacity: 1; transform: translateX(0); margin-right: 8px;
        }

        /* ─── CONTACT ITEMS ─── */
        .sk-contact-item {
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 13px; font-weight: 300;
          color: #4B5058; text-decoration: none;
          margin-bottom: 14px; line-height: 1.55;
          transition: color 0.2s;
        }
        .sk-contact-item:hover { color: #FAFAFA; text-decoration: none; }
        .sk-contact-icon {
          color: #F59E0B; font-size: 14px;
          margin-top: 1px; flex-shrink: 0;
          width: 16px; text-align: center;
        }

        /* ─── NEWSLETTER ─── */
        .sk-nl-desc {
          font-size: 13px; font-weight: 300;
          color: #4B5058; line-height: 1.72;
          margin-bottom: 18px;
        }

        .sk-nl-input-wrap {
          position: relative; margin-bottom: 10px;
        }
        .sk-nl-input {
          width: 100%; padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid #1E1E1E;
          background: #0E0E0E;
          color: #FAFAFA;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 300;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .sk-nl-input::placeholder { color: #2E2E2E; }
        .sk-nl-input:focus {
          border-color: #F59E0B;
          box-shadow: 0 0 0 3px rgba(245,158,11,0.08);
        }

        .sk-nl-btn {
          width: 100%; padding: 13px;
          border-radius: 12px;
          background: #F59E0B;
          border: none; color: #080808;
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
        }
        .sk-nl-btn:hover:not(:disabled) {
          background: #FBBF24;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(245,158,11,0.25);
        }
        .sk-nl-btn:disabled { opacity: 0.55; cursor: not-allowed; }

        .sk-nl-msg {
          font-size: 12px; font-weight: 300;
          margin-top: 10px; line-height: 1.5;
          display: flex; align-items: center; gap: 6px;
        }
        .sk-nl-msg.success { color: #10B981; }
        .sk-nl-msg.error   { color: #EF4444; }

        /* ─── DIVIDER ─── */
        .sk-footer-divider {
          border: none;
          border-top: 1px solid #111;
          margin: 0;
        }

        /* ─── BOTTOM BAR ─── */
        .sk-footer-bottom {
          padding: 22px 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
        }

        .sk-footer-copy {
          font-size: 12px; font-weight: 300;
          color: #2E3038;
          font-family: 'DM Sans', sans-serif;
        }
        .sk-footer-copy a { color: #F59E0B; text-decoration: none; }
        .sk-footer-copy a:hover { text-decoration: underline; }

        .sk-footer-bottom-links {
          display: flex; gap: 20px;
        }
        .sk-footer-bottom-link {
          font-size: 12px; font-weight: 300;
          color: #2E3038; text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .sk-footer-bottom-link:hover { color: #F59E0B; text-decoration: none; }

        /* ─── MAIN BODY AREA ─── */
        .sk-footer-body { padding: 60px 0 56px; }

        /* ─── MADE WITH BADGE ─── */
        .sk-made-badge {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 11px; font-weight: 300;
          color: #2E3038; letter-spacing: 0.04em;
          font-family: 'DM Sans', sans-serif;
        }
        .sk-made-badge i { color: #EC4899; font-size: 10px; }

        @media (max-width: 768px) {
          .sk-footer-bottom { flex-direction: column; align-items: flex-start; gap: 16px; }
          .sk-footer-brand-link { font-size: 26px; }
        }
      `}</style>

      <footer className="sk-footer">
        <div className="sk-footer-inner">

          {/* ── TOP BAND: brand + tagline + socials ── */}
          <div className="sk-footer-topband">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-5 mb-4 mb-md-0">
                  <Link href="/" className="sk-footer-brand-link">
                    Shop<span>Karo</span>
                  </Link>
                  <p className="sk-footer-tagline mb-0">
                    India's most trusted discount store — up to 90% off on kids, women &amp; men's top-brand products.
                  </p>
                </div>
                <div className="col-md-7">
                  <div className="d-flex flex-wrap align-items-center justify-content-md-end gap-3">
                    <span style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 12, color: "#2E3038", fontWeight: 300, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                      Follow us
                    </span>
                    <div className="sk-socials">
                      {socials.map(({ icon, href, label }) => (
                        <Link key={label} href={href} aria-label={label} className="sk-social-btn">
                          <i className={icon} />
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── MAIN BODY ── */}
          <div className="sk-footer-body">
            <div className="container">
              <div className="row g-5">

                {/* Contact */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="sk-col-head">Contact</div>
                  {contactItems.map(({ icon, text, href, external }) => (
                    <Link
                      key={text}
                      href={href}
                      className="sk-contact-item"
                      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                    >
                      <i className={`${icon} sk-contact-icon`} />
                      <span>{text}</span>
                    </Link>
                  ))}
                </div>

                {/* Quick Links */}
                <div className="col-6 col-sm-3 col-lg-2">
                  <div className="sk-col-head">Pages</div>
                  {quickLinks.map(({ label, href }) => (
                    <Link key={label} href={href} className="sk-footer-link">
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Policies */}
                <div className="col-6 col-sm-3 col-lg-2">
                  <div className="sk-col-head">Legal</div>
                  {policyLinks.map(({ label, href }) => (
                    <Link key={label} href={href} className="sk-footer-link">
                      {label}
                    </Link>
                  ))}
                </div>

                {/* Newsletter */}
                <div className="col-12 col-lg-5">
                  <div className="sk-col-head">Newsletter</div>
                  <p className="sk-nl-desc">
                    Subscribe and be the first to know about flash sales, new arrivals, and exclusive member-only discounts.
                  </p>
                  <form onSubmit={handleSubscribe}>
                    <div className="sk-nl-input-wrap">
                      <input
                        type="email"
                        className="sk-nl-input"
                        placeholder="your@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                      />
                    </div>
                    <button
                      type="submit"
                      className="sk-nl-btn"
                      disabled={status === "loading"}
                    >
                      {status === "loading" ? "Subscribing…" : "Subscribe — it's free"}
                    </button>
                    {message && (
                      <p className={`sk-nl-msg ${status}`}>
                        <i className={`fa-solid ${status === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`} />
                        {message}
                      </p>
                    )}
                  </form>
                </div>

              </div>
            </div>
          </div>

          {/* ── BOTTOM BAR ── */}
          <hr className="sk-footer-divider" />
          <div className="container">
            <div className="sk-footer-bottom">
              <span className="sk-footer-copy">
                © {new Date().getFullYear()} <Link href="/">ShopKaro</Link>. All rights reserved.
              </span>

              <div className="sk-made-badge">
                Made with <i className="fa-solid fa-heart" /> in India
              </div>

              <div className="sk-footer-bottom-links">
                <Link href="#" className="sk-footer-bottom-link">Privacy</Link>
                <Link href="#" className="sk-footer-bottom-link">Terms</Link>
                <Link href="#" className="sk-footer-bottom-link">Refunds</Link>
                <Link href="#" className="sk-footer-bottom-link">Sitemap</Link>
              </div>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}