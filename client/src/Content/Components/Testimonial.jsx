"use client";
import React, { useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";
import { useDispatch, useSelector } from "react-redux";
import { getTestimonial } from "../Redux/ActionCreartors/TestimonialActionCreators";

const stats = [
  { value: "10K+", label: "Happy customers" },
  { value: "4.8★", label: "Average rating" },
  { value: "99%", label: "Positive feedback" },
  { value: "24/7", label: "Customer support" },
];

function avatarColor(name = "") {
  const colors = [
    { bg: "#EDE9FE", text: "#5B21B6" },
    { bg: "#D1FAE5", text: "#065F46" },
    { bg: "#FEE2E2", text: "#991B1B" },
    { bg: "#E0F2FE", text: "#075985" },
    { bg: "#FEF3C7", text: "#92400E" },
    { bg: "#FCE7F3", text: "#9D174D" },
  ];
  const idx = name.charCodeAt(0) % colors.length;
  return colors[idx];
}

function initials(name = "") {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function Testimonial() {
  const dispatch = useDispatch();
  const TestimonialStateData = useSelector(
    (state) => state.TestimonialStateData
  );

  useEffect(() => {
    dispatch(getTestimonial());
  }, [dispatch]);

  const active = TestimonialStateData?.filter((x) => x.active) ?? [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

        .testi-section {
          padding: 48px 0 56px;
          background: #FFFAF5;
          font-family: 'DM Sans', sans-serif;
        }

        .testi-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #D97706; margin-bottom: 10px;
        }
        .testi-eyebrow::before {
          content: ''; display: block;
          width: 22px; height: 1.5px; background: #D97706; flex-shrink: 0;
        }

        .testi-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(20px, 2.8vw, 32px);
          font-weight: 800; color: #1A1208;
          letter-spacing: -0.02em; margin-bottom: 6px;
        }

        .testi-sub {
          font-size: 13px; font-weight: 300;
          color: #7C6A52; margin-bottom: 0;
        }

        /* Card */
        .testi-card {
          background: #FFFFFF;
          border: 1px solid #EDE3D5;
          border-radius: 16px;
          padding: 16px 16px;
          display: flex;
          flex-direction: column;
          height: 100%;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s;
        }
        .testi-card:hover {
          transform: translateY(-3px);
          border-color: #D9CCC0;
          box-shadow: 0 12px 32px rgba(120,80,30,0.09);
        }

        .testi-avatar {
          width: 38px; height: 38px;
          border-radius: 50%; object-fit: cover; flex-shrink: 0;
        }

        .testi-avatar-fallback {
          width: 38px; height: 38px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }

        .testi-name {
          font-family: 'Syne', sans-serif;
          font-size: 13px; font-weight: 700;
          color: #1A1208; margin-bottom: 1px;
        }

        .testi-stars {
          font-size: 11px; color: #D97706; letter-spacing: 1px;
        }

        .testi-message {
          font-size: 13px; color: #7C6A52;
          line-height: 1.7; font-style: italic; flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .testi-quote {
          font-size: 32px; color: #EDE3D5;
          line-height: 1; margin-bottom: 6px;
          font-family: Georgia, serif; font-style: normal;
        }

        /* Swiper dots */
        .testi-swiper .swiper-pagination-bullet {
          background: #D9CEC4; opacity: 1; width: 7px; height: 7px;
        }
        .testi-swiper .swiper-pagination-bullet-active {
          background: #D97706; width: 20px; border-radius: 4px;
        }

        /* Stat cards */
        .stat-card {
          background: #FFFFFF;
          border: 1px solid #EDE3D5;
          border-radius: 12px; padding: 14px 10px; text-align: center;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          border-color: #D9CCC0;
          box-shadow: 0 6px 18px rgba(120,80,30,0.07);
        }

        .stat-value {
          font-family: 'Syne', sans-serif;
          font-size: 20px; font-weight: 800;
          color: #D97706; letter-spacing: -0.02em; margin-bottom: 2px;
        }

        .stat-label {
          font-size: 11px; font-weight: 300; color: #9A8472;
          letter-spacing: 0.06em; text-transform: uppercase;
        }

        /* CTA banner */
        .testi-cta {
          background: #1A1208;
          border-radius: 16px; padding: 28px 32px;
          color: #fff; margin-top: 36px;
          position: relative; overflow: hidden;
        }
        .testi-cta::before {
          content: '';
          position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: radial-gradient(circle, rgba(217,119,6,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .testi-cta h2 {
          font-family: 'Syne', sans-serif;
          font-size: clamp(16px, 2vw, 22px); font-weight: 800;
          color: #FFFAF5; margin-bottom: 6px; letter-spacing: -0.02em;
        }

        .testi-cta p {
          font-size: 13px; font-weight: 300;
          color: rgba(255,250,245,0.65); margin-bottom: 0;
        }

        .btn-cta-shop {
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 500;
          padding: 10px 24px; border-radius: 100px;
          background: #D97706; border: none;
          color: #fff; text-decoration: none;
          display: inline-block; letter-spacing: 0.04em;
          transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
          white-space: nowrap;
        }
        .btn-cta-shop:hover {
          transform: translateY(-2px);
          background: #B45309;
          box-shadow: 0 8px 24px rgba(180,83,9,0.30);
          color: #fff; text-decoration: none;
        }

        @media (max-width: 575px) {
          .testi-section { padding: 36px 0 44px; }
          .testi-cta { padding: 22px 20px; }
        }
      `}</style>

      <section className="testi-section">
        <div className="container">

          {/* Heading */}
          <div className="text-center mb-4">
            <div className="testi-eyebrow" style={{ justifyContent: "center" }}>
              Social proof
            </div>
            <h2 className="testi-title">What our clients say</h2>
            <p className="testi-sub">Real feedback from verified buyers</p>
          </div>

          {/* Swiper */}
          <Swiper
            loop
            grabCursor
            pagination={{ clickable: true }}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            modules={[Pagination, Autoplay]}
            breakpoints={{
              0:    { slidesPerView: 1, spaceBetween: 12 },
              640:  { slidesPerView: 2, spaceBetween: 16 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="testi-swiper pb-4"
          >
            {active.map((item) => {
              const av = avatarColor(item.name);
              return (
                <SwiperSlide key={item._id} style={{ height: "auto" }}>
                  <div className="testi-card">
                    <div className="testi-quote">"</div>
                    <p className="testi-message">{item.message}</p>
                    <div className="d-flex align-items-center gap-2 mt-2">
                      {item.pic ? (
                        <img
                          src={item.pic}
                          alt={item.name}
                          className="testi-avatar"
                        />
                      ) : (
                        <div
                          className="testi-avatar-fallback"
                          style={{ background: av.bg, color: av.text }}
                        >
                          {initials(item.name)}
                        </div>
                      )}
                      <div>
                        <div className="testi-name">{item.name}</div>
                        <div className="testi-stars">★★★★★</div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* Stats */}
          <div className="row g-2 mt-1">
            {stats.map((s) => (
              <div className="col-6 col-md-3" key={s.label}>
                <div className="stat-card">
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="testi-cta d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div>
              <h2>Join thousands of happy customers</h2>
              <p>Experience quality products and trusted service, delivered fast.</p>
            </div>
            <a href="/shop" className="btn-cta-shop flex-shrink-0">
              Start shopping →
            </a>
          </div>

        </div>
      </section>
    </>
  );
}