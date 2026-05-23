"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

import { createCart } from "@/Content/Redux/ActionCreartors/CartActionCreators";

// Helper: get cheapest format from formatPricing array
function getMinFormat(formatPricing = []) {
  if (!formatPricing.length) return { price: 0, finalPrice: 0, discount: 0, format: "" };
  return formatPricing.reduce((min, fp) =>
    fp.finalPrice < min.finalPrice ? fp : min, formatPricing[0]);
}

export default function BookSlider({ title, data = [] }) {
  const router      = useRouter();
  const dispatch    = useDispatch();
  const CartStateData = useSelector((state) => state.CartStateData || []);

  // Swiper drag detection — prevents click firing after a swipe
  const isDragging  = useRef(false);
  const pointerDown = useRef({ x: 0, y: 0 });

  const handleAddToCart = async (e, item) => {
    e.stopPropagation();
    if (isDragging.current) return;

    if (!item?._id) { alert("Book not found"); return; }

    const userid = localStorage.getItem("userid");
    if (!userid) { router.push("/login"); return; }

    const fmt = getMinFormat(item.formatPricing);

    const exists = CartStateData.find((x) => {
      const cartBookId = (x?.book?._id || x?.Book?._id || x?.book || x?.Book || "").toString();
      return cartBookId === item._id.toString();
    });

    if (exists) { router.push("/cart"); return; }

    await dispatch(createCart({
      user:  userid,
      book:  item._id,
      qty:   1,
      total: fmt.finalPrice || fmt.price || 0,
    }));

    router.push("/cart");
  };

  const handleViewDetails = (e, item) => {
    e.stopPropagation();
    if (isDragging.current) return;
    router.push(`/product/${item._id}`);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');

        :root {
          --sl-bg:       #F9F7F4;
          --sl-surface:  #FFFFFF;
          --sl-sand:     #F2EEE8;
          --sl-sand2:    #E8E2D9;
          --sl-ink:      #18120E;
          --sl-ink2:     #453D36;
          --sl-ink3:     #7A7168;
          --sl-ink4:     #B0A89E;
          --sl-amber:    #C4620C;
          --sl-amber2:   #E07A1A;
          --sl-green:    #0D7A50;
          --sl-green-bg: #E8F6EF;
          --sl-border:   #E6E0D8;
          --sl-border2:  #D5CEC4;
          --sl-rose:     #C0183B;
          --ff-serif:    'Playfair Display', Georgia, serif;
          --ff-sans:     'DM Sans', system-ui, sans-serif;
          --ease-spring: cubic-bezier(.22,.68,0,1.2);
        }

        .sl-wrap {
          background: var(--sl-bg);
          padding: 56px 0 72px;
          position: relative;
        }
        .sl-wrap::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 50% 60% at 50% 0%, rgba(196,98,12,.04) 0%, transparent 60%);
          pointer-events: none;
        }
        .sl-inner { position: relative; z-index: 1; }

        /* HEADER */
        .sl-header { margin-bottom: 32px; }
        .sl-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--ff-sans);
          font-size: 10px; font-weight: 600;
          letter-spacing: .22em; text-transform: uppercase;
          color: var(--sl-amber); margin-bottom: 7px;
        }
        .sl-eyebrow::before {
          content: ''; width: 18px; height: 1.5px;
          background: var(--sl-amber); flex-shrink: 0;
        }
        .sl-title {
          font-family: var(--ff-serif);
          font-size: clamp(22px, 3vw, 38px);
          font-weight: 700; color: var(--sl-ink);
          line-height: 1.06; letter-spacing: -.024em; margin: 0;
        }
        .sl-title em { font-style: italic; color: var(--sl-amber); }

        /* CARD */
        .sl-card {
          background: var(--sl-surface);
          border: 1.5px solid var(--sl-border);
          border-radius: 14px; overflow: hidden;
          display: flex; flex-direction: column;
          height: 100%;
          position: relative;
          transition: transform .3s var(--ease-spring), border-color .22s, box-shadow .3s;
          /* CRITICAL: pointer-events must be auto for buttons to work */
          pointer-events: auto;
        }
        .sl-card:hover {
          transform: translateY(-5px);
          border-color: var(--sl-border2);
          box-shadow: 0 14px 40px rgba(24,18,14,.09), 0 3px 10px rgba(24,18,14,.05);
        }
        .sl-card::after {
          content: ''; position: absolute; bottom: 0; left: 0;
          width: 0; height: 2px;
          background: linear-gradient(90deg, var(--sl-amber), var(--sl-amber2));
          transition: width .36s var(--ease-spring);
          border-radius: 0 0 14px 14px;
        }
        .sl-card:hover::after { width: 100%; }

        /* IMAGE */
        .sl-img-wrap {
          background: var(--sl-sand); position: relative; overflow: hidden;
          aspect-ratio: 3 / 4; flex-shrink: 0;
        }
        .sl-img-wrap img {
          width: 100%; height: 100%;
          object-fit: cover; display: block;
          transition: transform .36s var(--ease-spring);
          /* prevent native drag interfering */
          -webkit-user-drag: none; user-select: none;
        }
        .sl-card:hover .sl-img-wrap img { transform: scale(1.05); }

        .sl-rating {
          position: absolute; top: 9px; right: 9px;
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(196,98,12,.2);
          color: var(--sl-amber);
          font-family: var(--ff-sans);
          font-size: 10px; font-weight: 700;
          padding: 3px 9px; border-radius: 999px;
          display: flex; align-items: center; gap: 3px;
        }

        /* BODY — centred */
        .sl-body {
          flex: 1; display: flex; flex-direction: column;
          align-items: center; text-align: center;
          padding: 13px 13px 15px;
          border-top: 1px solid var(--sl-sand2);
        }

        .sl-book-title {
          font-family: var(--ff-sans);
          font-size: 12.5px; font-weight: 500;
          color: var(--sl-ink2); line-height: 1.45;
          display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
          min-height: calc(12.5px * 1.45 * 2);
          width: 100%; margin-bottom: 4px;
        }

        .sl-author {
          font-family: var(--ff-sans);
          font-size: 10.5px; color: var(--sl-ink4); font-weight: 300;
          margin-bottom: 8px; width: 100%;
        }

        .sl-format-tag {
          font-family: var(--ff-sans);
          font-size: 9px; font-weight: 600;
          letter-spacing: .06em; text-transform: uppercase;
          color: var(--sl-amber);
          background: rgba(196,98,12,.08);
          padding: 2px 8px; border-radius: 999px;
          margin-bottom: 9px;
        }

        .sl-price-row {
          display: flex; align-items: baseline; justify-content: center;
          gap: 5px; flex-wrap: wrap;
          margin-top: auto; margin-bottom: 11px; width: 100%;
        }
        .sl-price {
          font-family: var(--ff-serif);
          font-size: 17px; font-weight: 700;
          color: var(--sl-ink); letter-spacing: -.02em;
        }
        .sl-old {
          font-family: var(--ff-sans);
          font-size: 11px; color: var(--sl-ink4);
          text-decoration: line-through; font-weight: 300;
        }
        .sl-off {
          font-family: var(--ff-sans);
          font-size: 9.5px; font-weight: 700;
          color: var(--sl-green); background: var(--sl-green-bg);
          padding: 2px 6px; border-radius: 999px;
        }

        /* BUTTONS — full-width, stacked, pointer-events explicit */
        .sl-btns { display: flex; flex-direction: column; gap: 6px; width: 100%; }

        .sl-btn-cart,
        .sl-btn-details {
          width: 100%; border-radius: 9px;
          font-family: var(--ff-sans);
          font-size: 11px; font-weight: 600;
          letter-spacing: .07em; text-transform: uppercase;
          padding: 9px 0; cursor: pointer;
          /* CRITICAL: explicit pointer-events so Swiper doesn't swallow clicks */
          pointer-events: auto;
          position: relative; z-index: 10;
          transition: background .2s, transform .14s, border-color .2s, color .2s;
        }

        .sl-btn-cart {
          border: none;
          background: var(--sl-ink); color: #fff;
        }
        .sl-btn-cart:hover { background: var(--sl-amber); transform: translateY(-1px); }

        .sl-btn-details {
          border: 1.5px solid var(--sl-border2);
          background: transparent; color: var(--sl-ink3);
        }
        .sl-btn-details:hover {
          border-color: var(--sl-ink2); color: var(--sl-ink); background: var(--sl-sand);
        }

        /* SWIPER */
        .sl-swiper { overflow: visible !important; }
        .sl-swiper .swiper-slide {
          height: auto !important;
          /* allow button clicks through swiper's touch layer */
          pointer-events: auto !important;
        }
        .sl-swiper .swiper-wrapper { align-items: stretch; }
      `}</style>

      <section className="sl-wrap">
        <div className="sl-inner">
          <div className="container">

            <div className="sl-header">
              <div className="sl-eyebrow">Featured books</div>
              <h2 className="sl-title">
                <em>{title || "Latest"}</em> picks
              </h2>
            </div>

            <Swiper
              className="sl-swiper"
              modules={[Autoplay]}
              breakpoints={{
                0:    { slidesPerView: 2, spaceBetween: 12 },
                768:  { slidesPerView: 3, spaceBetween: 16 },
                1024: { slidesPerView: 4, spaceBetween: 18 },
              }}
              loop={data.length > 4}
              autoplay={{ delay: 2800, disableOnInteraction: false, pauseOnMouseEnter: true }}
              // Use touchStartPreventDefault:false so native click events fire normally
              touchStartPreventDefault={false}
              onSliderMove={() => { isDragging.current = true; }}
              onTouchStart={() => { isDragging.current = false; }}
              onTouchEnd={() => { setTimeout(() => { isDragging.current = false; }, 100); }}
            >
              {data.map((item) => {
                const fmt        = getMinFormat(item.formatPricing);
                const price      = fmt.price;
                const finalPrice = fmt.finalPrice;
                const discount   = fmt.discount;

                return (
                  <SwiperSlide key={item._id}>
                    <div className="sl-card">

                      {/* Image — clicking image navigates to product */}
                      <div
                        className="sl-img-wrap"
                        onClick={() => router.push(`/product/${item._id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <img
                          src={item.pic}
                          alt={item.title}
                          loading="lazy"
                          draggable={false}
                        />
                        {item.rating > 0 && (
                          <div className="sl-rating">{item.rating} ★</div>
                        )}
                      </div>

                      {/* Body */}
                      <div className="sl-body">
                        <div
                          className="sl-book-title pb-0 mb-0"
                          onClick={() => router.push(`/product/${item._id}`)}
                          style={{ cursor: "pointer" }}
                        >
                          {item.title}
                        </div>

                        <div className="sl-author mt-0 pt-0 ">{item.author}</div>

                        {fmt.format && (
                          <div className="sl-format-tag">{fmt.format}</div>
                        )}

                        <div className="sl-price-row">
                          <span className="sl-price">&#8377;{finalPrice}</span>
                          {price > finalPrice && (
                            <span className="sl-old">&#8377;{price}</span>
                          )}
                          {discount > 0 && (
                            <span className="sl-off">{discount}% off</span>
                          )}
                        </div>

                        <div className="sl-btns">
                          <button
                            type="button"
                            className="sl-btn-cart"
                            onClick={(e) => handleAddToCart(e, item)}
                          >
                            <i className="fa fa-shopping-cart me-1" />
                            Add to cart
                          </button>
                          <button
                            type="button"
                            className="sl-btn-details"
                            onClick={(e) => handleViewDetails(e, item)}
                          >
                            View details
                          </button>
                        </div>
                      </div>

                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

          </div>
        </div>
      </section>
    </>
  );
}