"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback } from "react";

export default function Navbar() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [isLogin, setIsLogin] = useState(false);
  const [spacerH, setSpacerH] = useState(108);
  // FIX: track announce height separately so we can set nav top via CSS var
  const [announceH, setAnnounceH] = useState(36);

  const searchRef = useRef(null);
  const announceRef = useRef(null);
  const navRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("name") || "Guest");
      setIsLogin(!!localStorage.getItem("login"));
    }
  }, []);

  // FIX: Use ResizeObserver so heights stay accurate when announce bar wraps on mobile
  useEffect(() => {
    const update = () => {
      const a = announceRef.current?.getBoundingClientRect().height || 36;
      const n = navRef.current?.getBoundingClientRect().height || 72;
      setAnnounceH(a);
      setSpacerH(a + n);
    };

    // Run once after mount so refs are populated
    update();

    const ro = new ResizeObserver(update);
    if (announceRef.current) ro.observe(announceRef.current);
    if (navRef.current) ro.observe(navRef.current);
    window.addEventListener("resize", update);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchRef.current) searchRef.current.focus();
  }, [searchOpen]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [sidebarOpen]);

  function logout() {
    localStorage.clear();
    router.push("/login");
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --ink: #1A1208;
          --burgundy: #6B2737;
          --burgundy-light: #8B3347;
          --gold: #C8922A;
          --gold-light: #E0A840;
          --cream: #FDFAF5;
          --parchment: #F4EDE4;
          --nav-height: 72px;
        }

        /* ── Announcement bar ── */
        .sk-announce {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          z-index: 1001;
          background: var(--burgundy);
          color: var(--cream);
          text-align: center;
          min-height: 36px;
          height: auto;
          display: flex;
          /* FIX: nowrap prevents the bar growing to 2 lines on mobile */
          flex-wrap: nowrap;
          align-items: center;
          justify-content: center;
          padding: 6px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          gap: 4px;
          box-sizing: border-box;
          /* FIX: keep text on one line on small screens */
          white-space: nowrap;
          overflow: hidden;
        }

        .sk-announce em {
          color: var(--gold-light);
          font-style: normal;
          font-weight: 500;
        }

        /* ── Main nav ── */
        /* FIX: top is now set via inline style using measured announceH state */
        .sk-nav {
          position: fixed;
          left: 0;
          width: 100%;
          z-index: 1000;
          background: var(--cream);
          border-bottom: 1px solid rgba(107,39,55,0.12);
          transition: box-shadow 0.3s ease, background 0.3s ease;
          font-family: 'DM Sans', sans-serif;
          box-sizing: border-box;
        }

        .sk-nav.scrolled {
          box-shadow: 0 4px 32px rgba(26,18,8,0.1);
          background: rgba(253,250,245,0.97);
          backdrop-filter: blur(12px);
        }

        .sk-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 32px;
          height: var(--nav-height);
          display: flex;
          align-items: center;
          flex-wrap: nowrap;
          min-width: 0;
        }

        /* ── Logo ── */
        .sk-logo {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1;
          margin-right: 48px;
          flex-shrink: 0;
          min-width: 0;
        }

        .sk-logo-main {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
          line-height: 1;
          white-space: nowrap;
        }

        .sk-logo-main span { color: var(--burgundy); }

        .sk-logo-sub {
          font-size: 0.6rem;
          font-weight: 500;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: var(--gold);
          margin-top: 1px;
        }

        /* ── Desktop links ── */
        .sk-links {
          display: flex;
          align-items: center;
          flex: 1;
        }

        .sk-link {
          font-size: 0.78rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,18,8,0.6);
          text-decoration: none;
          padding: 0 18px;
          height: var(--nav-height);
          display: flex;
          align-items: center;
          position: relative;
          transition: color 0.2s ease;
          white-space: nowrap;
        }

        .sk-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          right: 50%;
          height: 2px;
          background: var(--burgundy);
          transition: left 0.25s ease, right 0.25s ease;
        }

        .sk-link:hover,
        .sk-link.active {
          color: var(--ink);
        }

        .sk-link:hover::after,
        .sk-link.active::after {
          left: 18px;
          right: 18px;
        }

        /* ── Right actions ── */
        .sk-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-left: auto;
          flex-shrink: 0;
        }

        .sk-action-btn {
          width: 44px;
          height: 44px;
          border: none;
          background: transparent;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--ink);
          cursor: pointer;
          position: relative;
          transition: background 0.2s ease, color 0.2s ease;
          text-decoration: none;
          font-size: 1rem;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .sk-action-btn:hover {
          background: var(--parchment);
          color: var(--burgundy);
        }

        .sk-badge {
          position: absolute;
          top: 4px;
          right: 4px;
          min-width: 16px;
          height: 16px;
          background: var(--burgundy);
          color: var(--cream);
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 3px;
          font-family: 'DM Sans', sans-serif;
          pointer-events: none;
        }

        /* ── Dropdown ── */
        .sk-dropdown {
          position: relative;
        }

        .sk-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: var(--cream);
          border: 1px solid rgba(107,39,55,0.12);
          border-radius: 8px;
          box-shadow: 0 16px 48px rgba(26,18,8,0.14);
          overflow: hidden;
          opacity: 0;
          visibility: hidden;
          transform: translateY(-8px);
          transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s;
          z-index: 100;
        }

        .sk-dropdown:hover .sk-dropdown-menu,
        .sk-dropdown:focus-within .sk-dropdown-menu {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }

        .sk-dropdown-header {
          padding: 16px 20px 12px;
          border-bottom: 1px solid rgba(107,39,55,0.1);
        }

        .sk-dropdown-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1rem;
          font-weight: 600;
          color: var(--ink);
          margin: 0;
          line-height: 1;
        }

        .sk-dropdown-role {
          font-size: 0.72rem;
          color: var(--gold);
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-top: 3px;
        }

        .sk-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          font-size: 0.82rem;
          color: rgba(26,18,8,0.7);
          text-decoration: none;
          transition: background 0.15s ease, color 0.15s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
        }

        .sk-dropdown-item:hover {
          background: var(--parchment);
          color: var(--burgundy);
        }

        .sk-dropdown-item.danger { color: #c0392b; }
        .sk-dropdown-item.danger:hover { background: #fdf2f2; }

        .sk-dropdown-divider {
          height: 1px;
          background: rgba(107,39,55,0.1);
          margin: 4px 0;
        }

        /* ── Search overlay ── */
        .sk-search-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,18,8,0.6);
          z-index: 1100;
          display: flex;
          align-items: flex-start;
          justify-content: center;
          padding-top: 130px;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.25s ease, visibility 0.25s;
        }

        .sk-search-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        .sk-search-box {
          background: var(--cream);
          border-radius: 12px;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
          width: min(600px, calc(100vw - 32px));
          box-shadow: 0 24px 80px rgba(26,18,8,0.25);
        }

        .sk-search-input {
          flex: 1;
          border: none;
          background: transparent;
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          color: var(--ink);
          outline: none;
          padding: 8px 0;
          min-width: 0;
        }

        @media (max-width: 480px) {
          .sk-search-input { font-size: 1.1rem; }
        }

        .sk-search-input::placeholder { color: rgba(26,18,8,0.3); }

        .sk-search-close {
          border: none;
          background: transparent;
          cursor: pointer;
          color: rgba(26,18,8,0.4);
          font-size: 1.2rem;
          padding: 4px;
          transition: color 0.2s;
          flex-shrink: 0;
          touch-action: manipulation;
        }

        .sk-search-close:hover { color: var(--burgundy); }

        /* ── Mobile toggle ── */
        .sk-mobile-toggle {
          display: none;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 0;
          color: var(--ink);
          font-size: 1.2rem;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: background 0.2s ease;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          flex-shrink: 0;
        }

        .sk-mobile-toggle:hover {
          background: var(--parchment);
        }

        /* ── Sidebar overlay ── */
        .sk-sidebar-overlay {
          position: fixed;
          inset: 0;
          background: rgba(26,18,8,0.5);
          z-index: 1199;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0.3s;
        }

        .sk-sidebar-overlay.open {
          opacity: 1;
          visibility: visible;
        }

        /* ── Sidebar ── */
        .sk-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          max-width: 85vw;
          background: var(--ink);
          z-index: 1200;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          overflow-x: hidden;
          -webkit-overflow-scrolling: touch;
        }

        .sk-sidebar.open {
          transform: translateX(0);
        }

        .sk-sidebar-head {
          padding: 20px 20px 16px;
          border-bottom: 1px solid rgba(253,250,245,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }

        .sk-sidebar-logo {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.4rem;
          font-weight: 600;
          color: var(--cream);
        }

        .sk-sidebar-logo span { color: var(--gold); }

        .sk-sidebar-close {
          border: none;
          background: rgba(253,250,245,0.1);
          color: var(--cream);
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 1rem;
          flex-shrink: 0;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }

        .sk-sidebar-close:hover,
        .sk-sidebar-close:active { background: rgba(253,250,245,0.2); }

        .sk-sidebar-profile {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(253,250,245,0.08);
          flex-shrink: 0;
        }

        .sk-sidebar-greeting {
          font-family: 'DM Sans', sans-serif;
          font-size: 0.68rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 4px;
        }

        .sk-sidebar-uname {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.15rem;
          font-weight: 600;
          color: var(--cream);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .sk-sidebar-nav {
          flex: 1;
          padding: 8px 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }

        .sk-sidebar-label {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(253,250,245,0.3);
          padding: 14px 20px 6px;
          font-family: 'DM Sans', sans-serif;
        }

        .sk-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 13px 20px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.88rem;
          color: rgba(253,250,245,0.7);
          text-decoration: none;
          transition: color 0.2s ease, background 0.2s ease;
          border: none;
          background: transparent;
          width: 100%;
          text-align: left;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
          min-height: 48px;
        }

        .sk-sidebar-link:hover,
        .sk-sidebar-link:active {
          color: var(--cream);
          background: rgba(253,250,245,0.06);
        }

        .sk-sidebar-link i {
          width: 18px;
          text-align: center;
          font-size: 0.95rem;
          flex-shrink: 0;
        }

        .sk-sidebar-link .sk-badge-pill {
          margin-left: auto;
          background: var(--burgundy);
          color: var(--cream);
          font-size: 0.65rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 10px;
          flex-shrink: 0;
        }

        .sk-sidebar-link.danger { color: rgba(220,80,80,0.8); }
        .sk-sidebar-link.danger:hover,
        .sk-sidebar-link.danger:active { color: #e06060; background: rgba(220,80,80,0.08); }

        .sk-sidebar-divider {
          height: 1px;
          background: rgba(253,250,245,0.08);
          margin: 8px 20px;
        }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .sk-links { display: none !important; }
          .sk-dropdown { display: none !important; }
          .sk-mobile-toggle { display: flex !important; }
          .sk-nav-inner { padding: 0 16px; }
          .sk-logo { margin-right: 0; }
        }

        @media (max-width: 575px) {
          .sk-cart-btn,
          .sk-wishlist-btn { display: none !important; }
        }

        /* FIX: tighten action buttons on very small screens so logo doesn't get squished */
        @media (max-width: 360px) {
          .sk-logo-main { font-size: 1.4rem; }
          .sk-logo-sub { display: none; }
          .sk-nav-inner { padding: 0 10px; }
          .sk-actions { gap: 0; }
          .sk-action-btn { width: 36px; height: 36px; }
        }

        @media (max-width: 480px) {
          .sk-announce {
            font-size: 0.60rem;
            letter-spacing: 0.06em;
            padding: 5px 8px;
          }
        }

        /* ── Safe area support (notched phones) ── */
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .sk-sidebar {
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>

      {/* Announcement bar */}
      <div className="sk-announce" ref={announceRef}>
        <em>Free shipping</em> on orders above ₹499 &nbsp;·&nbsp; 7-day hassle-free returns
      </div>

      {/* Main nav — FIX: top now uses measured announceH state, not a stale ref read */}
      <nav
        ref={navRef}
        className={`sk-nav${scrolled ? " scrolled" : ""}`}
        style={{ top: announceH }}
      >
        <div className="sk-nav-inner">

          {/* Logo */}
          <Link href="/" className="sk-logo">
            <span className="sk-logo-main">Book<span>Plaza</span></span>
            <span className="sk-logo-sub">Bookstore</span>
          </Link>

          {/* Desktop links */}
          <div className="sk-links">
            <Link href="/" className="sk-link">Home</Link>
            <Link href="/about" className="sk-link">About</Link>
            <Link href="/shop" className="sk-link">Shop</Link>
            <Link href="/feature" className="sk-link">Features</Link>
            <Link href="/testimonial" className="sk-link">Reviews</Link>
            <Link href="/contactus" className="sk-link">Contact</Link>
          </div>

          {/* Actions */}
          <div className="sk-actions">

            {/* Search */}
            <button
              className="sk-action-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <i className="fas fa-search" style={{ fontSize: "0.9rem" }} />
            </button>

            {/* Wishlist — hidden on xs */}
            <Link
              href="/wishlist"
              className="sk-action-btn sk-wishlist-btn"
              aria-label="Wishlist"
            >
              <i className="far fa-heart" style={{ fontSize: "0.95rem" }} />
              {wishlistCount > 0 && <span className="sk-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart — hidden on xs */}
            <Link
              href="/cart"
              className="sk-action-btn sk-cart-btn"
              aria-label="Cart"
            >
              <i className="fas fa-shopping-bag" style={{ fontSize: "0.9rem" }} />
              {cartCount > 0 && <span className="sk-badge">{cartCount}</span>}
            </Link>

            {/* Profile dropdown — desktop only */}
            <div className="sk-dropdown">
              <button className="sk-action-btn" aria-label="Account">
                <i className="far fa-user" style={{ fontSize: "0.95rem" }} />
              </button>
              <div className="sk-dropdown-menu">
                <div className="sk-dropdown-header">
                  <p className="sk-dropdown-name">{userName}</p>
                  <p className="sk-dropdown-role">Reader</p>
                </div>
                <Link href="/profile" className="sk-dropdown-item">
                  <i className="far fa-user" /> My Profile
                </Link>
                <Link href="/order" className="sk-dropdown-item">
                  <i className="fas fa-box" /> My Orders
                </Link>
                <Link href="/ebook" className="sk-dropdown-item">
                  <i className="fas fa-book" /> My E-Book
                </Link>
                <Link href="/wishlist" className="sk-dropdown-item">
                  <i className="far fa-heart" /> Wishlist
                </Link>
                <div className="sk-dropdown-divider" />
                {isLogin ? (
                  <button className="sk-dropdown-item danger" onClick={logout}>
                    <i className="fas fa-sign-out-alt" /> Sign Out
                  </button>
                ) : (
                  <Link href="/login" className="sk-dropdown-item">
                    <i className="fas fa-sign-in-alt" /> Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="sk-mobile-toggle"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer — FIX: height is now always accurate via ResizeObserver */}
      <div style={{ height: spacerH }} aria-hidden="true" />

      {/* Search overlay */}
      <div
        className={`sk-search-overlay${searchOpen ? " open" : ""}`}
        onClick={() => setSearchOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="sk-search-box" onClick={e => e.stopPropagation()}>
          <i className="fas fa-search" style={{ color: "var(--gold)", fontSize: "1rem", flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={searchRef}
            className="sk-search-input"
            placeholder="Search books, authors, genres…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter" && searchQuery.trim()) {
                setSearchOpen(false);
                router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
              }
              if (e.key === "Escape") setSearchOpen(false);
            }}
            aria-label="Search query"
          />
          <button
            className="sk-search-close"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Sidebar overlay */}
      <div
        className={`sk-sidebar-overlay${sidebarOpen ? " open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`sk-sidebar${sidebarOpen ? " open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="sk-sidebar-head">
          <span className="sk-sidebar-logo">Book<span>Plaza</span></span>
          <button
            className="sk-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <div className="sk-sidebar-profile">
          <p className="sk-sidebar-greeting">Welcome back</p>
          <p className="sk-sidebar-uname">{userName}</p>
        </div>

        <nav className="sk-sidebar-nav" aria-label="Mobile navigation">
          <p className="sk-sidebar-label">Navigate</p>
          {[
            { href: "/", icon: "fas fa-home", label: "Home" },
            { href: "/about", icon: "fas fa-book-open", label: "About" },
            { href: "/shop", icon: "fas fa-store", label: "Shop" },
            { href: "/feature", icon: "fas fa-star", label: "Features" },
            { href: "/testimonial", icon: "fas fa-quote-left", label: "Reviews" },
            { href: "/contactus", icon: "fas fa-envelope", label: "Contact" },
          ].map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="sk-sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className={icon} aria-hidden="true" /> {label}
            </Link>
          ))}

          <p className="sk-sidebar-label">Account</p>
          {[
            { href: "/profile", icon: "far fa-user", label: "My Profile" },
            { href: "/order", icon: "fas fa-box", label: "My Orders" },
            { href: "/ebook", icon: "fas fa-book", label: "My E-Book" },
            { href: "/wishlist", icon: "far fa-heart", label: "Wishlist", badge: wishlistCount },
            { href: "/cart", icon: "fas fa-shopping-bag", label: "Cart", badge: cartCount },
          ].map(({ href, icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              className="sk-sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className={icon} aria-hidden="true" /> {label}
              {badge > 0 && <span className="sk-badge-pill">{badge}</span>}
            </Link>
          ))}

          <div className="sk-sidebar-divider" />

          {isLogin ? (
            <button
              className="sk-sidebar-link danger"
              onClick={() => { setSidebarOpen(false); logout(); }}
            >
              <i className="fas fa-sign-out-alt" aria-hidden="true" /> Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="sk-sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className="fas fa-sign-in-alt" aria-hidden="true" /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}