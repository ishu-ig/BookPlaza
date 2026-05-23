"use client"
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCheckout, updateCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { updateBook } from '../Redux/ActionCreartors/BookActionCreators';
import Link from 'next/link';

const STATUS_CONFIG = {
    "Ordered":                { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",  label: "Ordered"          },
    "Order is Under Process": { color: "#0284C7", bg: "#EFF6FF", border: "#BFDBFE",  label: "Processing"       },
    "Order is Packed":        { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE",  label: "Packed"           },
    "Out For Delivery":       { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",  label: "Out for Delivery" },
    "Delivered":              { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0",  label: "Delivered"        },
    "Cancelled":              { color: "#E11D48", bg: "#FFF1F2", border: "#FECDD3",  label: "Cancelled"        },
};

const CANCEL_BLOCKED = ["Order is Under Process", "Out For Delivery", "Order is Packed", "Delivered", "Cancelled"];

export default function Order({ title, data = [] }) {
    const BookStateData = useSelector((state) => state.BookStateData);
    const dispatch      = useDispatch();

    const isEbookPage = title === "Ebook Orders";
    const [ebookModal, setEbookModal] = useState(null);

    useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

    /* ── cancel order ── */
    function cancelOrder(order) {
        if (!window.confirm("Are you sure you want to cancel this order?")) return;
        dispatch(updateCheckout({ ...order, orderStatus: "Cancelled" }));
        (order.books || []).forEach((cartItem) => {
            if (cartItem.format !== "Ebook") {
                // FIX: cartItem.book (lowercase) — matches schema field name
                const book = BookStateData.find((x) => x._id === (cartItem.book?._id || cartItem.book));
                if (book) dispatch(updateBook({ ...book, stock: book.stock + cartItem.qty }));
            }
        });
    }

    /* ── ebook access gate ── */
    function canAccessEbook(order) {
        return order.paymentStatus === "Done" || order.paymentMode === "COD";
    }

    /* ── CSS ── */
    const css = `
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');
        :root{
            --cream:#FAF8F5;--white:#FFF;--sand:#F2EDE6;--sand-deep:#E8E0D5;
            --ink:#1C1917;--ink-soft:#44403C;--ink-muted:#78716C;--ink-ghost:#A8A29E;
            --amber:#D97706;--amber-lt:#FEF3C7;--rose:#E11D48;--emerald:#059669;
            --sky:#0284C7;--border:#E7E2DA;--border-deep:#D6CFC5;
            --sh-sm:0 1px 3px rgba(28,25,23,.06),0 1px 2px rgba(28,25,23,.04);
            --sh-md:0 4px 16px rgba(28,25,23,.09),0 2px 6px rgba(28,25,23,.05);
            --sh-lg:0 12px 40px rgba(28,25,23,.12),0 6px 18px rgba(28,25,23,.07);
        }
        .op-page{background:var(--cream);min-height:100vh;padding:32px 0 110px;}
        .op-page-title{font-family:'Playfair Display',serif;font-size:clamp(22px,3vw,32px);font-weight:700;color:var(--ink);margin-bottom:24px;}
        .op-page-title em{color:var(--amber);font-style:italic;}
        .op-ebook-banner{background:linear-gradient(135deg,#EFF6FF,#DBEAFE);border:1.5px solid #BFDBFE;border-radius:18px;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;gap:16px;}
        .op-ebook-banner-icon{font-size:28px;color:var(--sky);flex-shrink:0;}
        .op-ebook-banner-text{font-family:'Outfit',sans-serif;}
        .op-ebook-banner-title{font-size:15px;font-weight:700;color:#1E40AF;margin-bottom:2px;}
        .op-ebook-banner-sub{font-size:12.5px;color:#3B82F6;line-height:1.5;}
        .op-card{background:var(--white);border:1.5px solid var(--border);border-radius:20px;margin-bottom:20px;overflow:hidden;box-shadow:var(--sh-sm);transition:box-shadow .25s;}
        .op-card:hover{box-shadow:var(--sh-md);}
        .op-card-head{background:var(--sand);border-bottom:1px solid var(--border);padding:14px 22px;display:flex;flex-wrap:wrap;gap:10px;align-items:center;justify-content:space-between;}
        .op-order-id{font-family:'Outfit',sans-serif;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-ghost);}
        .op-order-id span{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:var(--ink);letter-spacing:0;text-transform:none;margin-left:6px;}
        .op-date{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--ink-ghost);display:flex;align-items:center;gap:5px;}
        .op-status-badge{font-family:'Outfit',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;padding:5px 14px;border-radius:100px;border-width:1px;border-style:solid;}
        .op-card-body{padding:18px 22px;}
        .op-book-row{display:flex;align-items:flex-start;gap:14px;padding:12px 0;border-bottom:1px solid var(--border);}
        .op-book-row:last-of-type{border-bottom:none;}
        .op-book-img{width:56px;height:70px;object-fit:cover;border-radius:10px;flex-shrink:0;border:1px solid var(--border);background:var(--sand);}
        .op-book-info{flex:1;min-width:0;}
        .op-book-title{font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;}
        .op-book-author{font-family:'Outfit',sans-serif;font-size:11.5px;color:var(--ink-ghost);margin-bottom:6px;}
        .op-fmt-badge{display:inline-flex;align-items:center;gap:4px;font-family:'Outfit',sans-serif;font-size:10px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:2px 9px;border-radius:100px;}
        .op-fmt-badge.ebook{background:#EFF6FF;color:var(--sky);border:1px solid #BFDBFE;}
        .op-fmt-badge.physical{background:var(--amber-lt);color:var(--amber);border:1px solid #FDE68A;}
        .op-book-right{text-align:right;flex-shrink:0;}
        .op-book-price{font-family:'Playfair Display',serif;font-size:15px;font-weight:700;color:var(--ink);}
        .op-book-qty{font-family:'Outfit',sans-serif;font-size:11px;color:var(--ink-ghost);margin-top:2px;}
        .op-ebook-btn{display:inline-flex;align-items:center;gap:6px;font-family:'Outfit',sans-serif;font-size:10.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:6px 13px;border-radius:8px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--sky),#0369A1);color:white;margin-top:7px;transition:opacity .2s,transform .15s;box-shadow:0 2px 10px rgba(2,132,199,.22);}
        .op-ebook-btn:hover{opacity:.88;transform:translateY(-1px);}
        .op-ebook-btn.locked{background:var(--sand-deep);color:var(--ink-ghost);box-shadow:none;cursor:default;}
        .op-ebook-btn.locked:hover{opacity:1;transform:none;}
        .op-card-foot{border-top:1px solid var(--border);padding:14px 22px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;}
        .op-totals-label{font-family:'Outfit',sans-serif;font-size:11px;color:var(--ink-ghost);margin-bottom:2px;}
        .op-totals-val{font-family:'Playfair Display',serif;font-size:22px;font-weight:700;color:var(--ink);}
        .op-pay-info{font-family:'Outfit',sans-serif;font-size:12.5px;color:var(--ink-muted);line-height:1.7;}
        .op-pay-info strong{color:var(--ink);}
        .op-pay-status{font-weight:700;display:flex;align-items:center;gap:5px;margin-top:2px;}
        .op-action-btn{font-family:'Outfit',sans-serif;font-size:11.5px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;padding:9px 18px;border-radius:10px;cursor:pointer;transition:background .2s,transform .15s,color .2s,border-color .2s;text-decoration:none;display:inline-flex;align-items:center;gap:6px;}
        .op-action-btn:hover{text-decoration:none;}
        .op-action-btn.outline-ink{background:transparent;color:var(--ink-soft);border:1.5px solid var(--border-deep);}
        .op-action-btn.outline-ink:hover{background:var(--ink);color:white;border-color:var(--ink);}
        .op-action-btn.outline-rose{background:transparent;color:var(--rose);border:1.5px solid rgba(225,29,72,.3);}
        .op-action-btn.outline-rose:hover{background:var(--rose);color:white;border-color:var(--rose);}
        .op-modal-overlay{position:fixed;inset:0;z-index:9999;background:rgba(28,25,23,.55);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;padding:20px;animation:opFadeIn .22s ease;}
        @keyframes opFadeIn{from{opacity:0}to{opacity:1}}
        .op-modal{background:var(--white);border-radius:24px;padding:40px 36px;max-width:460px;width:100%;box-shadow:var(--sh-lg);animation:opSlideUp .28s cubic-bezier(.22,.68,0,1.2);text-align:center;}
        @keyframes opSlideUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:none}}
        .op-modal-icon{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#EFF6FF,#DBEAFE);display:flex;align-items:center;justify-content:center;font-size:30px;color:var(--sky);margin:0 auto 20px;}
        .op-modal-title{font-family:'Playfair Display',serif;font-size:24px;font-weight:700;color:var(--ink);margin-bottom:6px;}
        .op-modal-book{font-family:'Outfit',sans-serif;font-size:13px;font-weight:600;color:var(--amber);margin-bottom:20px;}
        .op-modal-features{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:20px;}
        .op-modal-feat{display:flex;align-items:center;gap:5px;font-family:'Outfit',sans-serif;font-size:11.5px;font-weight:600;color:var(--emerald);background:rgba(5,150,105,.07);padding:4px 12px;border-radius:100px;}
        .op-modal-note{font-family:'Outfit',sans-serif;font-size:13px;color:var(--ink-muted);line-height:1.65;margin-bottom:24px;}
        .op-modal-dl-btn{width:100%;font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:14px;border-radius:12px;border:none;cursor:pointer;background:linear-gradient(135deg,var(--sky),#0369A1);color:white;display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:10px;transition:opacity .2s,transform .15s;text-decoration:none;}
        .op-modal-dl-btn:hover{opacity:.9;transform:translateY(-1px);color:white;text-decoration:none;}
        .op-modal-close-btn{width:100%;font-family:'Outfit',sans-serif;font-size:13px;font-weight:500;padding:12px;border-radius:12px;border:1.5px solid var(--border-deep);background:transparent;color:var(--ink-muted);cursor:pointer;transition:border-color .2s,color .2s;}
        .op-modal-close-btn:hover{border-color:var(--ink-soft);color:var(--ink);}
        .op-empty{text-align:center;padding:80px 0;}
        .op-empty-icon{font-size:52px;color:var(--border-deep);margin-bottom:16px;}
        .op-empty h3{font-family:'Playfair Display',serif;font-size:26px;color:var(--ink);margin-bottom:8px;}
        .op-empty p{font-family:'Outfit',sans-serif;font-size:14px;color:var(--ink-ghost);margin-bottom:24px;}
        .op-empty-btn{font-family:'Outfit',sans-serif;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:13px 36px;border-radius:100px;background:var(--ink);color:white;text-decoration:none;display:inline-block;transition:background .2s;}
        .op-empty-btn:hover{background:var(--amber);color:white;}
        @media(max-width:576px){
            .op-modal{padding:32px 18px;}
            .op-card-head,.op-card-foot{padding:12px 14px;}
            .op-card-body{padding:14px;}
        }
    `;

    return (
        <>
            <style>{css}</style>

            {/* ── Ebook access modal ── */}
            {ebookModal && (
                <div className="op-modal-overlay" onClick={() => setEbookModal(null)}>
                    <div className="op-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="op-modal-icon">
                            <i className="fa-solid fa-tablet-screen-button" />
                        </div>
                        <div className="op-modal-title">Your E-Book is Ready</div>
                        {/* FIX: ebookModal is a book object — access .title directly */}
                        <div className="op-modal-book">"{ebookModal.title}"</div>
                        <div className="op-modal-features">
                            <div className="op-modal-feat"><i className="fa-solid fa-infinity" /> Lifetime access</div>
                            <div className="op-modal-feat"><i className="fa-solid fa-mobile-screen" /> All devices</div>
                            <div className="op-modal-feat"><i className="fa-solid fa-shield-halved" /> DRM protected</div>
                        </div>
                        <div className="op-modal-note">
                            Your purchase is confirmed. You can download or read this e-book anytime from your orders page.
                        </div>
                        <a
                            href={ebookModal.ebookFile}
                            target="_blank"
                            rel="noreferrer"
                            className="op-modal-dl-btn"
                        >
                            <i className="fa-solid fa-download" /> Download / Read Now
                        </a>
                        <button className="op-modal-close-btn" onClick={() => setEbookModal(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}

            <div className="op-page">
                <div className="container">

                    <div className="op-page-title">
                        {isEbookPage ? <>My <em>E-Books</em></> : <>My <em>Orders</em></>}
                    </div>

                    {isEbookPage && (
                        <div className="op-ebook-banner">
                            <i className="fa-solid fa-tablet-screen-button op-ebook-banner-icon" />
                            <div className="op-ebook-banner-text">
                                <div className="op-ebook-banner-title">Your Digital Library</div>
                                <div className="op-ebook-banner-sub">
                                    All purchased e-books are available here. Click "Read / Download" on any paid order to access your book instantly on any device.
                                </div>
                            </div>
                        </div>
                    )}

                    {data.length ? data.map((order) => {
                        const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG["Ordered"];
                        const isPaid    = canAccessEbook(order);

                        // FIX 1: order.books (lowercase) — matches Mongoose schema field
                        const allItems = order.books || [];

                        // On ebook page show only ebook items; on orders page show all
                        const displayItems = isEbookPage
                            ? allItems.filter(x => x.format === "Ebook")
                            : allItems;

                        if (!displayItems.length) return null;

                        return (
                            <div key={order._id} className="op-card">

                                {/* ── Head ── */}
                                <div className="op-card-head">
                                    <div>
                                        <div className="op-order-id">
                                            Order ID <span>#{order._id?.slice(-8).toUpperCase()}</span>
                                        </div>
                                        <div className="op-date">
                                            <i className="fa-regular fa-calendar" />
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric", month: "long", year: "numeric"
                                            })}
                                        </div>
                                    </div>
                                    <span
                                        className="op-status-badge"
                                        style={{ color: statusCfg.color, background: statusCfg.bg, borderColor: statusCfg.border }}
                                    >
                                        {statusCfg.label}
                                    </span>
                                </div>

                                {/* ── Book rows ── */}
                                <div className="op-card-body">
                                    {displayItems.map((cartItem, i) => {
                                        const isEbook = cartItem.format === "Ebook";

                                        // FIX 2: cartItem.book (lowercase) — Mongoose populates as lowercase
                                        const bookData = cartItem.book;

                                        return (
                                            <div key={i} className="op-book-row">
                                                <img
                                                    className="op-book-img"
                                                    src={bookData?.pic
                                                        ? `${process.env.NEXT_PUBLIC_SERVER}/${bookData.pic}`
                                                        : "/img/noimage.jpg"
                                                    }
                                                    alt={bookData?.title}
                                                    onError={e => { e.currentTarget.src = "/img/noimage.jpg"; }}
                                                />
                                                <div className="op-book-info">
                                                    <div className="op-book-title">{bookData?.title || "Untitled"}</div>
                                                    <div className="op-book-author">by {bookData?.author || "—"}</div>
                                                    <span className={`op-fmt-badge ${isEbook ? "ebook" : "physical"}`}>
                                                        <i className={`fa-solid ${isEbook ? "fa-tablet-screen-button" : "fa-book"}`} />
                                                        {cartItem.format || "Paperback"}
                                                    </span>

                                                    {isEbook && (
                                                        <div style={{ marginTop: 6 }}>
                                                            {isPaid && order.orderStatus !== "Cancelled" ? (
                                                                // FIX 3: pass bookData (lowercase) to the modal
                                                                <button
                                                                    className="op-ebook-btn"
                                                                    onClick={() => setEbookModal(bookData)}
                                                                >
                                                                    <i className="fa-solid fa-bolt" /> Read / Download
                                                                </button>
                                                            ) : order.orderStatus === "Cancelled" ? (
                                                                <button className="op-ebook-btn locked" disabled>
                                                                    <i className="fa-solid fa-ban" /> Cancelled
                                                                </button>
                                                            ) : (
                                                                <button className="op-ebook-btn locked" disabled>
                                                                    <i className="fa-solid fa-lock" /> Payment Pending
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="op-book-right">
                                                    <div className="op-book-price">₹{cartItem.total}</div>
                                                    {!isEbook && <div className="op-book-qty">Qty: {cartItem.qty}</div>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* ── Footer ── */}
                                <div className="op-card-foot">
                                    <div>
                                        <div className="op-totals-label">Order Total</div>
                                        <div className="op-totals-val">₹{order.total}</div>
                                    </div>
                                    <div className="op-pay-info">
                                        <div><strong>Payment:</strong> {order.paymentMode}</div>
                                        <div
                                            className="op-pay-status"
                                            style={{ color: order.paymentStatus === "Done" ? "var(--emerald)" : "var(--rose)" }}
                                        >
                                            <i className={`fa-solid ${order.paymentStatus === "Done" ? "fa-circle-check" : "fa-clock"}`} />
                                            {order.paymentStatus}
                                        </div>
                                    </div>
                                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                        {!isEbookPage && !CANCEL_BLOCKED.includes(order.orderStatus) && (
                                            <button className="op-action-btn outline-rose" onClick={() => cancelOrder(order)}>
                                                <i className="fa-solid fa-xmark" /> Cancel
                                            </button>
                                        )}
                                        <Link href={`/order-detail/${order._id}`} className="op-action-btn outline-ink">
                                            <i className="fa-solid fa-eye" /> Details
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        );
                    }) : (
                        <div className="op-empty">
                            <div className="op-empty-icon">
                                <i className={isEbookPage ? "fa-regular fa-tablet-screen-button" : "fa-regular fa-bag-shopping"} />
                            </div>
                            <h3>{isEbookPage ? "No e-books purchased yet" : "No orders yet"}</h3>
                            <p>
                                {isEbookPage
                                    ? "Browse our collection and buy your first e-book."
                                    : "You haven't placed any orders. Start exploring our collection!"}
                            </p>
                            <Link href="/shop" className="op-empty-btn">Browse Books</Link>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}