"use client"
import React, { useEffect, useState, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { FreeMode, Pagination, Autoplay, Navigation } from "swiper/modules";
import { getCategory } from "../Redux/ActionCreartors/CategoryActionCreators";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";

export default function CategorySlider({ title, data }) {
  const dispatch = useDispatch();
  const [isMounted, setIsMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    setIsMounted(true);
    dispatch(getCategory());
  }, [dispatch]);

  const isPublisher = title === "Publisher";

  const swiperOptions = {
    spaceBetween: 24,
    freeMode: false,
    pagination: false,
    navigation: {
      prevEl: prevRef.current,
      nextEl: nextRef.current,
    },
    onBeforeInit: (swiper) => {
      swiper.params.navigation.prevEl = prevRef.current;
      swiper.params.navigation.nextEl = nextRef.current;
    },
    autoplay: {
      delay: 4000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true,
    },
    modules: [FreeMode, Pagination, Autoplay, Navigation],
    loop: data?.length > 4,
    onSlideChange: (swiper) => setActiveIndex(swiper.realIndex),
    breakpoints: isPublisher
      ? {
          320:  { slidesPerView: 1.2, spaceBetween: 14 },
          480:  { slidesPerView: 1.8, spaceBetween: 16 },
          640:  { slidesPerView: 2.2, spaceBetween: 18 },
          768:  { slidesPerView: 2.8, spaceBetween: 20 },
          1024: { slidesPerView: 3.5, spaceBetween: 22 },
          1280: { slidesPerView: 4,   spaceBetween: 24 },
        }
      : {
          320:  { slidesPerView: 1.2, spaceBetween: 16 },
          480:  { slidesPerView: 1.8, spaceBetween: 16 },
          640:  { slidesPerView: 2.2, spaceBetween: 20 },
          768:  { slidesPerView: 2.8, spaceBetween: 24 },
          1024: { slidesPerView: 3.5, spaceBetween: 24 },
          1280: { slidesPerView: 4,   spaceBetween: 28 },
        },
  };

  const getLinkHref = (item) => {
    if (title === "Category")    return `/shop?mc=${item.name}`;
    if (title === "Subcategory") return `/shop?sc=${item.name}`;
    return `/shop?br=${item.name}`;
  };

  // Generate a consistent colour from publisher name
  function nameToColor(name = "") {
    const palette = [
      { bg: "#FEF3E2", accent: "#C4620C", text: "#7A3A06" },
      { bg: "#EAF6F1", accent: "#0D7A50", text: "#065034" },
      { bg: "#EEF0FF", accent: "#4355C4", text: "#2A3480" },
      { bg: "#FFF0F4", accent: "#C0183B", text: "#800F27" },
      { bg: "#F3EEF9", accent: "#7C3AED", text: "#4C1D95" },
      { bg: "#FFF8E1", accent: "#B45309", text: "#78350F" },
      { bg: "#E8F4FD", accent: "#0369A1", text: "#034674" },
      { bg: "#F0FDF4", accent: "#15803D", text: "#14532D" },
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return palette[Math.abs(hash) % palette.length];
  }

  // Get initials from publisher name
  function getInitials(name = "") {
    return name.split(" ").slice(0, 2).map(w => w[0]?.toUpperCase()).join("");
  }

  if (!isMounted) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        /* ── SECTION ───────────────────────────────── */
        .cs-section {
          padding: 80px 0 96px;
          background: #F4EDE4;
          position: relative;
          overflow: hidden;
        }
        .cs-section::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          background: repeating-linear-gradient(
            90deg, #6B2737 0px, #6B2737 40px, transparent 40px, transparent 48px
          );
        }
        .cs-section::after {
          content: '';
          position: absolute; bottom: 0; left: 0; right: 0; height: 1px;
          background: rgba(107,39,55,0.15);
        }
        .cs-texture {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(107,39,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,39,55,0.04) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .cs-inner { position: relative; z-index: 1; }

        /* ── HEADER ────────────────────────────────── */
        .cs-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px; gap: 24px;
        }
        .cs-eyebrow {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #6B2737;
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 10px;
        }
        .cs-eyebrow::before {
          content: ''; display: inline-block;
          width: 28px; height: 1px; background: #6B2737;
        }
        .cs-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: clamp(2.2rem, 5vw, 3.6rem);
          font-weight: 600; color: #1A1208;
          line-height: 1; margin: 0; letter-spacing: -0.01em;
        }
        .cs-title em { font-style: italic; color: #6B2737; }
        .cs-nav { display: flex; gap: 10px; flex-shrink: 0; }
        .cs-nav-btn {
          width: 44px; height: 44px;
          border: 1.5px solid rgba(107,39,55,0.3);
          background: transparent; border-radius: 50%;
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          color: #6B2737;
          transition: all 0.25s ease;
          font-size: 18px; padding: 0; line-height: 1;
        }
        .cs-nav-btn:hover { background: #6B2737; border-color: #6B2737; color: #F4EDE4; }
        .cs-nav-btn:active { transform: scale(0.94); }
        .cs-count {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; letter-spacing: 0.12em;
          color: rgba(26,18,8,0.35); text-align: right; margin-top: 6px;
        }

        /* ── CATEGORY / SUBCATEGORY CARD (image) ────── */
        .cs-card {
          border-radius: 4px; overflow: hidden;
          cursor: pointer; height: 380px;
          position: relative; display: block; text-decoration: none;
        }
        .cs-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0;
          width: 4px; background: #C8922A; z-index: 3;
          transform: scaleY(0); transform-origin: bottom;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .cs-card:hover::before { transform: scaleY(1); }
        .cs-card-img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.6s cubic-bezier(0.4,0,0.2,1), filter 0.4s ease;
          filter: saturate(0.85) brightness(0.95);
        }
        .cs-card:hover .cs-card-img { transform: scale(1.07); filter: saturate(1) brightness(0.85); }
        .cs-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(26,18,8,.88) 0%, rgba(26,18,8,.45) 40%, transparent 70%);
          transition: background 0.4s ease; z-index: 1;
        }
        .cs-card:hover .cs-card-overlay {
          background: linear-gradient(to top, rgba(107,39,55,.92) 0%, rgba(107,39,55,.5) 50%, rgba(26,18,8,.1) 100%);
        }
        .cs-card-body {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 24px 20px; z-index: 2;
        }
        .cs-card-tag {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.62rem; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #C8922A; display: block; margin-bottom: 6px;
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.3s ease 0.05s, transform 0.3s ease 0.05s;
        }
        .cs-card:hover .cs-card-tag { opacity: 1; transform: translateY(0); }
        .cs-card-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.4rem; font-weight: 600; color: #FDFAF5;
          margin: 0 0 14px; line-height: 1.15; letter-spacing: 0.01em;
        }
        .cs-card-cta {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.75rem; font-weight: 500;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #FDFAF5; text-decoration: none;
          opacity: 0; transform: translateY(10px);
          transition: opacity 0.3s ease 0.1s, transform 0.3s ease 0.1s;
          border-bottom: 1px solid rgba(253,250,245,0.4); padding-bottom: 2px;
        }
        .cs-card:hover .cs-card-cta { opacity: 1; transform: translateY(0); }
        .cs-card-cta-arrow { transition: transform 0.2s ease; font-size: 14px; }
        .cs-card:hover .cs-card-cta-arrow { transform: translateX(4px); }
        .cs-card-num {
          position: absolute; top: 16px; right: 16px;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2.4rem; font-weight: 400;
          color: rgba(253,250,245,0.12); line-height: 1; z-index: 2;
          transition: color 0.3s ease;
          user-select: none; pointer-events: none;
        }
        .cs-card:hover .cs-card-num { color: rgba(253,250,245,0.2); }

        /* ── PUBLISHER CARD (no image) ──────────────── */
        .pb-card {
          display: flex; flex-direction: column;
          border-radius: 12px;
          border: 1.5px solid rgba(107,39,55,0.12);
          background: #FDFAF5;
          text-decoration: none;
          overflow: hidden;
          cursor: pointer;
          position: relative;
          transition: transform 0.3s cubic-bezier(.22,.68,0,1.2),
                      border-color 0.24s, box-shadow 0.3s;
          height: 100%;
          min-height: 290px;
        }
        .pb-card:hover {
          transform: translateY(-5px);
          border-color: rgba(107,39,55,0.28);
          box-shadow: 0 16px 44px rgba(107,39,55,0.1), 0 4px 12px rgba(107,39,55,0.07);
          text-decoration: none;
        }

        /* top accent bar — animates in on hover */
        .pb-card::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #6B2737, #C8922A);
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.36s cubic-bezier(.22,.68,0,1.2);
        }
        .pb-card:hover::before { transform: scaleX(1); }

        /* logo / initials zone */
        .pb-logo-zone {
          display: flex; align-items: center; justify-content: center;
          padding: 28px 20px 20px;
          flex-shrink: 0;
        }

        /* if logo image exists */
        .pb-logo-img {
          width: 80px; height: 80px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid rgba(107,39,55,0.1);
          background: #fff;
          padding: 6px;
          transition: transform 0.3s ease;
        }
        .pb-card:hover .pb-logo-img { transform: scale(1.06); }

        /* initials fallback */
        .pb-initials {
          width: 80px; height: 80px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.8rem; font-weight: 600;
          letter-spacing: -0.02em; line-height: 1;
          flex-shrink: 0;
          transition: transform 0.3s ease;
          border: 2px solid transparent;
        }
        .pb-card:hover .pb-initials { transform: scale(1.06); }

        /* body */
        .pb-body {
          flex: 1; display: flex; flex-direction: column;
          padding: 0 18px 20px; text-align: center;
        }

        /* divider */
        .pb-divider {
          width: 32px; height: 1.5px;
          margin: 0 auto 14px;
          border-radius: 2px;
        }

        .pb-name {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.2rem; font-weight: 600;
          color: #1A1208; line-height: 1.25;
          margin-bottom: 10px; letter-spacing: 0.01em;
        }

        /* info rows */
        .pb-info {
          display: flex; flex-direction: column; gap: 5px;
          margin-bottom: 14px; flex: 1;
        }
        .pb-info-row {
          display: flex; align-items: center; justify-content: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem; font-weight: 400;
          color: rgba(26,18,8,0.5);
          line-height: 1.3;
        }
        .pb-info-row i { font-size: 10px; opacity: 0.7; flex-shrink: 0; }
        .pb-info-row a {
          color: inherit; text-decoration: none;
          transition: color 0.18s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 180px; display: block;
        }
        .pb-info-row a:hover { color: #6B2737; }

        /* CTA */
        .pb-cta {
          display: inline-flex; align-items: center; justify-content: center;
          gap: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.7rem; font-weight: 600;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 9px 0; border-radius: 6px;
          border: 1.5px solid rgba(107,39,55,0.2);
          background: transparent; color: #6B2737;
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s, color 0.2s;
          width: 100%; text-align: center;
          margin-top: auto;
        }
        .pb-card:hover .pb-cta {
          background: #6B2737; border-color: #6B2737; color: #FDFAF5;
        }
        .pb-cta-arrow { font-size: 12px; transition: transform 0.2s ease; }
        .pb-card:hover .pb-cta-arrow { transform: translateX(3px); }

        /* ── SWIPER SHARED ──────────────────────────── */
        .cs-swiper { overflow: visible !important; padding-bottom: 0 !important; }
        .cs-swiper .swiper-wrapper { align-items: stretch; }
        .cs-swiper .swiper-slide { height: auto; }

        /* ── FOOTER ─────────────────────────────────── */
        .cs-footer {
          margin-top: 40px;
          display: flex; align-items: center;
          justify-content: space-between; gap: 16px;
        }
        .cs-rule { flex: 1; height: 1px; background: rgba(107,39,55,0.15); }
        .cs-total {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem; letter-spacing: 0.14em;
          text-transform: uppercase; color: rgba(26,18,8,0.4);
          white-space: nowrap;
        }

        /* ── RESPONSIVE ─────────────────────────────── */
        @media (max-width: 768px) {
          .cs-section { padding: 56px 0 72px; }
          .cs-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .cs-nav { align-self: flex-end; }
          .cs-card { height: 300px; }
          .cs-card-tag, .cs-card-cta { opacity: 1; transform: translateY(0); }
          .cs-card-num { font-size: 1.8rem; }
          .pb-card { min-height: 260px; }
        }
        @media (max-width: 480px) {
          .cs-card { height: 260px; }
          .cs-card-name { font-size: 1.15rem; }
        }
      `}</style>

      <section className="cs-section">
        <div className="cs-texture" aria-hidden="true" />
        <div className="container cs-inner">

          {/* ── Header ── */}
          <div className="cs-header">
            <div>
              <p className="cs-eyebrow">Browse by {title}</p>
              <h2 className="cs-title">
                {isPublisher ? (
                  <><em>Trusted</em> Publishers</>
                ) : title === "Subcategory" ? (
                  <><em>Explore</em> Genres</>
                ) : (
                  <><em>Shop</em> by Category</>
                )}
              </h2>
            </div>
            <div>
              <div className="cs-nav">
                <button ref={prevRef} className="cs-nav-btn" aria-label="Previous">&#8592;</button>
                <button ref={nextRef} className="cs-nav-btn" aria-label="Next">&#8594;</button>
              </div>
              <p className="cs-count">
                {String(activeIndex + 1).padStart(2, '0')} / {String(data?.length || 0).padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* ── Swiper ── */}
          <Swiper {...swiperOptions} className="cs-swiper">
            {data?.map((item, index) => {

              /* ── PUBLISHER CARD ── */
              if (isPublisher) {
                const color    = nameToColor(item.name);
                const initials = getInitials(item.name);
                const hasLogo  = !!item.logo;

                return (
                  <SwiperSlide key={item._id || item.id || index}>
                    <Link href={getLinkHref(item)} className="pb-card">

                      {/* Logo / initials */}
                      <div className="pb-logo-zone">
                        {hasLogo ? (
                          <img
                            src={`${process.env.NEXT_PUBLIC_SERVER}/${item.logo}`}
                            alt={item.name}
                            className="pb-logo-img"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className="pb-initials"
                            style={{
                              background: color.bg,
                              color: color.accent,
                              borderColor: color.accent + "33",
                            }}
                          >
                            {initials}
                          </div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="pb-body">
                        <div
                          className="pb-divider"
                          style={{ background: color.accent + "55" }}
                        />

                        <div className="pb-name">{item.name}</div>

                        <div className="pb-info">
                          {item.email && (
                            <div className="pb-info-row">
                              <i className="fa-regular fa-envelope" />
                              <a href={`mailto:${item.email}`} onClick={e => e.stopPropagation()}>
                                {item.email}
                              </a>
                            </div>
                          )}
                          {item.phone && (
                            <div className="pb-info-row">
                              <i className="fa-solid fa-phone" />
                              <a href={`tel:${item.phone}`} onClick={e => e.stopPropagation()}>
                                {item.phone}
                              </a>
                            </div>
                          )}
                          {item.website && (
                            <div className="pb-info-row">
                              <i className="fa-solid fa-globe" />
                              <a
                                href={item.website.startsWith("http") ? item.website : `https://${item.website}`}
                                target="_blank"
                                rel="noreferrer"
                                onClick={e => e.stopPropagation()}
                              >
                                {item.website.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          )}
                          {item.address && (
                            <div className="pb-info-row">
                              <i className="fa-solid fa-location-dot" />
                              <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                                {item.address}
                              </span>
                            </div>
                          )}
                          {/* fallback if no info at all */}
                          {!item.email && !item.phone && !item.website && !item.address && (
                            <div className="pb-info-row" style={{ opacity: 0.4 }}>
                              <i className="fa-regular fa-building" />
                              <span>Publisher</span>
                            </div>
                          )}
                        </div>

                        <span className="pb-cta">
                          Browse Books <span className="pb-cta-arrow">→</span>
                        </span>
                      </div>

                    </Link>
                  </SwiperSlide>
                );
              }

              /* ── CATEGORY / SUBCATEGORY CARD (image) ── */
              return (
                <SwiperSlide key={item._id || item.id || index}>
                  <Link href={getLinkHref(item)} className="cs-card">
                    <img
                      src={item.pic}
                      alt={item.name}
                      className="cs-card-img"
                      loading="lazy"
                    />
                    <div className="cs-card-overlay" />
                    <span className="cs-card-num">{String(index + 1).padStart(2, '0')}</span>
                    <div className="cs-card-body">
                      <span className="cs-card-tag">{title}</span>
                      <h3 className="cs-card-name">{item.name}</h3>
                      <span className="cs-card-cta">
                        Shop Now <span className="cs-card-cta-arrow">→</span>
                      </span>
                    </div>
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>

          {/* ── Footer ── */}
          <div className="cs-footer">
            <div className="cs-rule" />
            <span className="cs-total">
              {data?.length || 0} {title}{data?.length !== 1 ? "s" : ""} available
            </span>
            <div className="cs-rule" />
          </div>

        </div>
      </section>
    </>
  );
}