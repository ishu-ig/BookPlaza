"use client";

import React, { useEffect, useState } from "react";
import Book from "../Components/Book";

import { getCategory } from "../Redux/ActionCreartors/CategoryActionCreators";
import { getSubcategory } from "../Redux/ActionCreartors/SubcategoryActionCreators";
import { getPublisher } from "../Redux/ActionCreartors/PublisherActionCreators";
import { getBook } from "../Redux/ActionCreartors/BookActionCreators";

import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const STYLE_ID = "shoppage-styles";
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');

  /* ══════════════════════════════════════
     PAGE SHELL
  ══════════════════════════════════════ */
  .sp-root {
    background: #F7F0E6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    font-family: 'DM Sans', sans-serif;
  }

  /* ══════════════════════════════════════
     HERO STRIP
  ══════════════════════════════════════ */
  .sp-hero {
    background: #1A1208;
    padding: 48px 40px 40px;
    position: relative;
    overflow: hidden;
  }
  /* Gold radial glow */
  .sp-hero::before {
    content: '';
    position: absolute;
    top: -100px; right: -100px;
    width: 380px; height: 380px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,146,42,0.12) 0%, transparent 65%);
    pointer-events: none;
  }
  /* Faint dot texture */
  .sp-hero::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle, rgba(200,146,42,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
  }
  .sp-hero-inner { position: relative; z-index: 1; }

  .sp-hero-eyebrow {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.22em; text-transform: uppercase;
    color: #C8922A; margin-bottom: 10px;
  }
  .sp-hero-eyebrow::before {
    content: ''; display: block;
    width: 24px; height: 1.5px;
    background: #C8922A; flex-shrink: 0;
  }
  .sp-hero-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: clamp(26px, 4vw, 44px);
    font-weight: 700; color: #FDFAF5;
    letter-spacing: -0.01em; line-height: 1.1;
    margin: 0 0 10px;
  }
  .sp-hero-title em { font-style: italic; color: #C8922A; }
  .sp-hero-meta {
    font-size: 13px; font-weight: 300;
    color: rgba(253,250,245,0.45);
  }
  .sp-hero-meta strong { color: #C8922A; font-weight: 600; }

  /* ══════════════════════════════════════
     BODY GRID
  ══════════════════════════════════════ */
  .sp-body {
    display: grid;
    grid-template-columns: 256px 1fr;
    flex: 1;
  }
  @media (max-width: 991px) {
    .sp-body { grid-template-columns: 1fr; }
  }

  /* ══════════════════════════════════════
     SIDEBAR
  ══════════════════════════════════════ */
  .sp-sidebar {
    background: #F0E8D8;
    border-right: 1px solid #E0D5C0;
    padding: 32px 22px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
    scrollbar-width: none;
  }
  .sp-sidebar::-webkit-scrollbar { display: none; }

  .sp-sidebar-section { margin-bottom: 28px; }

  .sp-sidebar-head {
    font-family: 'DM Sans', sans-serif;
    font-size: 10px; font-weight: 600;
    letter-spacing: 0.18em; text-transform: uppercase;
    color: #8C7B6B;
    margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }
  .sp-sidebar-head::after {
    content: '';
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #D5C9B0, transparent);
  }

  /* filter links */
  .sp-filter-list {
    list-style: none; padding: 0; margin: 0;
    display: flex; flex-direction: column; gap: 2px;
  }
  .sp-filter-link {
    display: flex; align-items: center; gap: 9px;
    font-size: 13px; font-weight: 300;
    color: #6B5B4A;
    padding: 8px 11px;
    border-radius: 8px;
    text-decoration: none;
    border: 1px solid transparent;
    transition: background 0.18s, color 0.18s, border-color 0.18s;
  }
  .sp-filter-link::before {
    content: '';
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #D5C9B0;
    flex-shrink: 0;
    transition: background 0.18s;
  }
  .sp-filter-link:hover {
    background: #E8DCC8;
    color: #1A1208;
    text-decoration: none;
  }
  .sp-filter-link:hover::before { background: #C8922A; }
  .sp-filter-link.sp-active {
    background: rgba(200,146,42,0.12);
    border-color: rgba(200,146,42,0.3);
    color: #1A1208;
    font-weight: 500;
  }
  .sp-filter-link.sp-active::before { background: #C8922A; }

  /* sidebar divider */
  .sp-sdivider {
    border: none;
    border-top: 1px solid #E0D5C0;
    margin: 0 0 28px;
  }

  /* price inputs */
  .sp-price-row {
    display: grid; grid-template-columns: 1fr 1fr; gap: 8px;
    margin-bottom: 10px;
  }
  .sp-price-input {
    width: 100%;
    background: #FDFAF5;
    border: 1px solid #D5C9B0;
    border-radius: 8px;
    padding: 9px 11px;
    font-size: 13px; font-weight: 300;
    color: #1A1208;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .sp-price-input::placeholder { color: #B0A090; }
  .sp-price-input:focus {
    border-color: #C8922A;
    box-shadow: 0 0 0 3px rgba(200,146,42,0.1);
  }
  .sp-price-btn {
    width: 100%;
    background: #6B2737;
    border: none; border-radius: 8px;
    padding: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.08em; text-transform: uppercase;
    color: #FDFAF5;
    cursor: pointer;
    transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  }
  .sp-price-btn:hover {
    background: #C8922A;
    color: #1A1208;
    transform: translateY(-1px);
    box-shadow: 0 6px 16px rgba(200,146,42,0.28);
  }

  /* ══════════════════════════════════════
     MAIN AREA
  ══════════════════════════════════════ */
  .sp-main {
    background: #F7F0E6;
    padding: 32px 36px;
  }
  @media (max-width: 767px) { .sp-main { padding: 20px 16px; } }

  /* ── TOOLBAR ── */
  .sp-toolbar {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 20px; flex-wrap: wrap;
  }

  .sp-search-wrap {
    flex: 1; min-width: 200px;
    position: relative;
  }
  .sp-search-icon {
    position: absolute; left: 13px; top: 50%;
    transform: translateY(-50%);
    color: #B0A090; font-size: 13px;
    pointer-events: none;
  }
  .sp-search-input {
    width: 100%;
    background: #FDFAF5;
    border: 1px solid #D5C9B0;
    border-radius: 10px;
    padding: 11px 14px 11px 38px;
    font-size: 13px; font-weight: 300;
    color: #1A1208;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .sp-search-input::placeholder { color: #B0A090; }
  .sp-search-input:focus {
    border-color: #C8922A;
    box-shadow: 0 0 0 3px rgba(200,146,42,0.1);
  }

  .sp-sort-select {
    background: #FDFAF5;
    border: 1px solid #D5C9B0;
    border-radius: 10px;
    padding: 11px 36px 11px 14px;
    font-size: 13px; font-weight: 300;
    color: #1A1208;
    font-family: 'DM Sans', sans-serif;
    outline: none; cursor: pointer;
    appearance: none; -webkit-appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    transition: border-color 0.18s;
  }
  .sp-sort-select:focus { border-color: #C8922A; outline: none; }

  .sp-result-badge {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(200,146,42,0.1);
    border: 1px solid rgba(200,146,42,0.25);
    border-radius: 100px;
    padding: 5px 13px;
    font-size: 12px; font-weight: 500;
    color: #6B2737;
    white-space: nowrap;
  }

  /* ── ACTIVE CHIPS ── */
  .sp-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 22px; }
  .sp-chip {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 11px; font-weight: 500;
    color: #6B2737;
    background: rgba(107,39,55,0.07);
    border: 1px solid rgba(107,39,55,0.2);
    border-radius: 100px;
    padding: 4px 12px;
    text-decoration: none;
    transition: background 0.18s;
  }
  .sp-chip:hover { background: rgba(107,39,55,0.13); text-decoration: none; color: #6B2737; }
  .sp-chip i { font-size: 10px; }
  .sp-chip-clear {
    color: #8C7B6B; border-color: #D5C9B0;
    background: transparent;
  }
  .sp-chip-clear:hover { background: #E8DCC8; color: #1A1208; }

  /* ── MOBILE FILTER TOGGLE ── */
  .sp-mobile-btn {
    display: none;
    align-items: center; gap: 7px;
    font-size: 12px; font-weight: 600;
    letter-spacing: 0.07em; text-transform: uppercase;
    color: #6B5B4A;
    background: #FDFAF5;
    border: 1px solid #D5C9B0;
    border-radius: 10px;
    padding: 11px 16px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.18s, color 0.18s;
  }
  .sp-mobile-btn:hover { border-color: #C8922A; color: #1A1208; }
  @media (max-width: 991px) {
    .sp-mobile-btn { display: inline-flex; }
    .sp-sidebar { display: none; height: auto; position: static; border-right: none; border-bottom: 1px solid #E0D5C0; }
    .sp-sidebar.sp-open { display: block; }
  }

  /* ── EMPTY STATE ── */
  .sp-empty {
    text-align: center; padding: 80px 0;
  }
  .sp-empty-icon {
    font-size: 44px; color: #D5C9B0;
    margin-bottom: 16px; display: block;
  }
  .sp-empty-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 20px; color: #1A1208;
    margin-bottom: 8px;
  }
  .sp-empty-sub {
    font-size: 14px; font-weight: 300;
    color: #8C7B6B;
  }
  .sp-empty-reset {
    display: inline-block; margin-top: 20px;
    font-size: 13px; font-weight: 600;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: #6B2737;
    border: 1.5px solid #6B2737;
    padding: 10px 28px; border-radius: 100px;
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
  }
  .sp-empty-reset:hover {
    background: #6B2737; color: #FDFAF5; text-decoration: none;
  }
`;

export default function ShopPage() {
  const [data,        setData]        = useState([]);
  const [mc,          setMc]          = useState("All");
  const [sc,          setSc]          = useState("All");
  const [br,          setBr]          = useState("All");
  const [search,      setSearch]      = useState("");
  const [min,         setMin]         = useState("");
  const [max,         setMax]         = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const BookStateData        = useSelector((s) => s.BookStateData);
  const CategoryStateData    = useSelector((s) => s.CategoryStateData);
  const SubcategoryStateData = useSelector((s) => s.SubcategoryStateData);
  const PublisherStateData   = useSelector((s) => s.PublisherStateData);

  const dispatch     = useDispatch();
  const searchParams = useSearchParams();

  // Inject styles once
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID;
    tag.textContent = CSS;
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    dispatch(getCategory());
    dispatch(getSubcategory());
    dispatch(getPublisher());
    dispatch(getBook());
  }, [dispatch]);

  useEffect(() => {
    const mcP = searchParams.get("mc") || "All";
    const scP = searchParams.get("sc") || "All";
    const brP = searchParams.get("br") || "All";
    setMc(mcP); setSc(scP); setBr(brP);
    if (BookStateData.length) applyFilter(mcP, scP, brP);
  }, [BookStateData, searchParams]);

  function applyFilter(mcV, scV, brV, minV = -1, maxV = -1) {
    setData(
      BookStateData.filter(
        (p) =>
          p.active &&
          (mcV === "All" || p.Category?.name === mcV) &&
          (scV === "All" || p.subcategory?.name === scV) &&
          (brV === "All" || p.Publisher?.name === brV) &&
          (minV === -1 || p.finalPrice >= minV) &&
          (maxV === -1 || p.finalPrice <= maxV)
      )
    );
  }

  function postSearch(e) {
    e.preventDefault();
    const ch = search.toLowerCase();
    setData(
      BookStateData.filter(
        (x) =>
          x.active &&
          (x.Category?.name?.toLowerCase().includes(ch) ||
            x.subcategory?.name?.toLowerCase().includes(ch) ||
            x.Publisher?.name?.toLowerCase().includes(ch) ||
            x.description?.toLowerCase().includes(ch))
      )
    );
  }

  function applyPriceFilter(e) {
    e.preventDefault();
    applyFilter(mc, sc, br, min !== "" ? Number(min) : -1, max !== "" ? Number(max) : -1);
  }

  function sortFilter(option) {
    const sorted = [...data];
    if (option === "1") sorted.sort((a, b) => b._id.localeCompare(a._id));
    else if (option === "2") sorted.sort((a, b) => b.finalPrice - a.finalPrice);
    else sorted.sort((a, b) => a.finalPrice - b.finalPrice);
    setData(sorted);
  }

  const activeFilters = [
    mc !== "All" && { label: `Category: ${mc}`, href: `/shop?mc=All&sc=${sc}&br=${br}` },
    sc !== "All" && { label: `Sub: ${sc}`,       href: `/shop?mc=${mc}&sc=All&br=${br}` },
    br !== "All" && { label: `Publisher: ${br}`, href: `/shop?mc=${mc}&sc=${sc}&br=All` },
  ].filter(Boolean);

  return (
    <div className="sp-root">

      {/* ── HERO ── */}
      <div className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-hero-eyebrow">Browse the store</div>
          <h1 className="sp-hero-title">
            Our <em>Collection</em>
          </h1>
          <p className="sp-hero-meta">
            <strong>{data.length}</strong> products available
            {mc !== "All" && <> &nbsp;·&nbsp; filtered by <strong>{mc}</strong></>}
          </p>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="sp-body">

        {/* ── SIDEBAR ── */}
        <aside className={`sp-sidebar${sidebarOpen ? " sp-open" : ""}`}>

          {/* Category */}
          <div className="sp-sidebar-section">
            <div className="sp-sidebar-head">Category</div>
            <ul className="sp-filter-list">
              <li>
                <Link href={`/shop?mc=All&sc=${sc}&br=${br}`}
                  className={`sp-filter-link${mc === "All" ? " sp-active" : ""}`}>
                  All Categories
                </Link>
              </li>
              {CategoryStateData.filter((x) => x.active).map((item) => (
                <li key={item._id}>
                  <Link href={`/shop?mc=${item.name}&sc=${sc}&br=${br}`}
                    className={`sp-filter-link${mc === item.name ? " sp-active" : ""}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <hr className="sp-sdivider" />

          {/* Subcategory */}
          <div className="sp-sidebar-section">
            <div className="sp-sidebar-head">Subcategory</div>
            <ul className="sp-filter-list">
              <li>
                <Link href={`/shop?mc=${mc}&sc=All&br=${br}`}
                  className={`sp-filter-link${sc === "All" ? " sp-active" : ""}`}>
                  All Subcategories
                </Link>
              </li>
              {SubcategoryStateData.filter((x) => x.active).map((item) => (
                <li key={item._id}>
                  <Link href={`/shop?mc=${mc}&sc=${item.name}&br=${br}`}
                    className={`sp-filter-link${sc === item.name ? " sp-active" : ""}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <hr className="sp-sdivider" />

          {/* Publisher */}
          <div className="sp-sidebar-section">
            <div className="sp-sidebar-head">Publisher</div>
            <ul className="sp-filter-list">
              <li>
                <Link href={`/shop?mc=${mc}&sc=${sc}&br=All`}
                  className={`sp-filter-link${br === "All" ? " sp-active" : ""}`}>
                  All Publishers
                </Link>
              </li>
              {PublisherStateData.filter((x) => x.active).map((item) => (
                <li key={item._id}>
                  <Link href={`/shop?mc=${mc}&sc=${sc}&br=${item.name}`}
                    className={`sp-filter-link${br === item.name ? " sp-active" : ""}`}>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <hr className="sp-sdivider" />

          {/* Price */}
          <div className="sp-sidebar-section">
            <div className="sp-sidebar-head">Price Range</div>
            <form onSubmit={applyPriceFilter}>
              <div className="sp-price-row">
                <input type="number" value={min} onChange={(e) => setMin(e.target.value)}
                  className="sp-price-input" placeholder="Min ₹" />
                <input type="number" value={max} onChange={(e) => setMax(e.target.value)}
                  className="sp-price-input" placeholder="Max ₹" />
              </div>
              <button type="submit" className="sp-price-btn">Apply filter</button>
            </form>
          </div>

        </aside>

        {/* ── MAIN ── */}
        <main className="sp-main">

          {/* Toolbar */}
          <div className="sp-toolbar">
            <button className="sp-mobile-btn" onClick={() => setSidebarOpen((o) => !o)}>
              <i className="fa-solid fa-sliders" />
              {sidebarOpen ? "Hide filters" : "Filters"}
            </button>

            <form onSubmit={postSearch} className="sp-search-wrap">
              <i className="fa-solid fa-magnifying-glass sp-search-icon" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, category, publisher…"
                className="sp-search-input"
              />
            </form>

            <select className="sp-sort-select" onChange={(e) => sortFilter(e.target.value)}>
              <option value="1">Latest</option>
              <option value="2">Price: High → Low</option>
              <option value="3">Price: Low → High</option>
            </select>

            <span className="sp-result-badge">
              <i className="fa-solid fa-layer-group" style={{ fontSize: 10 }} />
              {data.length} results
            </span>
          </div>

          {/* Active filter chips */}
          {activeFilters.length > 0 && (
            <div className="sp-chips">
              {activeFilters.map(({ label, href }) => (
                <Link key={label} href={href} className="sp-chip">
                  {label} <i className="fa-solid fa-xmark" />
                </Link>
              ))}
              <Link href="/shop?mc=All&sc=All&br=All" className="sp-chip sp-chip-clear">
                Clear all <i className="fa-solid fa-xmark" />
              </Link>
            </div>
          )}

          {/* Products or empty */}
          {data.length === 0 ? (
            <div className="sp-empty">
              <i className="fa-regular fa-box-open sp-empty-icon" />
              <div className="sp-empty-title">No products found</div>
              <p className="sp-empty-sub">Try adjusting your filters or search term.</p>
              <Link href="/shop?mc=All&sc=All&br=All" className="sp-empty-reset">
                Clear all filters
              </Link>
            </div>
          ) : (
            <Book title="Shop" data={data} />
          )}

        </main>
      </div>
    </div>
  );
}