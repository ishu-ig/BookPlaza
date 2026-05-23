"use client"
import React, { useEffect, useState } from "react"
import HeroSection from "../Components/HeroSection"
import { useDispatch, useSelector } from "react-redux"
import { deleteWishlist, getWishlist } from "../Redux/ActionCreartors/WishlistActionCreators"
import Link from "next/link"

export default function WishlistPage() {
    const [wishlist, setWishlist] = useState([])
    const WishlistStateData = useSelector((state) => state.WishlistStateData)
    const dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Remove this item from your wishlist?")) {
            dispatch(deleteWishlist({ _id }))
        }
    }

    useEffect(() => { dispatch(getWishlist()) }, [dispatch])
    useEffect(() => { setWishlist(WishlistStateData || []) }, [WishlistStateData])

    return (
        <>
            <HeroSection title="My Wishlist" />

            <div style={styles.pageWrapper}>
                {/* Header */}
                <div style={styles.pageHeader}>
                    <div>
                        <h4 style={styles.pageTitle}>
                            <i className="fa fa-heart" style={{ color: '#6B2737', marginRight: 10 }} />
                            My Wishlist
                        </h4>
                        <p style={styles.pageCount}>
                            {wishlist.length} {wishlist.length === 1 ? "item" : "items"} saved
                        </p>
                    </div>
                    {wishlist.length > 0 && (
                        <Link href="/shop" style={styles.shopMoreBtn}>
                            <i className="fa fa-arrow-left" style={{ marginRight: 6 }} />
                            Continue Shopping
                        </Link>
                    )}
                </div>

                {wishlist.length === 0 ? (
                    <EmptyWishlist />
                ) : (
                    <>
                        {/* ── DESKTOP TABLE ── */}
                        <div className="d-none d-md-block" style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr style={styles.thead}>
                                        <th style={styles.th}></th>
                                        <th style={styles.th}>Book</th>
                                        <th style={styles.th}>Author</th>
                                        <th style={styles.th}>Category</th>
                                        <th style={styles.th}>Price</th>
                                        <th style={styles.th}>Stock</th>
                                        <th style={styles.th}></th>
                                        <th style={styles.th}></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {wishlist.map((item, idx) => (
                                        <tr
                                            key={item._id}
                                            style={{
                                                ...styles.tr,
                                                background: idx % 2 === 0 ? '#FDFAF5' : '#F7F0E6'
                                            }}
                                        >
                                            {/* Image */}
                                            <td style={styles.td}>
                                                <Link href={`/book/${item.book?._id}`}>
                                                    <img
                                                        src={`${process.env.NEXT_PUBLIC_SERVER}/${item.book?.pic}`}
                                                        height={60}
                                                        width={60}
                                                        alt={item.book?.title || "Book"}
                                                        style={styles.bookImg}
                                                    />
                                                </Link>
                                            </td>

                                            {/* Title */}
                                            <td style={{ ...styles.td, ...styles.bookName }}>
                                                {item.book?.title || "—"}
                                            </td>

                                            {/* Author */}
                                            <td style={styles.td}>
                                                <span style={styles.brandBadge}>
                                                    {item.book?.author || "—"}
                                                </span>
                                            </td>

                                            {/* Category */}
                                            <td style={styles.td}>
                                                <div style={styles.detailPills}>
                                                    {item.book?.category?.name && (
                                                        <span style={styles.pill}>{item.book.category.name}</span>
                                                    )}
                                                    {item.book?.subcategory?.name && (
                                                        <span style={styles.pill}>{item.book.subcategory.name}</span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Price */}
                                            <td style={{ ...styles.td, ...styles.price }}>
  ₹{item.book?.formatPricing?.[0]?.finalPrice || item.book?.finalPrice || "—"}
</td>

                                            {/* Stock */}
                                            <td style={styles.td}>
                                                <span style={{
                                                    ...styles.stockBadge,
                                                    ...(item.book?.stock === 0 ? styles.stockOut : styles.stockIn)
                                                }}>
                                                    {item.book?.stock === 0
                                                        ? "Out of Stock"
                                                        : `${item.book?.stock ?? "—"} left`}
                                                </span>
                                            </td>

                                            {/* View Book */}
                                            <td style={styles.td}>
                                                <Link href={`/book/${item.book?._id}`} style={styles.cartBtn}>
                                                    <i className="fa fa-shopping-cart" style={{ marginRight: 6 }} />
                                                    Add to Cart
                                                </Link>
                                            </td>

                                            {/* Delete */}
                                            <td style={styles.td}>
                                                <button
                                                    style={styles.deleteBtn}
                                                    onClick={() => deleteRecord(item._id)}
                                                    title="Remove from wishlist"
                                                    onMouseOver={e => Object.assign(e.currentTarget.style, styles.deleteBtnHover)}
                                                    onMouseOut={e => Object.assign(e.currentTarget.style, styles.deleteBtn)}
                                                >
                                                    <i className="fa fa-trash" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── MOBILE CARDS ── */}
                        <div className="d-block d-md-none" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {wishlist.map(item => (
                                <div key={item._id} style={styles.mobileCard}>
                                    <div style={styles.mobileCardInner}>
                                        <Link href={`/book/${item.book?._id}`}>
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_SERVER}/${item.book?.pic}`}
                                                alt={item.book?.title || "Book"}
                                                style={styles.mobileImg}
                                            />
                                        </Link>
                                        <div style={styles.mobileInfo}>
                                            <h6 style={styles.mobileBookName}>
                                                {item.book?.title || "—"}
                                            </h6>
                                            <p style={styles.mobileBrand}>
                                                {item.book?.author || "—"}
                                            </p>
                                            <p style={styles.mobilePrice}>
                                                ₹{item.book?.finalPrice ?? "—"}
                                            </p>
                                            <span style={{
                                                ...styles.stockBadge,
                                                ...(item.book?.stock === 0 ? styles.stockOut : styles.stockIn),
                                                fontSize: 11,
                                            }}>
                                                {item.book?.stock === 0
                                                    ? "Out of Stock"
                                                    : `${item.book?.stock ?? "—"} left`}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={styles.mobileBtnRow}>
                                        <Link
                                            href={`/book/${item.book?._id}`}
                                            style={{ ...styles.cartBtn, flex: 1, justifyContent: 'center' }}
                                        >
                                            <i className="fa fa-shopping-cart" style={{ marginRight: 6 }} />
                                            Add to Cart
                                        </Link>
                                        <button
                                            style={{ ...styles.deleteBtn, padding: '9px 16px' }}
                                            onClick={() => deleteRecord(item._id)}
                                            onMouseOver={e => Object.assign(e.currentTarget.style, styles.deleteBtnHover)}
                                            onMouseOut={e => Object.assign(e.currentTarget.style, styles.deleteBtn)}
                                        >
                                            <i className="fa fa-trash" style={{ marginRight: 5 }} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    )
}

function EmptyWishlist() {
    return (
        <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
                <i className="fa fa-heart-o" style={{ fontSize: 40, color: '#8C7B6B' }} />
            </div>
            <h4 style={styles.emptyTitle}>Your wishlist is empty</h4>
            <p style={styles.emptySubtitle}>Save items you love and come back to them anytime.</p>
            <Link href="/shop" style={styles.shopNowBtn}>
                <i className="fa fa-shopping-bag" style={{ marginRight: 8 }} />
                Explore the Shop
            </Link>
        </div>
    )
}

const styles = {
    pageWrapper: {
        background: 'linear-gradient(180deg, #F7F0E6 0%, #EDE3D4 100%)',
        minHeight: '60vh',
        padding: '32px 24px 64px',
    },
    pageHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 28,
        flexWrap: 'wrap',
        gap: 12,
    },
    pageTitle: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
        fontWeight: 700,
        color: '#1A1208',
        margin: 0,
    },
    pageCount: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#8C7B6B',
        margin: '4px 0 0',
    },
    shopMoreBtn: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: '#6B2737',
        textDecoration: 'none',
        background: '#F7F0E6',
        border: '1.5px solid #E8D5B0',
        borderRadius: 8,
        padding: '8px 16px',
        transition: 'all 0.2s',
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        borderRadius: 12,
        overflow: 'hidden',
        boxShadow: '0 4px 24px rgba(26,18,8,0.08)',
        border: '1px solid #E8D5B0',
    },
    thead: {
        background: 'linear-gradient(135deg, #6B2737, #8a3046)',
    },
    th: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: '#E8D5B0',
        padding: '14px 16px',
        textAlign: 'left',
        border: 'none',
    },
    tr: {
        transition: 'background 0.15s',
        borderBottom: '1px solid #E8D5B0',
    },
    td: {
        padding: '14px 16px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        color: '#1A1208',
        verticalAlign: 'middle',
        border: 'none',
    },
    bookImg: {
        borderRadius: 8,
        objectFit: 'contain',
        border: '1px solid #E8D5B0',
        background: '#F7F0E6',
    },
    bookName: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: 600,
        fontSize: 14,
        color: '#1A1208',
    },
    brandBadge: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        background: '#F7F0E6',
        border: '1px solid #E8D5B0',
        color: '#6B2737',
        padding: '3px 10px',
        borderRadius: 20,
        fontWeight: 600,
    },
    detailPills: { display: 'flex', gap: 6, flexWrap: 'wrap' },
    pill: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        background: '#E8D5B0',
        color: '#1A1208',
        padding: '2px 9px',
        borderRadius: 20,
    },
    price: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#6B2737',
    },
    stockBadge: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        padding: '3px 10px',
        borderRadius: 20,
        display: 'inline-block',
    },
    stockIn:  { background: '#eafaf1', color: '#1e8449', border: '1px solid #a9dfbf' },
    stockOut: { background: '#fdf2f8', color: '#922b21', border: '1px solid #f1948a' },
    cartBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: '#6B2737',
        color: '#FDFAF5',
        padding: '8px 14px',
        borderRadius: 7,
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s',
        border: 'none',
    },
    deleteBtn: {
        background: 'transparent',
        border: '1.5px solid #E8D5B0',
        borderRadius: 7,
        color: '#8C7B6B',
        cursor: 'pointer',
        padding: '8px 12px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        transition: 'all 0.2s',
    },
    deleteBtnHover: {
        background: '#fff5f5',
        border: '1.5px solid #c0392b',
        color: '#c0392b',
    },
    // Mobile
    mobileCard: {
        background: '#FDFAF5',
        borderRadius: 12,
        boxShadow: '0 4px 16px rgba(26,18,8,0.08)',
        border: '1px solid #E8D5B0',
        padding: 16,
        marginBottom: 12,
    },
    mobileCardInner: { display: 'flex', gap: 14, marginBottom: 12 },
    mobileImg: {
        width: 80,
        height: 80,
        objectFit: 'contain',
        borderRadius: 8,
        border: '1px solid #E8D5B0',
        background: '#F7F0E6',
        flexShrink: 0,
    },
    mobileInfo: { flex: 1 },
    mobileBookName: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 15,
        fontWeight: 700,
        color: '#1A1208',
        marginBottom: 4,
    },
    mobileBrand: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: '#8C7B6B',
        marginBottom: 4,
    },
    mobilePrice: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 16,
        fontWeight: 700,
        color: '#6B2737',
        marginBottom: 6,
    },
    mobileBtnRow: { display: 'flex', gap: 10 },
    // Empty state
    emptyState: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '72px 24px',
        textAlign: 'center',
    },
    emptyIcon: {
        width: 88,
        height: 88,
        borderRadius: '50%',
        background: '#F7F0E6',
        border: '2px solid #E8D5B0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    emptyTitle: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
        fontWeight: 700,
        color: '#1A1208',
        marginBottom: 8,
    },
    emptySubtitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        color: '#8C7B6B',
        marginBottom: 28,
    },
    shopNowBtn: {
        display: 'inline-flex',
        alignItems: 'center',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        background: '#6B2737',
        color: '#FDFAF5',
        padding: '12px 28px',
        borderRadius: 8,
        textDecoration: 'none',
        boxShadow: '0 4px 16px rgba(107,39,55,0.25)',
        transition: 'all 0.3s',
    },
}