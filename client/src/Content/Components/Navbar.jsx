"use client"
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState, useRef } from "react";

const NAV_LINKS = [
  { href: "/",            label: "Home" },
  { href: "/about",       label: "About" },
  { href: "/shop",        label: "Shop" },
  { href: "/feature",     label: "Features" },
  { href: "/testimonial", label: "Reviews" },
  { href: "/contactus",   label: "Contact" },
];

const SIDEBAR_NAV = [
  { href: "/",            icon: "fas fa-home",        label: "Home" },
  { href: "/about",       icon: "fas fa-book-open",   label: "About" },
  { href: "/shop",        icon: "fas fa-store",       label: "Shop" },
  { href: "/feature",     icon: "fas fa-star",        label: "Features" },
  { href: "/testimonial", icon: "fas fa-quote-left",  label: "Reviews" },
  { href: "/contactus",   icon: "fas fa-envelope",    label: "Contact" },
];

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
  const [activePath, setActivePath] = useState("/");

  const searchRef = useRef(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserName(localStorage.getItem("name") || "Guest");
      setIsLogin(!!localStorage.getItem("login"));
      setActivePath(window.location.pathname);
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
      {/* Shelf strip — fixed height by design, no measurement needed */}
      <div className="bp-shelf">
        <strong>Free shipping</strong>
        <span>on orders above ₹499</span>
        <span className="bp-shelf-sep">·</span>
        <span className="bp-shelf-returns">7-day hassle-free returns</span>
      </div>

      {/* Main nav — top is a fixed CSS var, not a measured value */}
      <nav className={`bp-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="bp-nav-inner">

          {/* Wordmark */}
          <Link href="/" className="bp-logo">
            <span className="bp-logo-word">Book<em>Plaza</em></span>
          </Link>

          {/* Desktop links */}
          <div className="bp-links">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`bp-link${activePath === href ? " is-active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="bp-actions">

            <button
              className="bp-icon-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <i className="fas fa-search" style={{ fontSize: "0.88rem" }} />
            </button>

            <Link href="/wishlist" className="bp-icon-btn bp-wishlist-btn" aria-label="Wishlist">
              <i className="far fa-heart" style={{ fontSize: "0.92rem" }} />
              {wishlistCount > 0 && <span className="bp-pip">{wishlistCount}</span>}
            </Link>

            <Link href="/cart" className="bp-icon-btn bp-cart-btn" aria-label="Cart">
              <i className="fas fa-shopping-bag" style={{ fontSize: "0.88rem" }} />
              {cartCount > 0 && <span className="bp-pip">{cartCount}</span>}
            </Link>

            {/* Account dropdown — desktop only */}
            <div className="bp-account">
              <button className="bp-icon-btn" aria-label="Account">
                <i className="far fa-user" style={{ fontSize: "0.92rem" }} />
              </button>
              <div className="bp-account-menu">
                <div className="bp-account-head">
                  <p className="bp-account-name">{userName}</p>
                  <p className="bp-account-tag">Reader</p>
                </div>
                <Link href="/profile" className="bp-account-item">
                  <i className="far fa-user" /> My Profile
                </Link>
                <Link href="/order" className="bp-account-item">
                  <i className="fas fa-box" /> My Orders
                </Link>
                <Link href="/ebook" className="bp-account-item">
                  <i className="fas fa-book" /> My E-Book
                </Link>
                <Link href="/wishlist" className="bp-account-item">
                  <i className="far fa-heart" /> Wishlist
                </Link>
                <div className="bp-account-rule" />
                {isLogin ? (
                  <button className="bp-account-item is-danger" onClick={logout}>
                    <i className="fas fa-sign-out-alt" /> Sign Out
                  </button>
                ) : (
                  <Link href="/login" className="bp-account-item">
                    <i className="fas fa-sign-in-alt" /> Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              className="bp-burger"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              aria-expanded={sidebarOpen}
            >
              <i className="fas fa-bars" />
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer — single calc, no JS measurement, no resize observer */}
      <div style={{ height: "calc(var(--shelf-h) + var(--nav-h))" }} aria-hidden="true" />

      {/* Search overlay */}
      <div
        className={`bp-search-veil${searchOpen ? " is-open" : ""}`}
        onClick={() => setSearchOpen(false)}
        role="dialog"
        aria-modal="true"
        aria-label="Search"
      >
        <div className="bp-search-box" onClick={e => e.stopPropagation()}>
          <i className="fas fa-search" style={{ color: "var(--bottle)", fontSize: "1rem", flexShrink: 0 }} aria-hidden="true" />
          <input
            ref={searchRef}
            className="bp-search-field"
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
            className="bp-search-close"
            onClick={() => setSearchOpen(false)}
            aria-label="Close search"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Sidebar overlay */}
      <div
        className={`bp-sidebar-veil${sidebarOpen ? " is-open" : ""}`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <div
        className={`bp-sidebar${sidebarOpen ? " is-open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="bp-sidebar-head">
          <span className="bp-sidebar-word">Book<em>Plaza</em></span>
          <button
            className="bp-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <div className="bp-sidebar-profile">
          <p className="bp-sidebar-greet">Welcome back</p>
          <p className="bp-sidebar-uname">{userName}</p>
        </div>

        <nav className="bp-sidebar-nav" aria-label="Mobile navigation">
          <p className="bp-sidebar-label">Navigate</p>
          {SIDEBAR_NAV.map(({ href, icon, label }) => (
            <Link
              key={href}
              href={href}
              className="bp-sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className={icon} aria-hidden="true" /> {label}
            </Link>
          ))}

          <p className="bp-sidebar-label">Account</p>
          {[
            { href: "/profile",  icon: "far fa-user",         label: "My Profile" },
            { href: "/order",    icon: "fas fa-box",          label: "My Orders" },
            { href: "/ebook",    icon: "fas fa-book",         label: "My E-Book" },
            { href: "/wishlist", icon: "far fa-heart",        label: "Wishlist", badge: wishlistCount },
            { href: "/cart",     icon: "fas fa-shopping-bag", label: "Cart",     badge: cartCount },
          ].map(({ href, icon, label, badge }) => (
            <Link
              key={href}
              href={href}
              className="bp-sidebar-link"
              onClick={() => setSidebarOpen(false)}
            >
              <i className={icon} aria-hidden="true" /> {label}
              {badge > 0 && <span className="bp-sidebar-pill">{badge}</span>}
            </Link>
          ))}

          <div className="bp-sidebar-rule" />

          {isLogin ? (
            <button
              className="bp-sidebar-link is-danger"
              onClick={() => { setSidebarOpen(false); logout(); }}
            >
              <i className="fas fa-sign-out-alt" aria-hidden="true" /> Sign Out
            </button>
          ) : (
            <Link
              href="/login"
              className="bp-sidebar-link"
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