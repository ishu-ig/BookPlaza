"use client";
import Link from "next/link";
import React, { useState } from "react";

// Helper: get the cheapest format's pricing from formatPricing array
function getMinFormat(formatPricing = []) {
  if (!formatPricing.length) return { price: 0, finalPrice: 0, discount: 0 };
  return formatPricing.reduce((min, fp) =>
    fp.finalPrice < min.finalPrice ? fp : min, formatPricing[0]);
}

export default function Book({ title, data }) {
  const [visibleCount, setVisibleCount] = useState(12);
  const [wishlist, setWishlist] = useState({});

  const loadMore = () => setVisibleCount((p) => p + 12);
  const viewLess = () => setVisibleCount(12);
  const toggleWishlist = (id) =>
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --c-bg:       #F9F7F4;
          --c-surface:  #FFFFFF;
          --c-sand:     #F2EEE8;
          --c-sand2:    #E8E2D9;
          --c-ink:      #18120E;
          --c-ink2:     #453D36;
          --c-ink3:     #7A7168;
          --c-ink4:     #B0A89E;
          --c-amber:    #C4620C;
          --c-amber2:   #E07A1A;
          --c-rose:     #C0183B;
          --c-green:    #0D7A50;
          --c-green-bg: #E8F6EF;
          --c-border:   #E6E0D8;
          --c-border2:  #D5CEC4;
          --ff-serif:   'Playfair Display', Georgia, serif;
          --ff-sans:    'DM Sans', system-ui, sans-serif;
          --rad-card:   16px;
          --rad-pill:   999px;
          --rad-btn:    10px;
          --ease-spring: cubic-bezier(.22,.68,0,1.2);
        }

        .bk-section {
          background: var(--c-bg);
          padding: 64px 0 88px;
          position: relative;
        }
        .bk-section::before {
          content: '';
          position: absolute; inset: 0;
          background:
            radial-gradient(ellipse 60% 40% at 2% 2%, rgba(196,98,12,.05) 0%, transparent 55%),
            radial-gradient(ellipse 40% 60% at 98% 98%, rgba(196,98,12,.04) 0%, transparent 55%);
          pointer-events: none;
        }
        .bk-inner { position: relative; z-index: 1; }

        /* HEADER */
        .bk-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
          margin-bottom: 6px;
        }
        .bk-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--ff-sans);
          font-size: 10px; font-weight: 600;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--c-amber); margin-bottom: 8px;
        }
        .bk-eyebrow::before {
          content: '';
          width: 20px; height: 1.5px;
          background: var(--c-amber); flex-shrink: 0;
        }
        .bk-title {
          font-family: var(--ff-serif);
          font-size: clamp(24px, 3.5vw, 44px);
          font-weight: 700; color: var(--c-ink);
          line-height: 1.06; letter-spacing: -.025em; margin: 0;
        }
        .bk-title em { font-style: italic; color: var(--c-amber); }

        .bk-viewall {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: var(--ff-sans);
          font-size: 11px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          color: var(--c-ink2);
          border: 1.5px solid var(--c-border2);
          background: var(--c-surface);
          padding: 10px 22px; border-radius: var(--rad-pill);
          text-decoration: none; white-space: nowrap; align-self: center;
          transition: color .2s, background .2s, border-color .2s;
        }
        .bk-viewall:hover {
          background: var(--c-amber); border-color: var(--c-amber);
          color: #fff; text-decoration: none;
        }
        .bk-viewall i { font-size: 10px; transition: transform .2s; }
        .bk-viewall:hover i { transform: translateX(3px); }

        .bk-divider {
          height: 1px;
          background: linear-gradient(90deg, var(--c-border2) 0%, transparent 75%);
          margin: 24px 0 40px;
        }

        /* GRID */
        .bk-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 991px) { .bk-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 639px)  { .bk-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; } }

        /* CARD */
        .bk-card {
          background: var(--c-surface);
          border: 1.5px solid var(--c-border);
          border-radius: var(--rad-card);
          overflow: hidden;
          display: flex; flex-direction: column;
          position: relative;
          transition: transform .32s var(--ease-spring), border-color .24s, box-shadow .32s;
        }
        .bk-card:hover {
          transform: translateY(-6px);
          border-color: var(--c-border2);
          box-shadow: 0 18px 48px rgba(24,18,14,.1), 0 4px 14px rgba(24,18,14,.06);
        }
        .bk-card::after {
          content: '';
          position: absolute; bottom: 0; left: 0;
          width: 0; height: 2.5px;
          background: linear-gradient(90deg, var(--c-amber), var(--c-amber2));
          transition: width .38s var(--ease-spring);
          border-radius: 0 0 var(--rad-card) var(--rad-card);
        }
        .bk-card:hover::after { width: 100%; }

        /* IMAGE */
        .bk-img-wrap {
          background: var(--c-sand);
          position: relative; overflow: hidden;
          aspect-ratio: 3 / 4; flex-shrink: 0;
        }
        .bk-img-wrap img {
          width: 100%; height: 100%;
          object-fit: contain; padding: 16px; display: block;
          transition: transform .38s var(--ease-spring);
        }
        .bk-card:hover .bk-img-wrap img { transform: scale(1.055); }

        .bk-badge {
          position: absolute; top: 10px; left: 10px;
          background: var(--c-amber); color: #fff;
          font-family: var(--ff-sans);
          font-size: 9px; font-weight: 700;
          letter-spacing: .07em; text-transform: uppercase;
          padding: 3px 9px; border-radius: var(--rad-pill);
        }

        .bk-wish {
          position: absolute; top: 10px; right: 10px;
          width: 32px; height: 32px; border-radius: 50%;
          border: 1.5px solid var(--c-border);
          background: rgba(255,255,255,.9);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 13px; color: var(--c-ink4);
          transition: color .2s, border-color .2s, background .2s, transform .2s;
        }
        .bk-wish:hover, .bk-wish.on {
          color: var(--c-rose); border-color: rgba(192,24,59,.28); background: #FFF0F4;
        }
        .bk-wish.on { transform: scale(1.1); }

        .bk-qv {
          position: absolute; bottom: 11px; left: 50%;
          transform: translateX(-50%) translateY(10px);
          background: var(--c-ink); color: #fff;
          font-family: var(--ff-sans);
          font-size: 9px; font-weight: 600;
          letter-spacing: .14em; text-transform: uppercase;
          padding: 7px 18px; border-radius: var(--rad-pill);
          white-space: nowrap; opacity: 0; pointer-events: none;
          text-decoration: none;
          transition: opacity .22s, transform .22s, background .18s;
        }
        .bk-card:hover .bk-qv {
          opacity: 1; transform: translateX(-50%) translateY(0); pointer-events: auto;
        }
        .bk-qv:hover { background: var(--c-amber); color: #fff; text-decoration: none; }

        /* BODY — text-align center as requested */
        .bk-body {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 14px 14px 16px;
          border-top: 1px solid var(--c-sand2);
        }

        .bk-name {
          font-family: var(--ff-sans);
          font-size: 13px; font-weight: 500;
          color: var(--c-ink2); line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          min-height: calc(13px * 1.45 * 2);
          text-decoration: none; width: 100%;
          transition: color .18s; margin-bottom: 6px;
        }
        .bk-name:hover { color: var(--c-ink); text-decoration: none; }

        .bk-author {
          font-family: var(--ff-sans);
          font-size: 11px; color: var(--c-ink4); font-weight: 300;
          margin-bottom: 10px; width: 100%;
        }

        /* price row — centred, pushed to bottom */
        .bk-price-row {
          display: flex; align-items: baseline; justify-content: center;
          gap: 6px; flex-wrap: wrap;
          margin-top: auto; margin-bottom: 12px; width: 100%;
        }
        .bk-price {
          font-family: var(--ff-serif);
          font-size: 19px; font-weight: 700;
          color: var(--c-ink); letter-spacing: -.02em;
        }
        .bk-old {
          font-family: var(--ff-sans);
          font-size: 11.5px; color: var(--c-ink4);
          text-decoration: line-through; font-weight: 300;
        }
        .bk-save {
          font-family: var(--ff-sans);
          font-size: 10px; font-weight: 600;
          color: var(--c-green); background: var(--c-green-bg);
          padding: 2px 7px; border-radius: var(--rad-pill);
        }

        .bk-format-tag {
          font-family: var(--ff-sans);
          font-size: 9px; font-weight: 600;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--c-amber);
          background: rgba(196,98,12,.08);
          padding: 2px 8px; border-radius: var(--rad-pill);
          margin-bottom: 10px;
        }

        .bk-cart {
          display: block; width: 100%; text-align: center;
          font-family: var(--ff-sans);
          font-size: 11px; font-weight: 600;
          letter-spacing: .09em; text-transform: uppercase;
          padding: 10px 0; border-radius: var(--rad-btn);
          border: 1.5px solid var(--c-border2);
          background: transparent; color: var(--c-ink3);
          text-decoration: none; cursor: pointer;
          transition: background .2s, border-color .2s, color .2s, transform .14s;
        }
        .bk-cart:hover {
          background: var(--c-ink); border-color: var(--c-ink);
          color: #fff; transform: translateY(-1px); text-decoration: none;
        }

        @keyframes bkFadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .bk-anim { animation: bkFadeUp .42s ease both; }

        .bk-controls {
          display: flex; justify-content: center;
          align-items: center; gap: 12px;
          flex-wrap: wrap; margin-top: 48px;
        }
        .bk-btn-load {
          font-family: var(--ff-sans);
          font-size: 12px; font-weight: 600;
          letter-spacing: .08em; text-transform: uppercase;
          padding: 13px 44px; border-radius: var(--rad-pill);
          background: var(--c-ink); border: none; color: #fff;
          cursor: pointer;
          transition: background .2s, transform .14s;
        }
        .bk-btn-load:hover { background: var(--c-amber); transform: translateY(-2px); }

        .bk-btn-less {
          font-family: var(--ff-sans);
          font-size: 12px; font-weight: 400; letter-spacing: .04em;
          padding: 13px 44px; border-radius: var(--rad-pill);
          background: transparent; border: 1.5px solid var(--c-border2);
          color: var(--c-ink3); cursor: pointer;
          transition: border-color .2s, color .2s, background .2s;
        }
        .bk-btn-less:hover {
          border-color: var(--c-ink2); color: var(--c-ink); background: var(--c-sand);
        }

        .bk-empty { text-align: center; padding: 80px 0; }
        .bk-empty i { font-size: 40px; color: var(--c-border2); display: block; margin-bottom: 14px; }
        .bk-empty p { font-family: var(--ff-sans); font-size: 14px; font-weight: 300; color: var(--c-ink4); }

        @media (max-width: 576px) { .bk-section { padding: 48px 0 64px; } }
      `}</style>

      <section className="bk-section pt-0 mt-0">
        <div className="bk-inner">
          <div className="container">

            {title !== "Shop" && (
              <>
                <div className="bk-header">
                  <div>
                    <div className="bk-eyebrow">Our collection</div>
                    <h2 className="bk-title">For <em>{title}</em></h2>
                  </div>
                  <Link href={`/shop?mc=${title}`} className="bk-viewall">
                    View all <i className="fa-solid fa-arrow-right" />
                  </Link>
                </div>
                <div className="bk-divider" />
              </>
            )}

            {data.length === 0 ? (
              <div className="bk-empty">
                <i className="fa-regular fa-box-open" />
                <p>No products found in this category.</p>
              </div>
            ) : (
              <div className="bk-grid">
                {data.slice(0, visibleCount).map((item, idx) => {
                  // ── pull price from formatPricing array ──
                  const fmt      = getMinFormat(item.formatPricing);
                  const price      = fmt.price;
                  const finalPrice = fmt.finalPrice;
                  const discount   = fmt.discount;
                  const savings    = price > finalPrice ? Math.round(price - finalPrice) : null;
                  const isWishlisted = wishlist[item._id];

                  return (
                    <div
                      key={item._id}
                      className="bk-card bk-anim"
                      style={{ animationDelay: `${(idx % 12) * 36}ms` }}
                    >
                      {/* Image */}
                      <div className="bk-img-wrap">
                        <Link href={`/product/${item._id}`}>
                          <img
                            src={item.pic}
                            alt={item.title}
                          />
                        </Link>
                        {discount > 0 && (
                          <span className="bk-badge">{discount}% off</span>
                        )}
                        <button
                          className={`bk-wish ${isWishlisted ? "on" : ""}`}
                          onClick={() => toggleWishlist(item._id)}
                          aria-label="Toggle wishlist"
                        >
                          <i className={isWishlisted ? "fa-solid fa-heart" : "fa-regular fa-heart"} />
                        </button>
                        <Link href={`/product/${item._id}`} className="bk-qv">
                          Quick view
                        </Link>
                      </div>

                      {/* Body — centred */}
                      <div className="bk-body">
                        <Link href={`/product/${item._id}`} className="bk-name">
                          {item.title}
                        </Link>
                        <div className="bk-author">{item.author}</div>

                        {item.formatPricing?.length > 0 && (
                          <div className="bk-format-tag">{fmt.format}</div>
                        )}

                        <div className="bk-price-row">
                          <span className="bk-price">&#8377;{finalPrice}</span>
                          {savings > 0 && (
                            <span className="bk-old">&#8377;{price}</span>
                          )}
                          {savings > 0 && (
                            <span className="bk-save">&#8722;&#8377;{savings}</span>
                          )}
                        </div>

                        <Link href={`/product/${item._id}`} className="bk-cart">
                          View &amp; Add to cart
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {data.length > 0 && (
              <div className="bk-controls">
                {visibleCount < data.length && (
                  <button className="bk-btn-load" onClick={loadMore}>
                    Load more products
                  </button>
                )}
                {visibleCount > 12 && (
                  <button className="bk-btn-less" onClick={viewLess}>
                    View less
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </section>
    </>
  );
}