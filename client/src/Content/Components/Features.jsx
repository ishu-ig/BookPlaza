"use client";
import Link from "next/link";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { Autoplay } from "swiper/modules";

const features = [
  { icon: "fa-solid fa-medal",        title: "Top Brands",        desc: "Curated authentic products from the world's most coveted labels — verified before they reach you.",   accentColor: "#D97706", accentBg: "rgba(245,158,11,0.10)",  number: "01" },
  { icon: "fa-solid fa-shield-halved", title: "100% Original",    desc: "Every item passes our rigorous authenticity check. Zero counterfeits. Zero compromises. Ever.",       accentColor: "#059669", accentBg: "rgba(16,185,129,0.10)",   number: "02" },
  { icon: "fa-solid fa-rotate-left",   title: "7-Day Returns",    desc: "Changed your mind? No questions asked. Free, hassle-free returns within 7 days of delivery.",         accentColor: "#2563EB", accentBg: "rgba(59,130,246,0.10)",   number: "03" },
  { icon: "fa-solid fa-headset",       title: "24/7 Support",     desc: "Real humans, always on. Reach us anytime via live chat, phone call, or WhatsApp message.",            accentColor: "#DB2777", accentBg: "rgba(236,72,153,0.10)",   number: "04" },
  { icon: "fa-solid fa-users",         title: "1 Lakh+ Customers",desc: "Trusted by over a lakh happy shoppers across India — and growing every single day.",                  accentColor: "#7C3AED", accentBg: "rgba(139,92,246,0.10)",   number: "05" },
  { icon: "fa-solid fa-truck-fast",    title: "Express Delivery", desc: "Same-day and next-day delivery available in select cities. Track every step of the journey.",         accentColor: "#EA580C", accentBg: "rgba(249,115,22,0.10)",   number: "06" },
];

function FeatureCard({ icon, title, desc, accentColor, accentBg, number }) {
  return (
    <div className="feat-card">
      <span className="feat-number">{number}</span>
      <div className="feat-icon-wrap" style={{ background: accentBg }}>
        <i className={icon} style={{ color: accentColor }} />
      </div>
      <h3 className="feat-title">{title}</h3>
      <p className="feat-desc">{desc}</p>
      <Link href="/shop" className="feat-link" style={{ color: accentColor }}>
        Explore <i className="fa-solid fa-arrow-right" />
      </Link>
      <div className="feat-accent-line" style={{ background: accentColor }} />
    </div>
  );
}

export default function Features() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .feat-section {
          background: #FFFAF5;
          padding: 100px 0 108px;
          position: relative;
          overflow: hidden;
        }
        .feat-section::before {
          content: '';
          position: absolute;
          top: -160px; right: -160px;
          width: 520px; height: 520px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(245,158,11,0.07) 0%, transparent 70%);
          pointer-events: none;
        }

        .feat-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #D97706; margin-bottom: 18px;
        }
        .feat-eyebrow::before {
          content: ''; display: block;
          width: 28px; height: 1.5px; background: #D97706; flex-shrink: 0;
        }

        .feat-heading {
          font-family: 'Syne', sans-serif;
          font-size: clamp(30px, 4vw, 52px);
          font-weight: 800; color: #1A1208;
          line-height: 1.06; letter-spacing: -0.03em; margin-bottom: 16px;
        }
        .feat-heading em { font-style: italic; color: #D97706; }

        .feat-subhead {
          font-family: 'DM Sans', sans-serif;
          font-size: 15px; font-weight: 300;
          color: #7C6A52; max-width: 420px;
          line-height: 1.78; margin-bottom: 0;
        }

        .feat-card {
          position: relative;
          background: #FFFFFF;
          border: 1px solid #EDE3D5;
          border-radius: 20px; padding: 32px 26px 30px;
          height: 100%; overflow: hidden;
          transition: transform 0.35s cubic-bezier(.22,.68,0,1.2),
                      border-color 0.3s, box-shadow 0.3s;
        }
        .feat-card:hover {
          transform: translateY(-8px);
          border-color: #D9CCC0;
          box-shadow: 0 24px 56px rgba(120,80,30,0.10);
        }
        .feat-card:hover .feat-accent-line { width: 100%; }
        .feat-card:hover .feat-icon-wrap { transform: scale(1.1) rotate(-6deg); }

        .feat-number {
          position: absolute; top: 22px; right: 22px;
          font-family: 'Syne', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.12em; color: #D9CEC4;
        }

        .feat-icon-wrap {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
          transition: transform 0.3s ease;
        }

        .feat-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px; font-weight: 700;
          color: #1A1208; margin-bottom: 10px;
          letter-spacing: -0.01em;
        }

        .feat-desc {
          font-family: 'DM Sans', sans-serif;
          font-size: 13px; font-weight: 300;
          color: #9A8472; line-height: 1.78; margin-bottom: 20px;
        }

        .feat-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          letter-spacing: 0.05em; text-decoration: none;
          display: inline-flex; align-items: center; gap: 7px;
          transition: gap 0.2s, opacity 0.2s;
        }
        .feat-link:hover { gap: 12px; opacity: 0.7; text-decoration: none; }
        .feat-link i { font-size: 11px; }

        .feat-accent-line {
          position: absolute; bottom: 0; left: 0;
          height: 2.5px; width: 34px;
          border-radius: 0 2px 0 0;
          transition: width 0.45s cubic-bezier(.22,.68,0,1.2);
        }

        .feat-stats-strip {
          display: grid; grid-template-columns: repeat(4, 1fr);
          gap: 1px; background: #EDE3D5;
          border: 1px solid #EDE3D5; border-radius: 18px;
          overflow: hidden; margin-top: 64px;
        }
        @media (max-width: 576px) {
          .feat-stats-strip { grid-template-columns: repeat(2, 1fr); }
        }
        .feat-stat {
          background: #FFFFFF; padding: 30px 20px;
          text-align: center; transition: background 0.25s;
        }
        .feat-stat:hover { background: #FFFAF5; }
        .feat-stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #D97706; letter-spacing: -0.03em;
          line-height: 1; margin-bottom: 7px;
        }
        .feat-stat-lbl {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px; font-weight: 300;
          color: #9A8472; letter-spacing: 0.08em; text-transform: uppercase;
        }

        .feat-swiper .swiper-slide { height: auto; }
      `}</style>

      <section className="feat-section">
        <div className="container">
          <div className="row align-items-end mb-5">
            <div className="col-lg-7">
              <div className="feat-eyebrow">Why ShopKaro</div>
              <h2 className="feat-heading">Built for <em>smart</em><br />shoppers</h2>
              <p className="feat-subhead">Six pillars that set us apart — from first browse to doorstep delivery.</p>
            </div>
          </div>

          {/* Desktop grid */}
          <div className="row g-3 d-none d-md-flex">
            {features.map((f, i) => (
              <div className="col-md-6 col-lg-4" key={i}><FeatureCard {...f} /></div>
            ))}
          </div>

          {/* Mobile swiper */}
          <div className="d-md-none">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 2800, disableOnInteraction: false }}
              spaceBetween={14}
              slidesPerView={1.12}
              loop
              className="feat-swiper"
            >
              {features.map((f, i) => (
                <SwiperSlide key={i}><FeatureCard {...f} /></SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Stats strip */}
          <div className="feat-stats-strip">
            <div className="feat-stat"><div className="feat-stat-val">1L+</div><div className="feat-stat-lbl">Customers</div></div>
            <div className="feat-stat"><div className="feat-stat-val">500+</div><div className="feat-stat-lbl">Brands</div></div>
            <div className="feat-stat"><div className="feat-stat-val">99%</div><div className="feat-stat-lbl">Authentic</div></div>
            <div className="feat-stat"><div className="feat-stat-val">24/7</div><div className="feat-stat-lbl">Support</div></div>
          </div>
        </div>
      </section>
    </>
  );
}