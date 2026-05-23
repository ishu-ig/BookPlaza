"use client";
import React from "react";
import HeroSection from "../Components/HeroSection";
import Cart from "../Components/Cart";

export default function CartPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

        .cart-page {
          background: #FAF8F5;
          min-height: 100vh;
          padding-bottom: 100px;
        }

        .cart-page-inner {
          padding: 40px 0;
        }

        .cart-page-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 700;
          color: #1C1917;
          margin-bottom: 6px;
        }

        .cart-page-title span {
          color: #D97706;
          font-style: italic;
        }

        .cart-page-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px;
          color: #A8A29E;
          margin-bottom: 32px;
        }
      `}</style>

      <div className="cart-page">
        <HeroSection title="Cart Section" />

        <div className="cart-page-inner">
          <div className="container">
            <div className="cart-page-title">
              My <span>Cart</span>
            </div>
            <div className="cart-page-subtitle">
              Review your selected items before checkout.
            </div>

            <Cart title="Cart" />
          </div>
        </div>
      </div>
    </>
  );
}