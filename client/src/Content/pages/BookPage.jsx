"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useRouter } from "next/navigation";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination, Autoplay } from "swiper/modules";

import HeroSection from "@/Content/Components/HeroSection";
import BookSlider from "@/Content/Components/BookSlider";

import { getBook } from "@/Content/Redux/ActionCreartors/BookActionCreators";
import { getCart, createCart } from "@/Content/Redux/ActionCreartors/CartActionCreators";
import { getWishlist, createWishlist } from "@/Content/Redux/ActionCreartors/WishlistActionCreators";

/* ─── Format icon map ─────────────────────────────────────────────────── */
const FORMAT_META = {
  Paperback: { icon: "fa-book-open",            label: "Paperback", desc: "Flexible & lightweight" },
  Hardcover: { icon: "fa-book",                  label: "Hardcover", desc: "Premium & durable"      },
  Ebook:     { icon: "fa-tablet-screen-button",  label: "E-Book",    desc: "Instant download"       },
};

export default function BookPage() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const router   = useRouter();

  const BookStateData     = useSelector((state) => state.BookStateData)     || [];
  const CartStateData     = useSelector((state) => state.CartStateData)     || [];
  const WishlistStateData = useSelector((state) => state.WishlistStateData) || [];

  const [data, setData]                   = useState({ pic: [], images: [], reviews: [], formatPricing: [] });
  const [relatedBooks, setRelatedBooks]   = useState([]);
  const [qty, setQty]                     = useState(1);
  const [selectedFormat, setSelectedFormat] = useState(null);

  /* Delivery */
  const [pincode, setPincode]         = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  /* Reviews */
  const [rating, setRating]         = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");

  /* Ebook read modal */
  const [ebookOpen, setEbookOpen] = useState(false);

  /* ── Fetch ── */
  useEffect(() => {
    dispatch(getBook());
    dispatch(getCart());
    dispatch(getWishlist());
  }, [dispatch]);

  /* ── Populate ── */
  useEffect(() => {
    if (BookStateData.length) {
      const item = BookStateData.find((x) => x._id === id);
      if (item) {
        const bookData = {
          ...item,
          reviews:       item.reviews       || [],
          formatPricing: item.formatPricing || [],
        };
        setData(bookData);
        if (bookData.formatPricing.length) setSelectedFormat(bookData.formatPricing[0]);
        setRelatedBooks(
          BookStateData.filter(
            (x) => x.active && x.category?._id === item.category?._id && x._id !== item._id
          )
        );
      }
    }
  }, [BookStateData, id]);

  /* ── Derived prices ── */
  const activePrice    = selectedFormat?.finalPrice ?? data.finalPrice ?? 0;
  const activeBase     = selectedFormat?.price      ?? data.basePrice  ?? 0;
  const activeDiscount = selectedFormat?.discount   ?? data.discount   ?? 0;
  const savings        = activeBase > activePrice ? Math.round(activeBase - activePrice) : 0;
  const isEbook        = selectedFormat?.format === "Ebook";

  /* ── Add to Cart ── */
  const addToCart = async () => {
  if (!data._id) {
    alert("Please wait, book is loading...");
    return;
  }

  const userid = localStorage.getItem("userid");
  if (!userid) {
    router.push("/login");
    return;
  }

  if (!selectedFormat) {
    alert("Please select a format");
    return;
  }

  if (isEbook) {
    setEbookOpen(true);
    return;
  }

  // ✅ Robust duplicate check — covers both "Book" and "book" keys,
  //    and converts both sides to string before comparing
  const exists = CartStateData.find((x) => {
    const cartBookId = (x.Book?._id || x.book?._id || x.book || x.Book || "").toString();
    const currentId  = id.toString();
    const cartFormat = x.format || "";
    return cartBookId === currentId && cartFormat === selectedFormat.format;
  });

  if (exists) {
    router.push("/cart");
    return;
  }

  await dispatch(
    createCart({
      user:   userid,
      book:   data._id,
      format: selectedFormat.format,
      qty,
      total:  activePrice * qty,
    })
  );

  router.push("/cart");
};

  /* ── Ebook purchase (from modal) ── */
  const handleEbookBuy = async () => {
  const userid = localStorage.getItem("userid");
  if (!userid) {
    router.push("/login");
    return;
  }

  // ✅ Same robust check
  const exists = CartStateData.find((x) => {
    const cartBookId = (x.Book?._id || x.book?._id || x.book || x.Book || "").toString();
    return cartBookId === id.toString() && x.format === "Ebook";
  });

  if (!exists) {
    await dispatch(
      createCart({
        user:   userid,
        book:   data._id,
        format: "Ebook",
        qty:    1,
        total:  activePrice,
      })
    );
  }

  setEbookOpen(false);
  router.push("/cart");
};
  /* ── Wishlist ── */
  const addToWishlist = () => {
  const userid = localStorage.getItem("userid");
  if (!userid) {
    router.push("/login");
    return;
  }

  // ✅ Robust duplicate check — covers both "Book" and "book" keys
  const exists = WishlistStateData.find((x) => {
    const wishlistBookId = (x.Book?._id || x.book?._id || x.book || x.book || "").toString();
    return wishlistBookId === id.toString();
  });

  if (exists) {
    router.push("/wishlist");
    return;
  }

  dispatch(createWishlist({ user: userid, book: data._id }));
  router.push("/wishlist");
};

  /* ── Delivery ── */
  const checkDelivery = () => {
    if (pincode.length === 6) {
      if (isEbook) {
        setDeliveryDate("INSTANT");
        return;
      }
      const days = Math.floor(Math.random() * 3) + 3;
      const date = new Date();
      date.setDate(date.getDate() + days);
      setDeliveryDate(date.toDateString());
    } else {
      alert("Enter valid 6-digit pincode");
    }
  };

  /* ── Review ── */
  const submitReview = () => {
    if (!rating || !reviewText.trim()) {
      alert("Please add rating and review");
      return;
    }
    const newReview = {
      user:    { name: localStorage.getItem("name") || "Anonymous" },
      rating,
      comment: reviewText,
      date:    new Date().toISOString(),
    };
    setData({ ...data, reviews: [...(data.reviews || []), newReview] });
    setRating(0);
    setReviewText("");
  };

  /* ── Average rating ── */
  const avgRating = data.reviews.length
    ? (data.reviews.reduce((s, r) => s + r.rating, 0) / data.reviews.length).toFixed(1)
    : "—";

  /* ── All images ── */
  const allImages = [data.pic, ...(data.images || [])].filter(Boolean);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,600;1,500&family=Nunito:wght@300;400;500;600;700&display=swap');

        :root {
          --cream:       #FAF8F5;
          --white:       #FFFFFF;
          --sand:        #F0EBE3;
          --sand-deep:   #E4DDD3;
          --ink:         #1C1917;
          --ink-soft:    #44403C;
          --ink-muted:   #78716C;
          --ink-ghost:   #A8A29E;
          --amber:       #D97706;
          --amber-lt:    #FEF3C7;
          --rose:        #E11D48;
          --emerald:     #059669;
          --sky:         #0284C7;
          --border:      #E7E2DA;
          --border-deep: #D4CCC1;
          --r-card:      20px;
          --r-btn:       12px;
          --shadow-sm:   0 1px 3px rgba(28,25,23,.06),0 1px 2px rgba(28,25,23,.04);
          --shadow-md:   0 4px 16px rgba(28,25,23,.09),0 2px 6px rgba(28,25,23,.05);
          --shadow-lg:   0 12px 40px rgba(28,25,23,.12),0 6px 18px rgba(28,25,23,.07);
        }

        /* ── PAGE WRAPPER ── */
        .bp-page { background: var(--cream); min-height: 100vh; padding-bottom: 100px; }

        /* ── CARD ── */
        .bp-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: var(--r-card);
          box-shadow: var(--shadow-sm);
          overflow: hidden;
        }

        /* ── IMAGE SLIDER ── */
        .bp-img-wrap { background: var(--sand); padding: 8px; border-radius: var(--r-card); }
        .bp-img-wrap img {
          width: 100%; max-height: 420px;
          object-fit: contain; border-radius: 14px;
          display: block;
        }
        .bp-img-wrap .swiper-pagination-bullet-active { background: var(--amber) !important; }

        /* ── BREADCRUMB ── */
        .bp-crumb {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 500;
          color: var(--ink-ghost);
          letter-spacing: 0.05em;
          margin-bottom: 10px;
        }
        .bp-crumb span { color: var(--ink-muted); }

        /* ── TITLE ── */
        .bp-title {
          font-family: 'Lora', Georgia, serif;
          font-size: clamp(22px, 3.5vw, 34px);
          font-weight: 600; color: var(--ink);
          line-height: 1.2; margin-bottom: 4px;
        }
        .bp-author {
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: var(--amber); margin-bottom: 16px;
        }

        /* ── RATING ROW ── */
        .bp-rating-row {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 20px;
        }
        .bp-stars-display { color: var(--amber); font-size: 15px; letter-spacing: 1px; }
        .bp-rating-num {
          font-family: 'Lora', serif; font-size: 18px; font-weight: 600; color: var(--ink);
        }
        .bp-review-count {
          font-family: 'Nunito', sans-serif; font-size: 12px; color: var(--ink-ghost);
        }

        /* ═══════════════════════════════════════
           FORMAT SELECTOR
        ═══════════════════════════════════════ */
        .bp-format-label {
          font-family: 'Nunito', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: var(--ink-muted); margin-bottom: 10px;
        }
        .bp-format-tabs {
          display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 24px;
        }
        .bp-fmt-tab {
          flex: 1; min-width: 96px;
          border: 1.5px solid var(--border);
          border-radius: 14px;
          background: var(--white);
          padding: 12px 14px;
          cursor: pointer;
          transition: border-color .22s, background .22s, box-shadow .22s, transform .18s;
          text-align: center;
          position: relative;
        }
        .bp-fmt-tab:hover {
          border-color: var(--border-deep);
          box-shadow: var(--shadow-md);
          transform: translateY(-2px);
        }
        .bp-fmt-tab.active {
          border-color: var(--amber);
          background: var(--amber-lt);
          box-shadow: 0 4px 18px rgba(217,119,6,.15);
          transform: translateY(-2px);
        }
        .bp-fmt-tab.active .bp-fmt-icon { color: var(--amber); }
        .bp-fmt-icon {
          font-size: 20px; color: var(--ink-ghost);
          margin-bottom: 5px; transition: color .2s;
          display: block;
        }
        .bp-fmt-name {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700; color: var(--ink-soft);
          display: block; margin-bottom: 2px;
        }
        .bp-fmt-desc {
          font-family: 'Nunito', sans-serif;
          font-size: 10px; color: var(--ink-ghost);
          display: block;
        }
        .bp-fmt-tab.active::after {
          content: '✓';
          position: absolute; top: 7px; right: 9px;
          font-size: 9px; font-weight: 700;
          color: var(--amber);
          background: rgba(217,119,6,.12);
          width: 16px; height: 16px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          line-height: 16px;
        }

        /* ═══════════════════════════════════════
           PRICE BLOCK
        ═══════════════════════════════════════ */
        .bp-price-block {
          background: var(--sand);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 16px 20px;
          margin-bottom: 20px;
          display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap;
        }
        .bp-price {
          font-family: 'Lora', serif;
          font-size: 32px; font-weight: 600;
          color: var(--ink); letter-spacing: -0.02em;
          transition: all .3s;
        }
        .bp-price-old {
          font-family: 'Nunito', sans-serif;
          font-size: 14px; color: var(--ink-ghost);
          text-decoration: line-through; font-weight: 400;
        }
        .bp-price-off {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700;
          color: var(--emerald);
          background: rgba(5,150,105,.09);
          padding: 3px 10px; border-radius: 100px;
        }
        .bp-savings {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; color: var(--emerald);
          margin-left: auto;
          white-space: nowrap;
        }

        /* ── EBOOK BADGE ── */
        .bp-ebook-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          border: 1px solid #BFDBFE;
          color: var(--sky);
          font-family: 'Nunito', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 5px 14px; border-radius: 100px;
          margin-bottom: 16px;
        }

        /* ── QUANTITY ── */
        .bp-qty-wrap {
          display: flex; align-items: center; gap: 0;
          border: 1.5px solid var(--border);
          border-radius: 12px; overflow: hidden;
          width: fit-content; margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }
        .bp-qty-btn {
          width: 40px; height: 40px;
          border: none; background: var(--sand);
          color: var(--ink-soft); font-size: 16px;
          cursor: pointer; transition: background .2s, color .2s;
          display: flex; align-items: center; justify-content: center;
        }
        .bp-qty-btn:hover { background: var(--amber); color: var(--white); }
        .bp-qty-val {
          width: 48px; text-align: center;
          font-family: 'Lora', serif; font-size: 16px; font-weight: 600;
          color: var(--ink); border-left: 1px solid var(--border); border-right: 1px solid var(--border);
          height: 40px; line-height: 40px;
        }

        /* ── STOCK PILL ── */
        .bp-stock {
          display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 600;
          padding: 4px 12px; border-radius: 100px;
          margin-bottom: 16px;
        }
        .bp-stock.in  { background: rgba(5,150,105,.08); color: var(--emerald); }
        .bp-stock.out { background: rgba(225,29,72,.07); color: var(--rose); }
        .bp-stock-dot { width: 6px; height: 6px; border-radius: 50%; }
        .bp-stock.in  .bp-stock-dot { background: var(--emerald); }
        .bp-stock.out .bp-stock-dot { background: var(--rose); }

        /* ── ACTION BUTTONS ── */
        .bp-actions { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }

        .bp-btn-primary {
          flex: 1; min-width: 140px;
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 14px 20px; border-radius: var(--r-btn);
          border: none;
          background: var(--ink); color: var(--white);
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(28,25,23,.18);
          transition: background .22s, transform .15s, box-shadow .22s;
        }
        .bp-btn-primary:hover {
          background: var(--amber);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217,119,6,.28);
        }
        .bp-btn-primary:disabled {
          opacity: 0.45; cursor: not-allowed; transform: none;
        }
        .bp-btn-primary.ebook-cta {
          background: linear-gradient(135deg, var(--sky), #0369A1);
          box-shadow: 0 4px 16px rgba(2,132,199,.25);
        }
        .bp-btn-primary.ebook-cta:hover {
          background: linear-gradient(135deg, #0369A1, #075985);
          box-shadow: 0 8px 24px rgba(2,132,199,.35);
        }

        .bp-btn-secondary {
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 600;
          letter-spacing: 0.06em; text-transform: uppercase;
          padding: 14px 20px; border-radius: var(--r-btn);
          border: 1.5px solid var(--border-deep);
          background: var(--white); color: var(--ink-soft);
          cursor: pointer; display: flex; align-items: center; gap: 8px;
          box-shadow: var(--shadow-sm);
          transition: border-color .22s, background .22s, color .22s, transform .15s;
        }
        .bp-btn-secondary:hover {
          border-color: var(--rose);
          background: rgba(225,29,72,.04);
          color: var(--rose);
          transform: translateY(-2px);
        }

        /* ── DELIVERY BOX ── */
        .bp-delivery {
          border: 1.5px solid var(--border);
          border-radius: 14px; padding: 16px 18px;
          margin-bottom: 20px; background: var(--white);
        }
        .bp-delivery-title {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--ink-muted); margin-bottom: 12px;
        }
        .bp-delivery-input { display: flex; gap: 8px; }
        .bp-delivery-input input {
          flex: 1; border: 1.5px solid var(--border);
          border-radius: 10px; padding: 9px 14px;
          font-family: 'Nunito', sans-serif; font-size: 13px;
          color: var(--ink); background: var(--sand);
          outline: none; transition: border-color .2s;
        }
        .bp-delivery-input input:focus { border-color: var(--amber); background: var(--white); }
        .bp-delivery-input button {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 9px 18px; border-radius: 10px;
          border: none; background: var(--ink); color: var(--white);
          cursor: pointer; transition: background .2s;
        }
        .bp-delivery-input button:hover { background: var(--amber); }
        .bp-delivery-result {
          margin-top: 10px;
          font-family: 'Nunito', sans-serif; font-size: 12.5px; color: var(--emerald);
          display: flex; align-items: center; gap: 6px; font-weight: 600;
        }

        /* ── ACCORDION ── */
        .bp-accordion { border-radius: 14px; overflow: hidden; border: 1.5px solid var(--border); }
        .bp-accordion .accordion-button {
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--ink-soft); background: var(--white);
          box-shadow: none !important;
        }
        .bp-accordion .accordion-button:not(.collapsed) { color: var(--amber); background: var(--amber-lt); }
        .bp-accordion .accordion-button::after { filter: none; }
        .bp-accordion .accordion-body {
          font-family: 'Nunito', sans-serif; font-size: 13px;
          color: var(--ink-muted); background: var(--sand);
          line-height: 1.65;
        }

        /* ── DESCRIPTION ── */
        .bp-desc-block { margin-top: 20px; }
        .bp-section-label {
          font-family: 'Nunito', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: var(--ink-ghost); margin-bottom: 8px;
        }
        .bp-desc-text {
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px; font-weight: 400; line-height: 1.75;
          color: var(--ink-soft);
        }

        /* ═══════════════════════════════════════
           REVIEWS SECTION
        ═══════════════════════════════════════ */
        .bp-reviews-card { padding: 28px 28px 32px; }
        .bp-reviews-header {
          display: flex; align-items: baseline; gap: 14px;
          margin-bottom: 24px; flex-wrap: wrap;
        }
        .bp-reviews-title {
          font-family: 'Lora', serif;
          font-size: 22px; font-weight: 600; color: var(--ink);
        }
        .bp-avg-rating {
          font-family: 'Lora', serif;
          font-size: 40px; font-weight: 600; color: var(--ink);
          line-height: 1;
        }
        .bp-avg-label {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; color: var(--ink-ghost); margin-top: 2px;
        }

        .bp-review-item {
          border-bottom: 1px solid var(--border);
          padding: 16px 0;
        }
        .bp-review-item:last-of-type { border-bottom: none; }
        .bp-reviewer-name {
          font-family: 'Nunito', sans-serif;
          font-size: 14px; font-weight: 700; color: var(--ink);
          margin-bottom: 2px;
        }
        .bp-review-stars { color: var(--amber); font-size: 13px; letter-spacing: 1px; }
        .bp-review-comment {
          font-family: 'Nunito', sans-serif;
          font-size: 13.5px; color: var(--ink-soft);
          line-height: 1.6; margin: 6px 0 4px;
        }
        .bp-review-date {
          font-family: 'Nunito', sans-serif;
          font-size: 11px; color: var(--ink-ghost);
        }

        /* Write review */
        .bp-write-review {
          margin-top: 28px;
          border-top: 1.5px solid var(--border);
          padding-top: 24px;
        }
        .bp-star-input { display: flex; gap: 4px; margin-bottom: 12px; }
        .bp-star-input span {
          font-size: 26px; cursor: pointer;
          transition: transform .15s, color .15s;
          color: var(--border-deep);
        }
        .bp-star-input span.lit { color: var(--amber); }
        .bp-star-input span:hover { transform: scale(1.2); }
        .bp-review-textarea {
          width: 100%; border: 1.5px solid var(--border);
          border-radius: 12px; padding: 12px 16px;
          font-family: 'Nunito', sans-serif; font-size: 13.5px;
          color: var(--ink); background: var(--sand);
          resize: vertical; min-height: 90px; outline: none;
          transition: border-color .2s;
          margin-bottom: 12px;
        }
        .bp-review-textarea:focus { border-color: var(--amber); background: var(--white); }
        .bp-review-submit {
          width: 100%;
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 13px 0; border-radius: 12px;
          border: none; background: var(--ink); color: var(--white);
          cursor: pointer; transition: background .22s, transform .15s;
        }
        .bp-review-submit:hover { background: var(--amber); transform: translateY(-1px); }

        /* ═══════════════════════════════════════
           EBOOK MODAL
        ═══════════════════════════════════════ */
        .bp-modal-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(28,25,23,.55);
          backdrop-filter: blur(6px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: fadeIn .22s ease;
        }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        .bp-modal {
          background: var(--white);
          border-radius: 24px;
          padding: 40px 36px;
          max-width: 440px; width: 100%;
          box-shadow: var(--shadow-lg);
          animation: slideUp .28s cubic-bezier(.22,.68,0,1.2);
          text-align: center;
        }
        @keyframes slideUp { from { opacity:0; transform:translateY(30px) } to { opacity:1; transform:translateY(0) } }
        .bp-modal-icon {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
          display: flex; align-items: center; justify-content: center;
          font-size: 30px; color: var(--sky);
          margin: 0 auto 20px;
        }
        .bp-modal-title {
          font-family: 'Lora', serif;
          font-size: 24px; font-weight: 600; color: var(--ink);
          margin-bottom: 10px;
        }
        .bp-modal-desc {
          font-family: 'Nunito', sans-serif;
          font-size: 14px; color: var(--ink-muted);
          line-height: 1.65; margin-bottom: 28px;
        }
        .bp-modal-actions { display: flex; gap: 10px; flex-direction: column; }
        .bp-modal-btn-primary {
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 14px; border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, var(--sky), #0369A1);
          color: var(--white); cursor: pointer;
          transition: opacity .2s, transform .15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .bp-modal-btn-primary:hover { opacity: .9; transform: translateY(-1px); }
        .bp-modal-btn-secondary {
          font-family: 'Nunito', sans-serif;
          font-size: 13px; font-weight: 600;
          padding: 14px; border-radius: 12px;
          border: 1.5px solid var(--border-deep);
          background: transparent; color: var(--ink-muted);
          cursor: pointer; transition: border-color .2s, color .2s;
        }
        .bp-modal-btn-secondary:hover { border-color: var(--ink-soft); color: var(--ink); }
        .bp-modal-features {
          display: flex; gap: 10px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 20px;
        }
        .bp-modal-feat {
          display: flex; align-items: center; gap: 5px;
          font-family: 'Nunito', sans-serif;
          font-size: 11.5px; font-weight: 600; color: var(--emerald);
          background: rgba(5,150,105,.07);
          padding: 4px 12px; border-radius: 100px;
        }
        .bp-modal-price {
          font-family: 'Lora', serif;
          font-size: 28px; font-weight: 600; color: var(--sky);
          margin-bottom: 6px;
        }
        .bp-modal-price-desc {
          font-family: 'Nunito', sans-serif;
          font-size: 12px; color: var(--ink-ghost);
          margin-bottom: 24px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 576px) {
          .bp-reviews-card { padding: 20px 16px 24px; }
          .bp-modal { padding: 32px 20px; }
        }
      `}</style>

      {/* ─── Ebook Purchase Modal ─── */}
      {ebookOpen && (
        <div className="bp-modal-overlay" onClick={() => setEbookOpen(false)}>
          <div className="bp-modal" onClick={(e) => e.stopPropagation()}>
            <div className="bp-modal-icon">
              <i className="fa-solid fa-tablet-screen-button" />
            </div>
            <div className="bp-modal-title">Get Instant Access</div>
            <div className="bp-modal-price">₹{activePrice}</div>
            <div className="bp-modal-price-desc">One-time purchase · Lifetime access</div>
            <div className="bp-modal-features">
              <div className="bp-modal-feat"><i className="fa-solid fa-bolt" />Instant download</div>
              <div className="bp-modal-feat"><i className="fa-solid fa-infinity" />Lifetime access</div>
              <div className="bp-modal-feat"><i className="fa-solid fa-mobile-screen" />All devices</div>
            </div>
            <div className="bp-modal-desc">
              You'll receive a download link instantly after purchase. Read on any device — phone, tablet, or PC.
            </div>
            <div className="bp-modal-actions">
              <button className="bp-modal-btn-primary" onClick={handleEbookBuy}>
                <i className="fa-solid fa-bolt" /> Buy E-Book Now
              </button>
              <button className="bp-modal-btn-secondary" onClick={() => setEbookOpen(false)}>
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Hero ─── */}
      <div className="d-none d-lg-block">
        <HeroSection title={data.title || ""} />
      </div>

      <div className="bp-page">
        <div className="container py-4">
          <div className="row g-4">

            {/* ── IMAGES ── */}
            <div className="col-lg-5 col-12">
              <div className="bp-card bp-img-wrap p-3">
                <Swiper
                  loop
                  pagination={{ clickable: true }}
                  autoplay={{ delay: 3500 }}
                  grabCursor={false}
                  modules={[Pagination, Autoplay]}
                >
                  {allImages.length ? allImages.map((img, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={img}
                        alt={data.title}
                        style={{ height: "100%", width: "100%" }}
                      />
                    </SwiperSlide>
                  )) : (
                    <SwiperSlide>
                      <div style={{
                        height: 320, background: "var(--sand-deep)", borderRadius: 14,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <i className="fa-solid fa-book" style={{ fontSize: 64, color: "var(--border-deep)" }} />
                      </div>
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Book meta chips */}
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
                {[
                  { icon: "fa-language",   label: data.language },
                  { icon: "fa-file-lines", label: data.pages ? `${data.pages} pages` : null },
                  { icon: "fa-barcode",    label: data.isbn    ? `ISBN: ${data.isbn}` : null },
                ].filter((x) => x.label).map((chip, i) => (
                  <div key={i} style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    background: "var(--white)", border: "1px solid var(--border)",
                    borderRadius: 100, padding: "5px 12px",
                    fontFamily: "'Nunito',sans-serif", fontSize: 11.5, fontWeight: 600,
                    color: "var(--ink-muted)", boxShadow: "var(--shadow-sm)"
                  }}>
                    <i className={`fa-solid ${chip.icon}`} style={{ fontSize: 10, color: "var(--amber)" }} />
                    {chip.label}
                  </div>
                ))}
              </div>
            </div>

            {/* ── DETAILS ── */}
            <div className="col-lg-7 col-12">
              <div className="bp-card p-4">

                {/* Breadcrumb */}
                <div className="bp-crumb">
                  <span>{data.category?.name}</span>
                  {data.subcategory?.name && <> · <span>{data.subcategory.name}</span></>}
                  {data.publisher?.name   && <> · <span>{data.publisher.name}</span></>}
                </div>

                <h1 className="bp-title">{data.title || "—"}</h1>
                <div className="bp-author">by {data.author || "Unknown Author"}</div>

                {/* Rating row */}
                <div className="bp-rating-row">
                  <div className="bp-stars-display">
                    {"★".repeat(Math.round(parseFloat(avgRating) || 0))}
                    {"☆".repeat(5 - Math.round(parseFloat(avgRating) || 0))}
                  </div>
                  <div className="bp-rating-num">{avgRating}</div>
                  <div className="bp-review-count">
                    ({data.reviews.length} review{data.reviews.length !== 1 ? "s" : ""})
                  </div>
                </div>

                {/* ── FORMAT SELECTOR ── */}
                {data.formatPricing.length > 0 && (
                  <>
                    <div className="bp-format-label">Choose Format</div>
                    <div className="bp-format-tabs">
                      {data.formatPricing.map((fp) => {
                        const meta = FORMAT_META[fp.format] || { icon: "fa-book", label: fp.format, desc: "" };
                        return (
                          <button
                            key={fp.format}
                            className={`bp-fmt-tab ${selectedFormat?.format === fp.format ? "active" : ""}`}
                            onClick={() => { setSelectedFormat(fp); setQty(1); setDeliveryDate(""); }}
                          >
                            <i className={`fa-solid ${meta.icon} bp-fmt-icon`} />
                            <span className="bp-fmt-name">{meta.label}</span>
                            <span className="bp-fmt-desc">{meta.desc}</span>
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Ebook badge */}
                {isEbook && (
                  <div className="bp-ebook-badge">
                    <i className="fa-solid fa-bolt" />
                    Instant Digital Download
                  </div>
                )}

                {/* ── PRICE BLOCK ── */}
                <div className="bp-price-block">
                  <span className="bp-price">₹{activePrice}</span>
                  {activeBase > activePrice && (
                    <span className="bp-price-old">₹{activeBase}</span>
                  )}
                  {activeDiscount > 0 && (
                    <span className="bp-price-off">{activeDiscount}% OFF</span>
                  )}
                  {savings > 0 && (
                    <span className="bp-savings">You save ₹{savings}</span>
                  )}
                </div>

                {/* Stock */}
                {!isEbook ? (
                  <div className={`bp-stock ${data.stock > 0 ? "in" : "out"}`}>
                    <span className="bp-stock-dot" />
                    {data.stock > 0 ? `In Stock (${data.stock} left)` : "Out of Stock"}
                  </div>
                ) : (
                  <div className="bp-stock in" style={{ marginBottom: 16 }}>
                    <span className="bp-stock-dot" />
                    Always Available
                  </div>
                )}

                {/* Quantity (not for ebook) */}
                {!isEbook && data.stock > 0 && (
                  <div className="bp-qty-wrap">
                    <button className="bp-qty-btn" onClick={() => qty > 1 && setQty(qty - 1)}>−</button>
                    <div className="bp-qty-val">{qty}</div>
                    <button className="bp-qty-btn" onClick={() => qty < data.stock && setQty(qty + 1)}>+</button>
                  </div>
                )}

                {/* Actions */}
                <div className="bp-actions">
                  <button
                    className={`bp-btn-primary ${isEbook ? "ebook-cta" : ""}`}
                    onClick={addToCart}
                    disabled={!isEbook && !data.stock}
                  >
                    <i className={`fa-solid ${isEbook ? "fa-bolt" : "fa-cart-shopping"}`} />
                    {isEbook ? "Buy E-Book" : "Add to Cart"}
                  </button>
                  <button className="bp-btn-secondary" onClick={addToWishlist}>
                    <i className="fa-regular fa-heart" />
                    Wishlist
                  </button>
                </div>

                {/* Delivery */}
                <div className="bp-delivery">
                  <div className="bp-delivery-title">
                    <i className="fa-solid fa-truck-fast" style={{ marginRight: 6, color: "var(--amber)" }} />
                    {isEbook ? "Download Info" : "Check Delivery"}
                  </div>
                  {isEbook ? (
                    <div className="bp-delivery-result">
                      <i className="fa-solid fa-bolt" />
                      Delivered instantly to your email after payment
                    </div>
                  ) : (
                    <>
                      <div className="bp-delivery-input">
                        <input
                          placeholder="Enter 6-digit pincode"
                          value={pincode}
                          maxLength={6}
                          onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                        />
                        <button onClick={checkDelivery}>Check</button>
                      </div>
                      {deliveryDate && (
                        <div className="bp-delivery-result">
                          <i className="fa-solid fa-circle-check" />
                          Delivery by <strong style={{ marginLeft: 4 }}>{deliveryDate}</strong>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Description */}
                <div className="bp-desc-block">
                  <div className="bp-section-label">About this book</div>
                  <div
                    className="bp-desc-text"
                    dangerouslySetInnerHTML={{ __html: data.description || "—" }}
                  />
                </div>

                {/* Policies accordion */}
                <div className="bp-accordion accordion mt-4" id="policyAccordion">
                  {(isEbook
                    ? [
                        { title: "Download Policy", body: "Your download link is sent to your registered email immediately after payment. Valid for 3 downloads." },
                        { title: "Refund Policy",   body: "E-Book purchases are non-refundable once the download link is accessed." },
                        { title: "Device Support",  body: "Compatible with all modern devices — phone, tablet, PC. Supports PDF and EPUB formats." },
                      ]
                    : [
                        { title: "Delivery Policy", body: "Delivered within 3–7 business days via our courier partners." },
                        { title: "Return Policy",   body: "7-day return available on eligible books in original condition." },
                        { title: "Refund Policy",   body: "Refund processed within 5–7 working days after return pickup." },
                      ]
                  ).map((p, i) => (
                    <div className="accordion-item" key={i}>
                      <h2 className="accordion-header">
                        <button
                          className={`accordion-button ${i ? "collapsed" : ""}`}
                          data-bs-toggle="collapse"
                          data-bs-target={`#policy${i}`}
                        >
                          {p.title}
                        </button>
                      </h2>
                      <div
                        id={`policy${i}`}
                        className={`accordion-collapse collapse ${!i ? "show" : ""}`}
                      >
                        <div className="accordion-body">{p.body}</div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>

          {/* ── REVIEWS ── */}
          <div className="bp-card bp-reviews-card mt-4">
            <div className="bp-reviews-header">
              <div>
                <div className="bp-reviews-title">Customer Reviews</div>
              </div>
              {data.reviews.length > 0 && (
                <div style={{ marginLeft: "auto", textAlign: "center" }}>
                  <div className="bp-avg-rating">{avgRating}</div>
                  <div style={{ color: "var(--amber)", fontSize: 18, marginBottom: 2 }}>
                    {"★".repeat(Math.round(parseFloat(avgRating) || 0))}
                    {"☆".repeat(5 - Math.round(parseFloat(avgRating) || 0))}
                  </div>
                  <div className="bp-avg-label">
                    {data.reviews.length} review{data.reviews.length !== 1 ? "s" : ""}
                  </div>
                </div>
              )}
            </div>

            {data.reviews.length === 0 && (
              <div style={{
                textAlign: "center", padding: "28px 0",
                color: "var(--ink-ghost)", fontFamily: "'Nunito',sans-serif", fontSize: 14
              }}>
                No reviews yet. Be the first to review this book!
              </div>
            )}

            {data.reviews.map((rev, i) => (
              <div key={i} className="bp-review-item">
                <div className="bp-reviewer-name">{rev.user?.name || rev.name || "Anonymous"}</div>
                <div className="bp-review-stars">
                  {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                </div>
                <div className="bp-review-comment">{rev.comment}</div>
                <div className="bp-review-date">
                  {new Date(rev.date || rev.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </div>
              </div>
            ))}

            {/* Write review */}
            <div className="bp-write-review">
              <div className="bp-section-label" style={{ marginBottom: 12 }}>Write a Review</div>
              <div className="bp-star-input">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={(hoverRating || rating) >= i ? "lit" : ""}
                    onClick={() => setRating(i)}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                  >★</span>
                ))}
              </div>
              <textarea
                className="bp-review-textarea"
                placeholder="Share your experience with this book…"
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <button className="bp-review-submit" onClick={submitReview}>
                Submit Review
              </button>
            </div>
          </div>

          {/* ── RELATED BOOKS ── */}
          <div className="mt-4">
            <BookSlider title={data.category?.name || "Related"} data={relatedBooks} />
          </div>

        </div>
      </div>
    </>
  );
}