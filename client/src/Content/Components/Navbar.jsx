"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

export default function Navbar() {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [isLogin, setIsLogin] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("name") || "Guest");
      setIsLogin(!!localStorage.getItem("login"));
    }
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
          background: var(--burgundy);
          color: var(--cream);
          text-align: center;
          padding: 7px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.72rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          position: relative;
          z-index: 1001;
        }

        .sk-announce em { color: var(--gold-light); font-style: normal; font-weight: 500; }

        /* ── Main nav ── */
        .sk-nav {
          position: fixed;
          top: 0;
          z-index: 1000;
          background: var(--cream);
          border-bottom: 1px solid rgba(107,39,55,0.12);
          transition: box-shadow 0.3s ease, background 0.3s ease;
          font-family: 'DM Sans', sans-serif;
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
          gap: 0;
        }

        /* ── Logo ── */
        .sk-logo {
          text-decoration: none;
          display: flex;
          flex-direction: column;
          line-height: 1;
          margin-right: 48px;
          flex-shrink: 0;
        }

        .sk-logo-main {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 1.75rem;
          font-weight: 600;
          color: var(--ink);
          letter-spacing: -0.01em;
          line-height: 1;
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
          gap: 0;
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
        }

        .sk-action-btn {
          width: 42px;
          height: 42px;
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
          padding-top: 100px;
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
          width: min(600px, calc(100vw - 48px));
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
        }
        .sk-search-close:hover { color: var(--burgundy); }

        /* ── Mobile toggle ── */
        .sk-mobile-toggle {
          display: none;
          border: none;
          background: transparent;
          cursor: pointer;
          padding: 8px;
          color: var(--ink);
          font-size: 1.2rem;
        }

        /* ── Sidebar ── */
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

        .sk-sidebar {
          position: fixed;
          top: 0;
          right: 0;
          bottom: 0;
          width: 300px;
          background: var(--ink);
          z-index: 1200;
          transform: translateX(100%);
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .sk-sidebar.open {
          transform: translateX(0);
        }

        .sk-sidebar-head {
          padding: 24px 24px 20px;
          border-bottom: 1px solid rgba(253,250,245,0.1);
          display: flex;
          align-items: center;
          justify-content: space-between;
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
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
          font-size: 1rem;
        }

        .sk-sidebar-close:hover { background: rgba(253,250,245,0.2); }

        .sk-sidebar-profile {
          padding: 20px 24px;
          border-bottom: 1px solid rgba(253,250,245,0.08);
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
        }

        .sk-sidebar-nav {
          flex: 1;
          padding: 12px 0;
        }

        .sk-sidebar-label {
          font-size: 0.62rem;
          font-weight: 500;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(253,250,245,0.3);
          padding: 16px 24px 6px;
          font-family: 'DM Sans', sans-serif;
        }

        .sk-sidebar-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
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
        }

        .sk-sidebar-link:hover {
          color: var(--cream);
          background: rgba(253,250,245,0.06);
        }

        .sk-sidebar-link i { width: 18px; text-align: center; font-size: 0.95rem; }

        .sk-sidebar-link .ms-auto { margin-left: auto; }

        .sk-sidebar-link.danger { color: rgba(220,80,80,0.8); }
        .sk-sidebar-link.danger:hover { color: #e06060; background: rgba(220,80,80,0.08); }

        /* ── Responsive ── */
        @media (max-width: 991px) {
          .sk-links { display: none; }
          .sk-mobile-toggle { display: flex; }
          .sk-nav-inner { padding: 0 20px; }
          .sk-logo { margin-right: 0; }
        }

        @media (max-width: 480px) {
          .sk-announce { font-size: 0.65rem; }
        }
      `}</style>

      {/* Announcement bar */}
      <div className="sk-announce">
        <em>Free shipping</em> on orders above ₹499 &nbsp;·&nbsp; 7-day hassle-free returns
      </div>

      {/* Main nav */}
      <nav className={`sk-nav${scrolled ? " scrolled" : ""}`}>
        <div className="sk-nav-inner">

          {/* Logo */}
          <Link href="/" className="sk-logo">
            <span className="sk-logo-main">Book<span>Plaza</span></span>
            <span className="sk-logo-sub">Bookstore</span>
          </Link>

          {/* Desktop links */}
          <div className="sk-links d-none d-lg-flex">
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
            <button className="sk-action-btn" onClick={() => setSearchOpen(true)} aria-label="Search">
              <i className="fas fa-search" style={{ fontSize: "0.9rem" }} />
            </button>

            {/* Wishlist */}
            <Link href="/wishlist" className="sk-action-btn d-none d-sm-flex" aria-label="Wishlist">
              <i className="far fa-heart" style={{ fontSize: "0.95rem" }} />
              {wishlistCount > 0 && <span className="sk-badge">{wishlistCount}</span>}
            </Link>

            {/* Cart */}
            <Link href="/cart" className="sk-action-btn d-none d-sm-flex" aria-label="Cart">
              <i className="fas fa-shopping-bag" style={{ fontSize: "0.9rem" }} />
              {cartCount > 0 && <span className="sk-badge">{cartCount}</span>}
            </Link>

            {/* Profile dropdown */}
            <div className="sk-dropdown d-none d-lg-block">
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
                  <i className="fas fa-box" /> My E-Book
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
              className="sk-mobile-toggle d-lg-none"
              onClick={() => setSidebarOpen(true)}
              aria-label="Menu"
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </nav>

      {/* Search overlay */}
      <div className={`sk-search-overlay${searchOpen ? " open" : ""}`} onClick={() => setSearchOpen(false)}>
        <div className="sk-search-box" onClick={e => e.stopPropagation()}>
          <i className="fas fa-search" style={{ color: "var(--gold)", fontSize: "1rem" }} />
          <input
            ref={searchRef}
            className="sk-search-input"
            placeholder="Search books, authors, genres…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") {
                window.location.href = `/shop?q=${searchQuery}`;
              }
            }}
          />
          <button className="sk-search-close" onClick={() => setSearchOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>
      </div>

      {/* Sidebar overlay */}
      <div className={`sk-sidebar-overlay${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <div className={`sk-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="sk-sidebar-head">
          <span className="sk-sidebar-logo">Book<span>Plaza</span></span>
          <button className="sk-sidebar-close" onClick={() => setSidebarOpen(false)}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="sk-sidebar-profile">
          <p className="sk-sidebar-greeting">Welcome back</p>
          <p className="sk-sidebar-uname">{userName}</p>
        </div>

        <nav className="sk-sidebar-nav">
          <p className="sk-sidebar-label">Navigate</p>
          {[
            { href: "/", icon: "fas fa-home", label: "Home" },
            { href: "/about", icon: "fas fa-book-open", label: "About" },
            { href: "/shop", icon: "fas fa-store", label: "Shop" },
            { href: "/feature", icon: "fas fa-star", label: "Features" },
            { href: "/testimonial", icon: "fas fa-quote-left", label: "Reviews" },
            { href: "/contactus", icon: "fas fa-envelope", label: "Contact" },
          ].map(({ href, icon, label }) => (
            <Link key={href} href={href} className="sk-sidebar-link" onClick={() => setSidebarOpen(false)}>
              <i className={icon} /> {label}
            </Link>
          ))}

          <p className="sk-sidebar-label">Account</p>
          {[
            { href: "/profile", icon: "far fa-user", label: "My Profile" },
            { href: "/order", icon: "fas fa-box", label: "My Orders" },
            { href: "/ebook", icon: "fas fa-box", label: "My E-Book" },
            { href: "/wishlist", icon: "far fa-heart", label: "Wishlist", badge: wishlistCount },
            { href: "/cart", icon: "fas fa-shopping-bag", label: "Cart", badge: cartCount },
          ].map(({ href, icon, label, badge }) => (
            <Link key={href} href={href} className="sk-sidebar-link" onClick={() => setSidebarOpen(false)}>
              <i className={icon} /> {label}
              {badge > 0 && (
                <span className="ms-auto" style={{
                  background: "var(--burgundy)", color: "var(--cream)",
                  fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px",
                  borderRadius: "10px",
                }}>{badge}</span>
              )}
            </Link>
          ))}

          <div style={{ height: 1, background: "rgba(253,250,245,0.08)", margin: "8px 24px" }} />

          {isLogin ? (
            <button className="sk-sidebar-link danger" onClick={() => { setSidebarOpen(false); logout(); }}>
              <i className="fas fa-sign-out-alt" /> Sign Out
            </button>
          ) : (
            <Link href="/login" className="sk-sidebar-link" onClick={() => setSidebarOpen(false)}>
              <i className="fas fa-sign-in-alt" /> Sign In
            </Link>
          )}
        </nav>
      </div>
    </>
  );
}