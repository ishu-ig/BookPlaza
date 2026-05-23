"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  deleteCart,
  getCart,
  updateCart,
} from "../Redux/ActionCreartors/CartActionCreators";
import { createCheckout } from "../Redux/ActionCreartors/CheckoutActionCreators";
import {
  updateBook,
  getBook,
} from "../Redux/ActionCreartors/BookActionCreators";

/* ─────────────────────────────────────────────
   DESIGN TOKENS — Light / Warm Ivory
───────────────────────────────────────────── */
const T = {
  bg: "#FAF8F5",
  surface: "#FFFFFF",
  surfaceRaised: "#F5F2ED",
  glass: "rgba(0,0,0,0.02)",
  border: "#EAE5DE",
  borderMid: "#D6CEBF",
  borderStrong: "#BFB5A5",

  gold: "#B07D2F",
  goldLight: "#C99A4A",
  goldGlow: "rgba(176,125,47,0.10)",
  goldGlowStrong: "rgba(176,125,47,0.18)",

  textPrimary: "#1C1814",
  textSub: "#6B6259",
  textMuted: "#A89E93",

  green: "#2D8A5E",
  greenSoft: "rgba(45,138,94,0.10)",
  amber: "#B06A1A",
  amberSoft: "rgba(176,106,26,0.10)",
  red: "#C0392B",
  redSoft: "rgba(192,57,43,0.08)",
  sky: "#1A7FA8",
  skySoft: "rgba(26,127,168,0.10)",

  serif: "'Playfair Display', Georgia, serif",
  sans: "'Outfit', 'Helvetica Neue', sans-serif",
  mono: "'JetBrains Mono', monospace",
  radius: "14px",
  radiusSm: "8px",
  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
  shadow1: "0 1px 4px rgba(0,0,0,0.06)",
  shadow2: "0 4px 16px rgba(0,0,0,0.08)",
  shadowGold: "0 8px 24px rgba(176,125,47,0.18)",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500;1,600&family=Outfit:wght@300;400;500;600&display=swap');

  .cr *, .cr *::before, .cr *::after { box-sizing: border-box; margin: 0; padding: 0; }
  .cr {
    font-family: ${T.sans};
    background: ${T.bg};
    min-height: 100vh;
    color: ${T.textPrimary};
    -webkit-font-smoothing: antialiased;
    position: relative;
  }

  .cr::before {
    content: '';
    position: fixed; inset: 0;
    opacity: 0.018;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 200px;
    pointer-events: none; z-index: 0;
  }
  .cr ::-webkit-scrollbar { width: 4px; }
  .cr ::-webkit-scrollbar-track { background: ${T.bg}; }
  .cr ::-webkit-scrollbar-thumb { background: ${T.borderMid}; border-radius: 4px; }

  /* ── Item Card ── */
  .c-item {
    position: relative;
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: ${T.radius};
    margin-bottom: 10px;
    overflow: hidden;
    transition: ${T.transition};
    animation: fadeUp 0.4s ease both;
    box-shadow: ${T.shadow1};
  }
  .c-item:hover {
    border-color: ${T.borderMid};
    box-shadow: ${T.shadow2};
    transform: translateY(-1px);
  }
  .c-item::before {
    content: '';
    position: absolute;
    left: 0; top: 16px; bottom: 16px;
    width: 2px; border-radius: 0 2px 2px 0;
    background: ${T.gold};
    opacity: 0; transition: opacity 0.2s;
  }
  .c-item:hover::before { opacity: 1; }
  .c-item::after {
    content: '';
    position: absolute;
    bottom: 0; left: 20px; right: 20px; height: 1px;
    background: linear-gradient(90deg, transparent, ${T.border}, transparent);
  }

  /* ── Ebook highlight strip ── */
  .c-item.is-ebook {
    border-color: rgba(26,127,168,0.25);
    background: linear-gradient(135deg, #FFFFFF 80%, rgba(26,127,168,0.03) 100%);
  }
  .c-item.is-ebook::before { background: ${T.sky}; }
  .c-item.is-ebook:hover { border-color: rgba(26,127,168,0.4); }

  /* ── Qty ── */
  .qty-ctrl {
    display: flex; align-items: center;
    border: 1.5px solid ${T.borderMid};
    border-radius: 999px; overflow: hidden;
    background: ${T.surfaceRaised};
  }
  .qty-btn {
    width: 32px; height: 32px; border: none;
    background: transparent; color: ${T.textSub};
    font-size: 1rem; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-family: ${T.sans}; transition: ${T.transition}; flex-shrink: 0;
  }
  .qty-btn:hover { background: ${T.goldGlow}; color: ${T.gold}; }
  .qty-btn:disabled { opacity: 0.35; cursor: default; }
  .qty-val {
    min-width: 30px; text-align: center;
    font-size: 0.82rem; font-weight: 600; color: ${T.textPrimary};
    border-left: 1.5px solid ${T.border}; border-right: 1.5px solid ${T.border};
    height: 32px; display: flex; align-items: center; justify-content: center;
  }

  /* ── Delete ──
     FIX: ebooks always show their delete button (no hover required)
  ── */
  .del-btn {
    width: 30px; height: 30px; border-radius: 50%;
    border: 1.5px solid rgba(192,57,43,0.18);
    background: ${T.redSoft}; color: ${T.red};
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: ${T.transition};
    flex-shrink: 0; opacity: 0;
  }
  .c-item:hover .del-btn { opacity: 1; }
  .del-btn.always-visible { opacity: 1; }          /* ← ebook always-on */
  .del-btn:hover { background: ${T.red}; color: #fff; border-color: ${T.red}; transform: scale(1.1); }

  /* ── Summary card ── */
  .sum-card {
    background: ${T.surface};
    border: 1.5px solid ${T.border};
    border-radius: ${T.radius};
    padding: 28px 24px;
    width: 100%; position: sticky; top: 24px;
    overflow: hidden;
    box-shadow: ${T.shadow1};
    animation: fadeUp 0.5s 0.15s ease both;
  }
  .sum-card::before {
    content: '';
    position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: linear-gradient(90deg, transparent 0%, ${T.gold} 40%, ${T.goldLight} 60%, transparent 100%);
  }

  /* ── Buttons ── */
  .btn-primary {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px 0;
    background: ${T.textPrimary}; color: #FAF8F5;
    border: none; border-radius: 999px;
    font-family: ${T.sans}; font-weight: 600; font-size: 0.82rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    text-decoration: none; cursor: pointer;
    box-shadow: 0 4px 14px rgba(28,24,20,0.18); transition: ${T.transition}; margin-top: 20px;
  }
  .btn-primary:hover { background: ${T.gold}; color: #fff; transform: translateY(-1px); box-shadow: ${T.shadowGold}; }
  .btn-primary:active { transform: scale(0.98); }

  .btn-success {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px 0;
    background: ${T.green}; color: #fff;
    border: none; border-radius: 999px;
    font-family: ${T.sans}; font-weight: 600; font-size: 0.82rem;
    letter-spacing: 0.08em; text-transform: uppercase;
    cursor: pointer; transition: ${T.transition}; margin-top: 20px;
    box-shadow: 0 4px 14px rgba(45,138,94,0.22);
  }
  .btn-success:hover { filter: brightness(1.08); transform: translateY(-1px); }
  .btn-success:disabled { opacity: 0.5; cursor: not-allowed; transform: none; filter: none; box-shadow: none; }

  /* ── Pay select ── */
  .pay-select {
    width: 100%; padding: 10px 38px 10px 14px;
    border: 1.5px solid ${T.borderMid}; border-radius: ${T.radiusSm};
    background: ${T.surfaceRaised}; color: ${T.textPrimary};
    font-family: ${T.sans}; font-size: 0.84rem;
    outline: none; cursor: pointer; transition: border-color 0.18s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A89E93' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
  }
  .pay-select:focus { border-color: ${T.gold}; }

  /* ── Misc ── */
  .divider { height: 1px; background: ${T.border}; margin: 16px 0; }
  .sum-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.83rem; }

  .chip {
    display: inline-block; background: ${T.surfaceRaised};
    border: 1.5px solid ${T.border}; border-radius: 999px;
    padding: 2px 9px; font-size: 0.65rem; font-weight: 500;
    color: ${T.textSub}; letter-spacing: 0.04em; margin-right: 4px;
  }
  .badge-gold {
    background: ${T.goldGlow}; border: 1.5px solid rgba(176,125,47,0.22);
    border-radius: 999px; padding: 3px 10px;
    font-size: 0.65rem; font-weight: 600; color: ${T.gold};
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .badge-free {
    background: ${T.greenSoft}; border: 1.5px solid rgba(45,138,94,0.2);
    border-radius: 999px; padding: 3px 10px;
    font-size: 0.65rem; font-weight: 600; color: ${T.green};
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .badge-ebook {
    background: ${T.skySoft}; border: 1.5px solid rgba(26,127,168,0.2);
    border-radius: 999px; padding: 3px 10px;
    font-size: 0.65rem; font-weight: 600; color: ${T.sky};
    letter-spacing: 0.06em; text-transform: uppercase;
    display: inline-flex; align-items: center; gap: 4px;
  }
  .qty-badge {
    background: ${T.surfaceRaised}; border: 1.5px solid ${T.border};
    border-radius: ${T.radiusSm}; padding: 4px 12px;
    font-size: 0.82rem; font-weight: 600; color: ${T.textPrimary};
    font-family: ${T.mono};
  }
  .nudge-strip {
    display: flex; align-items: center; gap: 8px;
    background: ${T.amberSoft}; border: 1.5px solid rgba(176,106,26,0.15);
    border-radius: ${T.radiusSm}; padding: 9px 13px;
    font-size: 0.74rem; color: ${T.amber}; margin-bottom: 10px;
  }
  .trust-row {
    display: flex; justify-content: center; gap: 20px;
    padding-top: 16px; border-top: 1px solid ${T.border}; margin-top: 18px;
  }
  .trust-item { display: flex; flex-direction: column; align-items: center; gap: 4px; width: 80px; }
  .trust-icon {
    width: 28px; height: 28px; border-radius: 50%;
    background: ${T.goldGlow}; border: 1.5px solid rgba(176,125,47,0.18);
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem; color: ${T.gold};
  }
  .back-link {
    display: block; text-align: center; margin-top: 14px;
    font-size: 0.76rem; color: ${T.textMuted}; text-decoration: none;
    transition: color 0.18s; letter-spacing: 0.03em;
  }
  .back-link:hover { color: ${T.gold}; }
  .float-anim { animation: float 4s ease-in-out infinite; }

  /* ── Skeleton ── */
  .skeleton {
    background: linear-gradient(90deg, ${T.border} 25%, ${T.surfaceRaised} 50%, ${T.border} 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: 6px;
  }

  @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  @keyframes fadeUp  { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float   { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }
  @keyframes spin    { to { transform: rotate(360deg); } }

  .c-item:nth-child(1) { animation-delay: 0.05s; }
  .c-item:nth-child(2) { animation-delay: 0.10s; }
  .c-item:nth-child(3) { animation-delay: 0.15s; }
  .c-item:nth-child(4) { animation-delay: 0.20s; }
  .c-item:nth-child(5) { animation-delay: 0.25s; }

  @media (max-width: 768px) {
    .sum-card { position: static; }
    .del-btn  { opacity: 1 !important; }
  }
`;

/* ── Icons ── */
const IconTrash = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14H6L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4h6v2" />
  </svg>
);
const IconArrow = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="M12 5l7 7-7 7" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconReceipt = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 2v20l3-2 2 2 2-2 2 2 2-2 3 2V2" />
    <line x1="8" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="16" y2="14" />
  </svg>
);
const IconTruck = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);
const IconShield = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);
const IconRefund = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 .49-4.42" />
  </svg>
);
const IconHeadset = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z" />
    <path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);
const IconBolt = () => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);
const IconSpin = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    style={{ animation: "spin 1s linear infinite" }}
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

/**
 * Determine if a cart item is an ebook.
 *
 * FIX (Bug 1): The original code defaulted format to 'Paperback' when it was
 * absent, meaning ebook items without an explicit format field were silently
 * treated as physical books. We now check multiple signals in priority order:
 *   1. item.format === 'Ebook'            (explicit cart-item field — ideal)
 *   2. item.book.type === 'Ebook'         (book-level type field)
 *   3. item.book.format === 'Ebook'       (alternate book-level field)
 *   4. item.isEbook === true              (pre-computed flag from DB)
 */
function detectIsEbook(item, book) {
  return (
    item.format === "Ebook" ||
    book?.type === "Ebook" ||
    book?.format === "Ebook" ||
    item.isEbook === true
  );
}

/**
 * Resolve the unit price for a cart item.
 *
 * FIX (Bug 3): The original code only checked formatPricing[].finalPrice and
 * fell back to b.price. Some book documents use b.finalPrice at the top level
 * instead. We now check all three locations.
 */
function resolveUnitPrice(book, format, isEbook) {
  // 1. formatPricing array lookup (most specific)
  if (Array.isArray(book.formatPricing)) {
    const entry = book.formatPricing.find((f) => f.format === format);
    if (entry?.finalPrice != null) return entry.finalPrice;
    if (entry?.price != null) return entry.price;
  }
  // 2. Top-level finalPrice (FIX: was missing)
  if (book.finalPrice != null) return book.finalPrice;
  // 3. Top-level price
  if (book.price != null) return book.price;
  return 0;
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
export default function Cart({ title, data }) {
  const [cart, setCart] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [total, setTotal] = useState(0);
  const [mode, setMode] = useState("COD");
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const CartStateData = useSelector((s) => s.CartStateData) ?? [];
  const BookStateData = useSelector((s) => s.BookStateData) ?? [];

  const dispatch = useDispatch();
  const router = useRouter();
  const isCheckout = title === "Checkout";

  /* ── Totals ── */
  function calculate(arr) {
    const safe = Array.isArray(arr) ? arr.filter(Boolean) : [];
    const sub = safe.reduce((s, x) => s + (x?.total ?? 0), 0);
    // FIX: only physical (non-ebook) items trigger shipping
    const hasPhysical = safe.some((x) => !x.isEbook);
    setSubtotal(sub);
    if (hasPhysical && sub > 0 && sub < 1000) {
      setShipping(150);
      setTotal(sub + 150);
    } else {
      setShipping(0);
      setTotal(sub);
    }
  }

  /* ── Normalise ──
   *
   * FIX (Bug 1 + Bug 3): Use detectIsEbook() and resolveUnitPrice() helpers
   * instead of the old `format ?? 'Paperback'` and limited price fallback.
   */
  function normalise(item) {
    if (!item) return null;

    // Reject unpopulated book references
    if (!item.book || typeof item.book === "string") {
      console.warn("[Cart] Unpopulated book ref on cart item:", item._id);
      return null;
    }

    const b = item.book;
    // FIX: derive isEbook first, THEN set format label (don't default to 'Paperback' blindly)
    const isEbook = detectIsEbook(item, b);
    const format = isEbook
      ? "Ebook"
      : item.format && item.format !== "Ebook"
        ? item.format
        : "Paperback";

    const unitPrice = resolveUnitPrice(b, format, isEbook);
    const qty = item.qty ?? 1;

    return {
      _id: item._id,
      qty,
      format,
      isEbook,
      unitPrice,
      total: item.total ?? unitPrice * qty,
      book: {
        _id: b._id,
        title: b.title ?? b.name ?? "Untitled",
        author: b.author ?? null,
        pic: b.pic ?? null,
        // Ebooks never run out of stock — use Infinity so qty controls disable correctly
        stock: isEbook ? Infinity : (b.stock ?? 99),
      },
    };
  }

  useEffect(() => {
    setLoading(true);
    dispatch(getCart());
  }, []);
  useEffect(() => {
    const src = Array.isArray(data)
      ? data
      : Array.isArray(CartStateData)
        ? CartStateData
        : [];
    const safe = src.map(normalise).filter(Boolean);
    setCart(safe);
    calculate(safe);
    setLoading(false);
  }, [CartStateData, data]);
  useEffect(() => {
    if (!BookStateData.length) dispatch(getBook());
  }, []);

  /* ── Delete ── */
  function deleteRecord(_id) {
    if (!window.confirm("Remove this item from cart?")) return;
    dispatch(deleteCart({ _id }));
    setCart((prev) => {
      const next = prev.filter((i) => i._id !== _id);
      calculate(next);
      return next;
    });
  }

  /* ── Update qty ──
   * FIX: guard already present — ebooks skip qty changes. Kept as-is.
   */
  function updateRecord(_id, option) {
    setCart((prev) => {
      const next = prev.map((item) => {
        if (item._id !== _id || item.isEbook) return item;
        let qty = item.qty;
        if (option === "DEC" && qty > 1) qty--;
        else if (option === "INC" && qty < item.book.stock) qty++;
        else return item;
        const updated = { ...item, qty, total: item.unitPrice * qty };
        dispatch(updateCart({ ...updated, book: updated.book._id }));
        return updated;
      });
      calculate(next);
      return next;
    });
  }

  // In the placeOrder function, change "books" key to match schema exactly.
  // This section replaces the placeOrder function in Cart.jsx

  function placeOrder() {
    setPlacingOrder(true);
    dispatch(
      createCheckout({
        user: localStorage.getItem("userid"),
        orderStatus: "Ordered",
        paymentMode: mode,
        paymentStatus: mode === "COD" ? "Pending" : "Done",
        subtotal,
        shipping,
        total,
        date: new Date(),
        books: cart.map((i) => ({
          // ← lowercase "books" matches schema
          book: i.book._id,
          format: i.format,
          qty: i.qty,
          total: i.total,
        })),
      }),
    );
    cart.forEach((ci) => {
      if (!ci.isEbook) {
        const b = BookStateData.find((b) => b._id === ci.book._id);
        if (b) {
          const formData = new FormData();
          Object.entries({ ...b, stock: b.stock - ci.qty }).forEach(
            ([key, val]) => {
              if (val !== null && val !== undefined) {
                formData.append(
                  key,
                  typeof val === "object" && !(val instanceof File)
                    ? JSON.stringify(val)
                    : val,
                );
              }
            },
          );
          dispatch(updateBook(formData));
        }
      }
      dispatch(deleteCart({ _id: ci._id }));
    });
    router.push(mode === "COD" ? "/confirmation" : "/payment/-1");
  }

  /* ── Loading ── */
  if (loading)
    return (
      <div className="cr">
        <style>{CSS}</style>
        <div
          style={{
            maxWidth: 1180,
            margin: "0 auto",
            padding: "40px 16px",
            position: "relative",
            zIndex: 1,
          }}
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 16,
                alignItems: "center",
                background: T.surface,
                border: `1.5px solid ${T.border}`,
                borderRadius: T.radius,
                padding: "16px 20px",
                marginBottom: 10,
                boxShadow: T.shadow1,
              }}
            >
              <div
                className="skeleton"
                style={{
                  width: 72,
                  height: 90,
                  borderRadius: 8,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <div
                  className="skeleton"
                  style={{ height: 14, width: "50%", marginBottom: 10 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "28%", marginBottom: 10 }}
                />
                <div
                  className="skeleton"
                  style={{ height: 11, width: "18%" }}
                />
              </div>
              <div
                className="skeleton"
                style={{ width: 88, height: 32, borderRadius: 999 }}
              />
              <div style={{ textAlign: "right" }}>
                <div
                  className="skeleton"
                  style={{ height: 11, width: 50, marginBottom: 6 }}
                />
                <div className="skeleton" style={{ height: 22, width: 64 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );

  /* ── Empty ── */
  if (!cart.length)
    return (
      <div
        className="cr"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <style>{CSS}</style>
        <div
          style={{
            textAlign: "center",
            padding: "60px 24px",
            maxWidth: 420,
            position: "relative",
            zIndex: 1,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, rgba(176,125,47,0.07) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <div
            className="float-anim"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: `1.5px solid rgba(176,125,47,0.22)`,
              background: T.goldGlow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 28px",
              fontSize: "2rem",
            }}
          >
            📚
          </div>
          <div
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.2em",
              color: T.gold,
              textTransform: "uppercase",
              marginBottom: 14,
            }}
          >
            Empty Basket
          </div>
          <h3
            style={{
              fontFamily: T.serif,
              fontWeight: 600,
              fontStyle: "italic",
              fontSize: "clamp(1.7rem,5vw,2.3rem)",
              color: T.textPrimary,
              lineHeight: 1.2,
              marginBottom: 14,
            }}
          >
            Your cart awaits
          </h3>
          <p
            style={{
              color: T.textSub,
              fontSize: "0.88rem",
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            Discover our curated collection — something extraordinary is waiting
            for you.
          </p>
          <Link
            href="/shop"
            className="btn-primary"
            style={{ maxWidth: 240, margin: "0 auto" }}
          >
            Browse Books <IconArrow />
          </Link>
        </div>
      </div>
    );

  /* ── Counts for summary badge ── */
  const ebookCount = cart.filter((i) => i.isEbook).length;
  const physicalCount = cart.filter((i) => !i.isEbook).length;

  /* ── Main ── */
  return (
    <div className="cr">
      <style>{CSS}</style>
      <div
        style={{
          maxWidth: 1180,
          margin: "0 auto",
          padding: "40px 16px 80px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Header */}
        {!isCheckout && (
          <div
            style={{
              marginBottom: 32,
              paddingBottom: 24,
              borderBottom: `1.5px solid ${T.border}`,
            }}
          >
            <div
              style={{
                fontSize: "0.58rem",
                fontWeight: 600,
                letterSpacing: "0.22em",
                color: T.gold,
                textTransform: "uppercase",
                marginBottom: 10,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 20,
                  height: 1,
                  background: T.gold,
                }}
              />
              Shopping Basket
              <span
                style={{
                  display: "block",
                  flex: 1,
                  height: 1,
                  background: `linear-gradient(90deg, ${T.borderMid}, transparent)`,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                flexWrap: "wrap",
              }}
            >
              <h1
                style={{
                  fontFamily: T.serif,
                  fontWeight: 600,
                  fontStyle: "italic",
                  fontSize: "clamp(2rem,5vw,3rem)",
                  color: T.textPrimary,
                  lineHeight: 1,
                  letterSpacing: "-0.01em",
                }}
              >
                Your Cart
              </h1>
              <span className="badge-gold">
                {cart.length} item{cart.length !== 1 ? "s" : ""}
              </span>
              {/* FIX: show breakdown so user can see ebooks are counted */}
              {ebookCount > 0 && physicalCount > 0 && (
                <span style={{ fontSize: "0.72rem", color: T.textMuted }}>
                  ({physicalCount} physical · {ebookCount} e-book
                  {ebookCount !== 1 ? "s" : ""})
                </span>
              )}
              {ebookCount > 0 && physicalCount === 0 && (
                <span style={{ fontSize: "0.72rem", color: T.sky }}>
                  (all e-books — instant delivery)
                </span>
              )}
            </div>
          </div>
        )}

        <div className="row g-4 align-items-start">
          {/* Items */}
          <div className={isCheckout ? "col-12 col-lg-7" : "col-lg-7 col-xl-8"}>
            {cart.map((item, idx) => {
              const b = item.book;
              return (
                /*
                 * FIX (Bug 2): add 'is-ebook' class so CSS gives the row a
                 * distinct border colour AND always shows the delete button
                 * without requiring hover.
                 */
                <div
                  key={item._id}
                  className={`c-item${item.isEbook ? " is-ebook" : ""}`}
                  style={{ animationDelay: `${0.05 + idx * 0.055}s` }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "16px 20px",
                      flexWrap: "wrap",
                    }}
                  >
                    {/* Cover */}
                    <div style={{ flexShrink: 0, position: "relative" }}>
                      <img
                        src={
                          b.pic
                            ? `${process.env.NEXT_PUBLIC_SERVER}/${b.pic}`
                            : "/img/noimage.jpg"
                        }
                        alt={b.title}
                        style={{
                          width: 72,
                          height: 90,
                          borderRadius: 8,
                          objectFit: "cover",
                          border: `1.5px solid ${item.isEbook ? "rgba(26,127,168,0.3)" : T.border}`,
                          display: "block",
                          transition: T.transition,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.04)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/img/noimage.jpg";
                        }}
                      />
                      {/* E-book overlay icon */}
                      {item.isEbook && (
                        <div
                          style={{
                            position: "absolute",
                            bottom: 4,
                            right: 4,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: T.sky,
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 8,
                          }}
                        >
                          <IconBolt />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: "1 1 140px", minWidth: 0 }}>
                      <div
                        style={{
                          fontFamily: T.serif,
                          fontWeight: 600,
                          fontStyle: "italic",
                          fontSize: "1rem",
                          color: T.textPrimary,
                          marginBottom: 5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {b.title}
                      </div>
                      {b.author && (
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: T.textMuted,
                            marginBottom: 7,
                          }}
                        >
                          by {b.author}
                        </div>
                      )}
                      {item.isEbook ? (
                        <span className="badge-ebook">
                          <IconBolt /> E-Book
                        </span>
                      ) : (
                        <span className="chip">{item.format}</span>
                      )}
                      {item.isEbook && (
                        <div
                          style={{
                            fontSize: "0.68rem",
                            color: T.sky,
                            marginTop: 6,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <IconBolt /> Instant delivery after payment
                        </div>
                      )}
                      {!item.isEbook && !isCheckout && (
                        <div
                          style={{
                            fontSize: "0.68rem",
                            fontWeight: 500,
                            marginTop: 6,
                            color: b.stock > 5 ? T.green : T.amber,
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <span
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: "currentColor",
                              display: "inline-block",
                              flexShrink: 0,
                            }}
                          />
                          {b.stock > 0 ? `${b.stock} in stock` : "Out of stock"}
                        </div>
                      )}
                    </div>

                    {/* Qty
                     * FIX: ebooks always show ×1 qty badge (not editable).
                     * Physical books in cart mode show the stepper;
                     * all items in checkout mode show the read-only badge.
                     */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        flexShrink: 0,
                      }}
                    >
                      {!isCheckout && !item.isEbook ? (
                        <div className="qty-ctrl">
                          <button
                            className="qty-btn"
                            onClick={() => updateRecord(item._id, "DEC")}
                            disabled={item.qty <= 1}
                          >
                            −
                          </button>
                          <span className="qty-val">{item.qty}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateRecord(item._id, "INC")}
                            disabled={item.qty >= b.stock}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <span className="qty-badge">×{item.qty}</span>
                      )}
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        textAlign: "right",
                        flexShrink: 0,
                        minWidth: 72,
                      }}
                    >
                      <div
                        style={{
                          fontSize: "0.68rem",
                          color: T.textMuted,
                          marginBottom: 4,
                        }}
                      >
                        ₹{item.unitPrice} each
                      </div>
                      <div
                        style={{
                          fontFamily: T.serif,
                          fontWeight: 700,
                          fontSize: "1.2rem",
                          color: T.gold,
                        }}
                      >
                        ₹{item.total}
                      </div>
                    </div>

                    {/* Delete
                     * FIX (Bug 2): ebooks get `always-visible` class so they
                     * don't require hover to reveal the remove button.
                     */}
                    {!isCheckout && (
                      <button
                        className={`del-btn${item.isEbook ? " always-visible" : ""}`}
                        onClick={() => deleteRecord(item._id)}
                        title="Remove item"
                      >
                        <IconTrash />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={isCheckout ? "col-12 col-lg-5" : "col-lg-5 col-xl-4"}>
            <div className="sum-card">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background: T.goldGlow,
                    border: `1.5px solid rgba(176,125,47,0.18)`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: T.gold,
                  }}
                >
                  <IconReceipt />
                </div>
                <span
                  style={{
                    fontFamily: T.serif,
                    fontWeight: 600,
                    fontStyle: "italic",
                    fontSize: "1.15rem",
                    color: T.textPrimary,
                  }}
                >
                  Order Summary
                </span>
              </div>

              <div className="divider" />

              <div className="sum-row">
                <span style={{ color: T.textSub, fontSize: "0.82rem" }}>
                  Subtotal{" "}
                  <span style={{ color: T.textMuted }}>
                    ({cart.length} item{cart.length !== 1 ? "s" : ""})
                  </span>
                </span>
                <span
                  style={{
                    fontWeight: 500,
                    color: T.textPrimary,
                    fontSize: "0.86rem",
                  }}
                >
                  ₹{subtotal}
                </span>
              </div>

              {/* FIX: show ebook note in summary when applicable */}
              {ebookCount > 0 && (
                <div className="sum-row">
                  <span
                    style={{
                      color: T.sky,
                      fontSize: "0.78rem",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <IconBolt /> {ebookCount} e-book
                    {ebookCount !== 1 ? "s" : ""} (no shipping)
                  </span>
                  <span className="badge-free">Digital</span>
                </div>
              )}

              <div className="sum-row">
                <span style={{ color: T.textSub, fontSize: "0.82rem" }}>
                  Delivery
                </span>
                {shipping === 0 ? (
                  <span className="badge-free">
                    {physicalCount === 0 ? "N/A" : "Free"}
                  </span>
                ) : (
                  <span
                    style={{
                      fontWeight: 500,
                      color: T.textPrimary,
                      fontSize: "0.86rem",
                    }}
                  >
                    ₹{shipping}
                  </span>
                )}
              </div>

              {shipping > 0 && (
                <div className="nudge-strip">
                  <span style={{ flexShrink: 0, color: T.amber }}>
                    <IconTruck />
                  </span>
                  <span>
                    Add <strong>₹{1000 - subtotal}</strong> more for free
                    delivery
                  </span>
                </div>
              )}

              <div className="divider" />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                }}
              >
                <span
                  style={{
                    fontFamily: T.serif,
                    fontStyle: "italic",
                    fontSize: "1rem",
                    color: T.textPrimary,
                    fontWeight: 600,
                  }}
                >
                  Total
                </span>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      fontFamily: T.serif,
                      fontWeight: 700,
                      fontSize: "2rem",
                      color: T.gold,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                    }}
                  >
                    ₹{total}
                  </div>
                  <div
                    style={{
                      fontSize: "0.65rem",
                      color: T.textMuted,
                      marginTop: 2,
                    }}
                  >
                    incl. all taxes
                  </div>
                </div>
              </div>

              {isCheckout && (
                <div style={{ marginTop: 20 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: "0.65rem",
                      fontWeight: 600,
                      color: T.textMuted,
                      textTransform: "uppercase",
                      letterSpacing: "0.14em",
                      marginBottom: 8,
                    }}
                  >
                    <span style={{ color: T.gold, fontSize: "0.7rem" }}>⚿</span>
                    Payment Method
                  </label>
                  <select
                    className="pay-select"
                    value={mode}
                    onChange={(e) => setMode(e.target.value)}
                  >
                    <option value="COD">Cash on Delivery</option>
                    <option value="Net Banking">
                      Net Banking / UPI / Card
                    </option>
                  </select>
                  {/* FIX: note that COD is unavailable for ebook-only orders */}
                  {ebookCount > 0 && physicalCount === 0 && mode === "COD" && (
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: T.amber,
                        marginTop: 8,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 5,
                        lineHeight: 1.5,
                      }}
                    >
                      ⚠ Cash on Delivery is not available for e-book orders.
                      Please select online payment.
                    </p>
                  )}
                </div>
              )}

              {!isCheckout ? (
                <Link href="/checkout" className="btn-primary">
                  Proceed to Checkout <IconArrow />
                </Link>
              ) : (
                <button
                  className="btn-success"
                  onClick={placeOrder}
                  disabled={
                    placingOrder ||
                    (ebookCount > 0 && physicalCount === 0 && mode === "COD")
                  }
                >
                  {placingOrder ? (
                    <>
                      <IconSpin /> Placing Order…
                    </>
                  ) : (
                    <>
                      <IconCheck /> Place Order
                    </>
                  )}
                </button>
              )}

              {!isCheckout && (
                <Link href="/shop" className="back-link">
                  ← Continue Shopping
                </Link>
              )}

              <div className="trust-row">
                {[
                  { icon: <IconShield />, label: "Secure" },
                  { icon: <IconRefund />, label: "Easy Returns" },
                  { icon: <IconHeadset />, label: "24/7 Support" },
                ].map((b) => (
                  <div key={b.label} className="trust-item">
                    <div className="trust-icon">{b.icon}</div>
                    <span
                      style={{
                        fontSize: "0.6rem",
                        color: T.textMuted,
                        fontWeight: 500,
                        letterSpacing: "0.05em",
                      }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
