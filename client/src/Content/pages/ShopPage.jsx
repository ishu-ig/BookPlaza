"use client";

import React, { useEffect, useState, useMemo, Suspense } from "react";
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

  .sp-root { background:#F7F0E6; min-height:100vh; display:flex; flex-direction:column; font-family:'DM Sans',sans-serif; }

  .sp-hero { background:#1A1208; padding:48px 40px 40px; position:relative; overflow:hidden; }
  .sp-hero::before { content:''; position:absolute; top:-100px; right:-100px; width:380px; height:380px; border-radius:50%; background:radial-gradient(circle,rgba(200,146,42,.12) 0%,transparent 65%); pointer-events:none; }
  .sp-hero::after  { content:''; position:absolute; inset:0; background-image:radial-gradient(circle,rgba(200,146,42,.06) 1px,transparent 1px); background-size:28px 28px; pointer-events:none; }
  .sp-hero-inner { position:relative; z-index:1; }
  .sp-hero-eyebrow { display:inline-flex; align-items:center; gap:10px; font-size:10px; font-weight:600; letter-spacing:.22em; text-transform:uppercase; color:#C8922A; margin-bottom:10px; }
  .sp-hero-eyebrow::before { content:''; display:block; width:24px; height:1.5px; background:#C8922A; flex-shrink:0; }
  .sp-hero-title { font-family:'Playfair Display',Georgia,serif; font-size:clamp(26px,4vw,44px); font-weight:700; color:#FDFAF5; letter-spacing:-.01em; line-height:1.1; margin:0 0 10px; }
  .sp-hero-title em { font-style:italic; color:#C8922A; }
  .sp-hero-meta { font-size:13px; font-weight:300; color:rgba(253,250,245,.45); }
  .sp-hero-meta strong { color:#C8922A; font-weight:600; }
  @media(max-width:767px){ .sp-hero{ padding:32px 20px 28px; } }

  .sp-body { display:grid; grid-template-columns:256px 1fr; flex:1; }
  @media(max-width:991px){ .sp-body{ grid-template-columns:1fr; } }

  .sp-sidebar { background:#F0E8D8; border-right:1px solid #E0D5C0; padding:32px 22px; position:sticky; top:0; height:100vh; overflow-y:auto; scrollbar-width:none; }
  .sp-sidebar::-webkit-scrollbar{ display:none; }
  @media(max-width:991px){ .sp-sidebar{ display:none; } }

  .sp-backdrop { position:fixed; inset:0; z-index:400; background:rgba(26,18,8,.6); opacity:0; visibility:hidden; transition:opacity .28s ease,visibility .28s ease; pointer-events:none; }
  .sp-backdrop.sp-is-open { opacity:1; visibility:visible; pointer-events:auto; }

  .sp-drawer { position:fixed; top:0; left:0; bottom:0; z-index:401; width:min(300px,82vw); background:#F0E8D8; overflow-y:auto; scrollbar-width:none; transform:translateX(-100%); transition:transform .30s cubic-bezier(.4,0,.2,1); box-shadow:6px 0 32px rgba(26,18,8,.22); pointer-events:none; }
  .sp-drawer::-webkit-scrollbar{ display:none; }
  .sp-drawer.sp-is-open { transform:translateX(0); pointer-events:auto; }
  .sp-drawer-header { display:flex; align-items:center; justify-content:space-between; padding:18px 20px 14px; background:#1A1208; position:sticky; top:0; z-index:1; }
  .sp-drawer-title { font-family:'Playfair Display',serif; font-size:17px; font-weight:700; color:#FDFAF5; letter-spacing:-.01em; margin:0; }
  .sp-drawer-close { display:flex; align-items:center; justify-content:center; width:38px; height:38px; background:rgba(200,146,42,.15); border:1.5px solid rgba(200,146,42,.4); border-radius:50%; color:#C8922A; font-size:17px; font-weight:600; cursor:pointer; padding:0; -webkit-tap-highlight-color:transparent; transition:background .18s; }
  .sp-drawer-close:hover, .sp-drawer-close:active { background:rgba(200,146,42,.32); }
  .sp-drawer-body { padding:22px 18px 40px; }

  body.sp-locked { overflow:hidden; touch-action:none; }

  .sp-sidebar-section { margin-bottom:26px; }
  .sp-sidebar-head { font-size:10px; font-weight:600; letter-spacing:.18em; text-transform:uppercase; color:#8C7B6B; margin-bottom:10px; display:flex; align-items:center; gap:8px; }
  .sp-sidebar-head::after { content:''; flex:1; height:1px; background:linear-gradient(90deg,#D5C9B0,transparent); }
  .sp-filter-list { list-style:none; padding:0; margin:0; display:flex; flex-direction:column; gap:2px; }
  .sp-filter-link { display:flex; align-items:center; gap:9px; font-size:13px; font-weight:300; color:#6B5B4A; padding:9px 11px; border-radius:8px; text-decoration:none; border:1px solid transparent; min-height:42px; -webkit-tap-highlight-color:transparent; transition:background .15s,color .15s,border-color .15s; }
  .sp-filter-link::before { content:''; width:5px; height:5px; border-radius:50%; background:#D5C9B0; flex-shrink:0; transition:background .15s; }
  .sp-filter-link:hover, .sp-filter-link:active { background:#E8DCC8; color:#1A1208; text-decoration:none; }
  .sp-filter-link:hover::before { background:#C8922A; }
  .sp-filter-link.sp-active { background:rgba(200,146,42,.12); border-color:rgba(200,146,42,.3); color:#1A1208; font-weight:500; }
  .sp-filter-link.sp-active::before { background:#C8922A; }

  .sp-sdivider { border:none; border-top:1px solid #E0D5C0; margin:0 0 26px; }

  .sp-price-row { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-bottom:10px; }
  .sp-price-input { width:100%; background:#FDFAF5; border:1px solid #D5C9B0; border-radius:8px; padding:10px 11px; font-size:13px; font-weight:300; color:#1A1208; outline:none; font-family:'DM Sans',sans-serif; -webkit-appearance:none; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; }
  .sp-price-input::placeholder { color:#B0A090; }
  .sp-price-input:focus { border-color:#C8922A; box-shadow:0 0 0 3px rgba(200,146,42,.1); }
  .sp-price-btn { width:100%; background:#6B2737; border:none; border-radius:8px; padding:11px; font-family:'DM Sans',sans-serif; font-size:12px; font-weight:600; letter-spacing:.08em; text-transform:uppercase; color:#FDFAF5; cursor:pointer; min-height:46px; -webkit-tap-highlight-color:transparent; transition:background .18s; }
  .sp-price-btn:hover  { background:#8B3448; }
  .sp-price-btn:active { background:#C8922A; color:#1A1208; }

  .sp-main { background:#F7F0E6; padding:28px 32px; }
  @media(max-width:991px){ .sp-main{ padding:22px 18px; } }
  @media(max-width:479px){ .sp-main{ padding:16px 14px; } }

  .sp-toolbar { display:flex; align-items:center; gap:10px; margin-bottom:18px; flex-wrap:wrap; }

  .sp-filter-btn { display:none; align-items:center; gap:8px; font-size:13px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#FDFAF5; background:#1A1208; border:1.5px solid #3A2E1E; border-radius:10px; padding:0 18px; height:46px; cursor:pointer; font-family:'DM Sans',sans-serif; white-space:nowrap; flex-shrink:0; -webkit-tap-highlight-color:transparent; transition:border-color .18s,background .18s; }
  .sp-filter-btn:hover  { border-color:#C8922A; background:#241909; }
  .sp-filter-btn:active { background:#2A1E0E; }
  .sp-filter-btn-dot { width:7px; height:7px; border-radius:50%; background:#C8922A; flex-shrink:0; opacity:0; transition:opacity .2s; }
  .sp-filter-btn-dot.on { opacity:1; }
  @media(max-width:991px){ .sp-filter-btn{ display:inline-flex; } }

  .sp-search-wrap { flex:1; min-width:160px; position:relative; }
  .sp-search-icon { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:#B0A090; font-size:13px; pointer-events:none; }
  .sp-search-input { width:100%; background:#FDFAF5; border:1px solid #D5C9B0; border-radius:10px; padding:0 14px 0 38px; font-size:13px; font-weight:300; color:#1A1208; outline:none; font-family:'DM Sans',sans-serif; height:46px; -webkit-appearance:none; box-sizing:border-box; transition:border-color .15s,box-shadow .15s; }
  .sp-search-input::placeholder { color:#B0A090; }
  .sp-search-input:focus { border-color:#C8922A; box-shadow:0 0 0 3px rgba(200,146,42,.1); }

  .sp-row2 { display:contents; }
  @media(max-width:599px){ .sp-row2{ display:flex; width:100%; gap:8px; align-items:center; } }

  .sp-sort-select { background:#FDFAF5; border:1px solid #D5C9B0; border-radius:10px; padding:0 36px 0 14px; font-size:13px; font-weight:300; color:#1A1208; font-family:'DM Sans',sans-serif; outline:none; cursor:pointer; appearance:none; -webkit-appearance:none; background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238C7B6B' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat:no-repeat; background-position:right 12px center; height:46px; transition:border-color .15s; }
  @media(max-width:599px){ .sp-sort-select{ flex:1; } }
  .sp-sort-select:focus { border-color:#C8922A; outline:none; }

  .sp-result-badge { display:inline-flex; align-items:center; gap:5px; background:rgba(200,146,42,.1); border:1px solid rgba(200,146,42,.25); border-radius:100px; padding:0 14px; font-size:12px; font-weight:500; color:#6B2737; white-space:nowrap; flex-shrink:0; height:46px; }

  .sp-chips { display:flex; flex-wrap:wrap; gap:8px; margin-bottom:20px; }
  .sp-chip { display:inline-flex; align-items:center; gap:6px; font-size:12px; font-weight:500; color:#6B2737; background:rgba(107,39,55,.07); border:1px solid rgba(107,39,55,.2); border-radius:100px; padding:7px 14px; text-decoration:none; -webkit-tap-highlight-color:transparent; transition:background .15s; cursor:pointer; }
  .sp-chip:hover { background:rgba(107,39,55,.13); text-decoration:none; color:#6B2737; }
  .sp-chip i { font-size:10px; }
  .sp-chip-clear { color:#8C7B6B; border-color:#D5C9B0; background:transparent; }
  .sp-chip-clear:hover { background:#E8DCC8; color:#1A1208; }

  .sp-empty { text-align:center; padding:80px 0; }
  .sp-empty-icon { font-size:44px; color:#D5C9B0; margin-bottom:16px; display:block; }
  .sp-empty-title { font-family:'Playfair Display',Georgia,serif; font-size:20px; color:#1A1208; margin-bottom:8px; }
  .sp-empty-sub { font-size:14px; font-weight:300; color:#8C7B6B; }
  .sp-empty-reset { display:inline-block; margin-top:20px; font-size:13px; font-weight:600; letter-spacing:.06em; text-transform:uppercase; color:#6B2737; border:1.5px solid #6B2737; padding:10px 28px; border-radius:100px; text-decoration:none; transition:background .2s,color .2s; }
  .sp-empty-reset:hover { background:#6B2737; color:#FDFAF5; text-decoration:none; }
  .sp-loading { text-align:center; padding:80px 0; color:#8C7B6B; font-size:14px; }
`;

/* ── Helper: safely get a nested name regardless of field casing ──────── */
function getField(book, ...keys) {
  for (const key of keys) {
    const val = book[key];
    if (val !== undefined && val !== null) {
      // val may be an object like { name: "..." } or a plain string
      if (typeof val === "object" && val.name) return val.name;
      if (typeof val === "string") return val;
    }
  }
  return "";
}

/* ── Shared filter panel content ─────────────────────────────────────── */
function FilterContent({
  mc, sc, br,
  min, max, setMin, setMax,
  onPriceSubmit, onLinkClick,
  CategoryStateData, SubcategoryStateData, PublisherStateData,
}) {
  return (
    <>
      <div className="sp-sidebar-section">
        <div className="sp-sidebar-head">Category</div>
        <ul className="sp-filter-list">
          <li>
            <Link
              href="/shop?mc=All&sc=All&br=All"
              className={`sp-filter-link${mc === "All" ? " sp-active" : ""}`}
              onClick={onLinkClick}
            >All Categories</Link>
          </li>
          {CategoryStateData.filter((x) => x.active).map((item) => (
            <li key={item._id}>
              <Link
                href={`/shop?mc=${encodeURIComponent(item.name)}&sc=All&br=All`}
                className={`sp-filter-link${mc === item.name ? " sp-active" : ""}`}
                onClick={onLinkClick}
              >{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <hr className="sp-sdivider" />

      <div className="sp-sidebar-section">
        <div className="sp-sidebar-head">Subcategory</div>
        <ul className="sp-filter-list">
          <li>
            <Link
              href={`/shop?mc=${mc === "All" ? "All" : encodeURIComponent(mc)}&sc=All&br=${br === "All" ? "All" : encodeURIComponent(br)}`}
              className={`sp-filter-link${sc === "All" ? " sp-active" : ""}`}
              onClick={onLinkClick}
            >All Subcategories</Link>
          </li>
          {SubcategoryStateData.filter((x) => x.active).map((item) => (
            <li key={item._id}>
              <Link
                href={`/shop?mc=${mc === "All" ? "All" : encodeURIComponent(mc)}&sc=${encodeURIComponent(item.name)}&br=${br === "All" ? "All" : encodeURIComponent(br)}`}
                className={`sp-filter-link${sc === item.name ? " sp-active" : ""}`}
                onClick={onLinkClick}
              >{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <hr className="sp-sdivider" />

      <div className="sp-sidebar-section">
        <div className="sp-sidebar-head">Publisher</div>
        <ul className="sp-filter-list">
          <li>
            <Link
              href={`/shop?mc=${mc === "All" ? "All" : encodeURIComponent(mc)}&sc=${sc === "All" ? "All" : encodeURIComponent(sc)}&br=All`}
              className={`sp-filter-link${br === "All" ? " sp-active" : ""}`}
              onClick={onLinkClick}
            >All Publishers</Link>
          </li>
          {PublisherStateData.filter((x) => x.active).map((item) => (
            <li key={item._id}>
              <Link
                href={`/shop?mc=${mc === "All" ? "All" : encodeURIComponent(mc)}&sc=${sc === "All" ? "All" : encodeURIComponent(sc)}&br=${encodeURIComponent(item.name)}`}
                className={`sp-filter-link${br === item.name ? " sp-active" : ""}`}
                onClick={onLinkClick}
              >{item.name}</Link>
            </li>
          ))}
        </ul>
      </div>

      <hr className="sp-sdivider" />

      <div className="sp-sidebar-section">
        <div className="sp-sidebar-head">Price Range</div>
        <form onSubmit={onPriceSubmit}>
          <div className="sp-price-row">
            <input type="number" value={min} onChange={(e) => setMin(e.target.value)}
              className="sp-price-input" placeholder="Min ₹" min="0" />
            <input type="number" value={max} onChange={(e) => setMax(e.target.value)}
              className="sp-price-input" placeholder="Max ₹" min="0" />
          </div>
          <button type="submit" className="sp-price-btn">Apply filter</button>
        </form>
      </div>
    </>
  );
}

/* ── Main shop component ─────────────────────────────────────────────── */
function ShopContent() {
  const [minPrice,     setMinPrice]     = useState("");
  const [maxPrice,     setMaxPrice]     = useState("");
  const [priceFilter,  setPriceFilter]  = useState({ min: -1, max: -1 });
  const [searchTerm,   setSearchTerm]   = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [sortOrder,    setSortOrder]    = useState("1");
  const [drawerOpen,   setDrawerOpen]   = useState(false);

  const BookStateData        = useSelector((s) => s.BookStateData);
  const CategoryStateData    = useSelector((s) => s.CategoryStateData);
  const SubcategoryStateData = useSelector((s) => s.SubcategoryStateData);
  const PublisherStateData   = useSelector((s) => s.PublisherStateData);

  const dispatch     = useDispatch();
  const searchParams = useSearchParams();

  // Decode URL params — searchParams.get returns encoded strings, decode them
  const mc = decodeURIComponent(searchParams.get("mc") || "All");
  const sc = decodeURIComponent(searchParams.get("sc") || "All");
  const br = decodeURIComponent(searchParams.get("br") || "All");

  /* Inject CSS once */
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const tag = document.createElement("style");
    tag.id = STYLE_ID; tag.textContent = CSS;
    document.head.appendChild(tag);
  }, []);

  /* Body scroll lock */
  useEffect(() => {
    document.body.classList.toggle("sp-locked", drawerOpen);
    return () => document.body.classList.remove("sp-locked");
  }, [drawerOpen]);

  /* Close drawer when URL params change */
  useEffect(() => {
    setDrawerOpen(false);
  }, [mc, sc, br]);

  /* Fetch data once */
  useEffect(() => {
    dispatch(getCategory());
    dispatch(getSubcategory());
    dispatch(getPublisher());
    dispatch(getBook());
  }, [dispatch]);

  /* ── Compute displayed list ─────────────────────────────────────────── */
  const displayData = useMemo(() => {
    if (!BookStateData?.length) return [];

    // Log first book in dev so you can verify field names
    if (process.env.NODE_ENV === "development") {
      console.log("[ShopPage] sample book:", BookStateData[0]);
      console.log("[ShopPage] active filters — mc:", mc, "sc:", sc, "br:", br);
    }

    let list = BookStateData.filter((p) => {
      if (!p.active) return false;

      // Resolve category / subcategory / publisher name from the book,
      // tolerating different field name casings and both object + string values.
      const bookCat = getField(p, "Category", "category");
      const bookSub = getField(p, "subcategory", "Subcategory", "subCategory");
      const bookPub = getField(p, "Publisher",   "publisher");
      const price   = p.finalPrice ?? p.price ?? 0;

      if (mc !== "All" && bookCat !== mc) return false;
      if (sc !== "All" && bookSub !== sc) return false;
      if (br !== "All" && bookPub !== br) return false;

      if (priceFilter.min !== -1 && price < priceFilter.min) return false;
      if (priceFilter.max !== -1 && price > priceFilter.max) return false;

      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        const hit =
          p.name?.toLowerCase().includes(q) ||
          p.title?.toLowerCase().includes(q) ||
          bookCat.toLowerCase().includes(q) ||
          bookSub.toLowerCase().includes(q) ||
          bookPub.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q);
        if (!hit) return false;
      }

      return true;
    });

    if (sortOrder === "2") {
      list = [...list].sort((a, b) => (b.finalPrice ?? b.price ?? 0) - (a.finalPrice ?? a.price ?? 0));
    } else if (sortOrder === "3") {
      list = [...list].sort((a, b) => (a.finalPrice ?? a.price ?? 0) - (b.finalPrice ?? b.price ?? 0));
    } else {
      list = [...list].sort((a, b) => b._id.localeCompare(a._id));
    }

    return list;
  }, [BookStateData, mc, sc, br, priceFilter, activeSearch, sortOrder]);

  function handleSearch(e) {
    e.preventDefault();
    setActiveSearch(searchTerm.trim());
  }

  function handlePriceSubmit(e) {
    e.preventDefault();
    setPriceFilter({
      min: minPrice !== "" ? Number(minPrice) : -1,
      max: maxPrice !== "" ? Number(maxPrice) : -1,
    });
  }

  function clearAll() {
    setPriceFilter({ min: -1, max: -1 });
    setMinPrice(""); setMaxPrice("");
    setActiveSearch(""); setSearchTerm("");
  }

  const closeDrawer = () => setDrawerOpen(false);

  const hasActiveFilters =
    mc !== "All" || sc !== "All" || br !== "All" ||
    priceFilter.min !== -1 || priceFilter.max !== -1 || activeSearch !== "";

  const chips = [
    mc !== "All" && { label: `Category: ${mc}`,    href: "/shop?mc=All&sc=All&br=All" },
    sc !== "All" && { label: `Sub: ${sc}`,          href: `/shop?mc=${encodeURIComponent(mc)}&sc=All&br=${encodeURIComponent(br)}` },
    br !== "All" && { label: `Publisher: ${br}`,    href: `/shop?mc=${encodeURIComponent(mc)}&sc=${encodeURIComponent(sc)}&br=All` },
    priceFilter.min !== -1 && { label: `Min ₹${priceFilter.min}`, action: () => setPriceFilter((p) => ({ ...p, min: -1 })) },
    priceFilter.max !== -1 && { label: `Max ₹${priceFilter.max}`, action: () => setPriceFilter((p) => ({ ...p, max: -1 })) },
    activeSearch    !== ""  && { label: `"${activeSearch}"`,       action: () => { setActiveSearch(""); setSearchTerm(""); } },
  ].filter(Boolean);

  const filterProps = {
    mc, sc, br,
    min: minPrice, max: maxPrice,
    setMin: setMinPrice, setMax: setMaxPrice,
    onPriceSubmit: handlePriceSubmit,
    onLinkClick: closeDrawer,
    CategoryStateData, SubcategoryStateData, PublisherStateData,
  };

  return (
    <div className="sp-root">

      {/* Hero */}
      <div className="sp-hero">
        <div className="sp-hero-inner">
          <div className="sp-hero-eyebrow">Browse the store</div>
          <h1 className="sp-hero-title">Our <em>Collection</em></h1>
          <p className="sp-hero-meta">
            <strong>{displayData.length}</strong> products available
            {mc !== "All" && <> &nbsp;·&nbsp; filtered by <strong>{mc}</strong></>}
          </p>
        </div>
      </div>

      {/* Backdrop */}
      <div className={`sp-backdrop${drawerOpen ? " sp-is-open" : ""}`} onClick={closeDrawer} />

      {/* Drawer */}
      <aside className={`sp-drawer${drawerOpen ? " sp-is-open" : ""}`} aria-hidden={!drawerOpen}>
        <div className="sp-drawer-header">
          <p className="sp-drawer-title">Filters</p>
          <button type="button" className="sp-drawer-close" onClick={closeDrawer} aria-label="Close filters">✕</button>
        </div>
        <div className="sp-drawer-body">
          <FilterContent {...filterProps} />
        </div>
      </aside>

      <div className="sp-body">

        {/* Desktop sidebar */}
        <aside className="sp-sidebar">
          <FilterContent {...filterProps} />
        </aside>

        <main className="sp-main">

          {/* Toolbar */}
          <div className="sp-toolbar">
            <button type="button" className="sp-filter-btn" onClick={() => setDrawerOpen(true)}>
              <i className="fa-solid fa-sliders" aria-hidden="true" />
              Filters
              <span className={`sp-filter-btn-dot${hasActiveFilters ? " on" : ""}`} />
            </button>

            <form onSubmit={handleSearch} className="sp-search-wrap">
              <i className="fa-solid fa-magnifying-glass sp-search-icon" aria-hidden="true" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, category…"
                className="sp-search-input"
              />
            </form>

            <div className="sp-row2">
              <select className="sp-sort-select" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
                <option value="1">Latest</option>
                <option value="2">Price: High → Low</option>
                <option value="3">Price: Low → High</option>
              </select>
              <span className="sp-result-badge">
                <i className="fa-solid fa-layer-group" style={{ fontSize: 10 }} aria-hidden="true" />
                {displayData.length} results
              </span>
            </div>
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="sp-chips">
              {chips.map(({ label, href, action }) =>
                href ? (
                  <Link key={label} href={href} className="sp-chip" onClick={action}>
                    {label} <i className="fa-solid fa-xmark" />
                  </Link>
                ) : (
                  <button key={label} type="button" className="sp-chip" onClick={action}>
                    {label} <i className="fa-solid fa-xmark" />
                  </button>
                )
              )}
              <Link href="/shop?mc=All&sc=All&br=All" className="sp-chip sp-chip-clear" onClick={clearAll}>
                Clear all <i className="fa-solid fa-xmark" />
              </Link>
            </div>
          )}

          {/* Results */}
          {displayData.length === 0 ? (
            <div className="sp-empty">
              <i className="fa-regular fa-box-open sp-empty-icon" />
              <div className="sp-empty-title">No products found</div>
              <p className="sp-empty-sub">Try adjusting your filters or search term.</p>
              <Link href="/shop?mc=All&sc=All&br=All" className="sp-empty-reset" onClick={clearAll}>
                Clear all filters
              </Link>
            </div>
          ) : (
            <Book title="Shop" data={displayData} />
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="sp-root"><div className="sp-loading">Loading shop…</div></div>}>
      <ShopContent />
    </Suspense>
  );
}