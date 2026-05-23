"use client"
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getCheckout } from '../Redux/ActionCreartors/CheckoutActionCreators';
import { useParams } from 'next/navigation';
import Link from 'next/link';

const STATUS_STEPS = ["Ordered", "Order is Under Process", "Order is Packed", "Out For Delivery", "Delivered"];

const STATUS_CONFIG = {
    "Ordered":                { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",  icon: "fa-clock" },
    "Order is Under Process": { color: "#0284C7", bg: "#EFF6FF", border: "#BFDBFE",  icon: "fa-gear" },
    "Order is Packed":        { color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE",  icon: "fa-box" },
    "Out For Delivery":       { color: "#D97706", bg: "#FFFBEB", border: "#FDE68A",  icon: "fa-truck-fast" },
    "Delivered":              { color: "#059669", bg: "#ECFDF5", border: "#A7F3D0",  icon: "fa-circle-check" },
    "Cancelled":              { color: "#E11D48", bg: "#FFF1F2", border: "#FECDD3",  icon: "fa-ban" },
};

export default function OrderDetailPage() {
    // FIX 1: read both param key names to handle [id] and [_id] folder conventions
    const params = useParams();
    const id = params.id || params._id;

    const CheckoutStateData = useSelector(state => state.CheckoutStateData);
    const [order, setOrder] = useState(null);
    const dispatch = useDispatch();
    console.log(process.env.NEXT_PUBLIC_SERVER)  // should print your server URL

    useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

    useEffect(() => {
        if (CheckoutStateData.length) {
            // FIX 2: was o.id — MongoDB documents use _id, not id
            const found = CheckoutStateData.find(o => o._id === id);
            setOrder(found || {});
        }
    }, [CheckoutStateData, id]);

    const generateInvoice = async () => {
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/invoice/generate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId: id }),
            });
            const data = await response.json();
            if (response.ok && data.invoice?.invoiceNumber) {
                downloadInvoice(data.invoice.invoiceNumber);
            } else {
                alert('Invoice generation failed.');
            }
        } catch (err) {
            console.error('Error generating invoice:', err);
            alert('Error generating invoice.');
        }
    };

    const downloadInvoice = (invoiceNumber) => {
        window.open(`${process.env.NEXT_PUBLIC_SERVER}/invoices/${invoiceNumber}.pdf`, '_blank');
    };

    if (!order) {
        return (
            <div style={{ background: "var(--cream)", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap'); :root{--cream:#FAF8F5;}`}</style>
                <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#78716C" }}>
                    <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 10 }} />Loading Order Details…
                </div>
            </div>
        );
    }

    const statusCfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG["Ordered"];
    const currentStep = STATUS_STEPS.indexOf(order.orderStatus);
    const isCancelled = order.orderStatus === "Cancelled";

    const ebookItems = (order.books || []).filter(x => x.format === "Ebook");
    const physItems  = (order.books || []).filter(x => x.format !== "Ebook");
    const allItems   = [...physItems, ...ebookItems];

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600&display=swap');
                :root {
                    --cream:#FAF8F5; --white:#FFF; --sand:#F2EDE6; --sand-deep:#E8E0D5;
                    --ink:#1C1917; --ink-soft:#44403C; --ink-muted:#78716C; --ink-ghost:#A8A29E;
                    --amber:#D97706; --amber-lt:#FEF3C7; --rose:#E11D48; --emerald:#059669;
                    --sky:#0284C7; --border:#E7E2DA; --border-deep:#D6CFC5;
                    --shadow-sm:0 1px 3px rgba(28,25,23,.06),0 1px 2px rgba(28,25,23,.04);
                    --shadow-md:0 4px 16px rgba(28,25,23,.09),0 2px 6px rgba(28,25,23,.05);
                }
                .od-page { background: var(--cream); min-height: 100vh; padding: 32px 0 100px; }
                .od-page-title { font-family: 'Playfair Display', serif; font-size: clamp(22px,3vw,32px); font-weight: 700; color: var(--ink); margin-bottom: 6px; }
                .od-page-title span { color: var(--amber); font-style: italic; }
                .od-breadcrumb { font-family: 'Outfit', sans-serif; font-size: 13px; color: var(--ink-ghost); margin-bottom: 28px; display: flex; align-items: center; gap: 6px; }
                .od-breadcrumb a { color: var(--ink-ghost); text-decoration: none; transition: color .2s; }
                .od-breadcrumb a:hover { color: var(--amber); }
                .od-card { background: var(--white); border: 1.5px solid var(--border); border-radius: 20px; margin-bottom: 20px; box-shadow: var(--shadow-sm); overflow: hidden; transition: box-shadow .25s; }
                .od-card:hover { box-shadow: var(--shadow-md); }
                .od-card-head { background: var(--sand); border-bottom: 1px solid var(--border); padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
                .od-section-label { font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: .18em; text-transform: uppercase; color: var(--ink-ghost); }
                .od-section-title { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 700; color: var(--ink); margin-top: 2px; }
                .od-card-body { padding: 22px 24px; }
                .od-status-badge { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 5px 14px; border-radius: 100px; border: 1px solid; display: inline-flex; align-items: center; gap: 6px; }
                .od-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; }
                .od-meta-key { font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 4px; }
                .od-meta-val { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; color: var(--ink); }
                .od-meta-val.paid { color: var(--emerald); font-weight: 700; }
                .od-meta-val.pending { color: var(--rose); font-weight: 700; }
                .od-tracker { display: flex; align-items: flex-start; gap: 0; position: relative; padding: 8px 0 4px; overflow-x: auto; }
                .od-tracker-step { flex: 1; display: flex; flex-direction: column; align-items: center; position: relative; min-width: 80px; }
                .od-tracker-step:not(:last-child)::after { content: ''; position: absolute; top: 18px; left: calc(50% + 18px); width: calc(100% - 36px); height: 3px; border-radius: 2px; background: var(--border-deep); z-index: 0; }
                .od-tracker-step.done:not(:last-child)::after { background: var(--emerald); }
                .od-tracker-dot { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 13px; z-index: 1; position: relative; border: 2px solid var(--border-deep); background: var(--white); color: var(--ink-ghost); transition: all .3s; }
                .od-tracker-step.done .od-tracker-dot { background: var(--emerald); border-color: var(--emerald); color: white; box-shadow: 0 0 0 4px rgba(5,150,105,.12); }
                .od-tracker-step.active .od-tracker-dot { background: var(--amber); border-color: var(--amber); color: white; box-shadow: 0 0 0 4px rgba(217,119,6,.15); }
                .od-tracker-label { font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 600; color: var(--ink-ghost); text-align: center; margin-top: 8px; max-width: 80px; line-height: 1.3; }
                .od-tracker-step.done .od-tracker-label { color: var(--emerald); }
                .od-tracker-step.active .od-tracker-label { color: var(--amber); font-weight: 700; }
                .od-address-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px 24px; }
                @media (max-width: 576px) { .od-address-grid { grid-template-columns: 1fr; } }
                .od-addr-key { font-family: 'Outfit', sans-serif; font-size: 10.5px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 3px; }
                .od-addr-val { font-family: 'Outfit', sans-serif; font-size: 13.5px; color: var(--ink-soft); }
                .od-book-row { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-bottom: 1px solid var(--border); }
                .od-book-row:last-of-type { border-bottom: none; }
                .od-book-img { width: 60px; height: 76px; object-fit: cover; border-radius: 10px; flex-shrink: 0; border: 1px solid var(--border); background: var(--sand); }
                .od-book-info { flex: 1; min-width: 0; }
                .od-book-title { font-family: 'Playfair Display', serif; font-size: 14px; font-weight: 600; color: var(--ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
                .od-book-author { font-family: 'Outfit', sans-serif; font-size: 11.5px; color: var(--ink-ghost); margin-bottom: 6px; }
                .od-fmt-badge { display: inline-flex; align-items: center; gap: 4px; font-family: 'Outfit', sans-serif; font-size: 10px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 2px 9px; border-radius: 100px; }
                .od-fmt-badge.ebook { background: #EFF6FF; color: var(--sky); border: 1px solid #BFDBFE; }
                .od-fmt-badge.physical { background: var(--amber-lt); color: var(--amber); border: 1px solid #FDE68A; }
                .od-book-price-col { text-align: right; flex-shrink: 0; }
                .od-book-price { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; color: var(--ink); }
                .od-book-qty { font-family: 'Outfit', sans-serif; font-size: 11px; color: var(--ink-ghost); margin-top: 2px; }
                .od-footer { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; padding: 20px 24px; border-top: 1.5px solid var(--border); background: var(--sand); border-radius: 0 0 20px 20px; }
                .od-total-label { font-family: 'Outfit', sans-serif; font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--ink-ghost); margin-bottom: 4px; }
                .od-total-val { font-family: 'Playfair Display', serif; font-size: 28px; font-weight: 700; color: var(--ink); }
                .od-btn { font-family: 'Outfit', sans-serif; font-size: 12.5px; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; padding: 11px 22px; border-radius: 12px; cursor: pointer; transition: background .2s, transform .15s, color .2s, box-shadow .2s; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; border: none; }
                .od-btn.primary { background: var(--ink); color: white; box-shadow: 0 4px 14px rgba(28,25,23,.15); }
                .od-btn.primary:hover { background: var(--amber); transform: translateY(-2px); box-shadow: 0 8px 20px rgba(217,119,6,.25); color: white; }
                .od-btn.outline { background: transparent; color: var(--ink-soft); border: 1.5px solid var(--border-deep); }
                .od-btn.outline:hover { background: var(--ink); color: white; border-color: var(--ink); }
                @media (max-width: 576px) { .od-card-head, .od-card-body, .od-footer { padding: 16px; } }
            `}</style>

            <div className="od-page">
                <div className="container">

                    <div className="od-page-title">Order <span>Details</span></div>
                    <div className="od-breadcrumb">
                        <Link href="/order">My Orders</Link>
                        <i className="fa-solid fa-chevron-right" style={{ fontSize: 9 }} />
                        <span>#{order._id?.slice(-8).toUpperCase()}</span>
                    </div>

                    {/* ── 1. Order Summary ── */}
                    <div className="od-card">
                        <div className="od-card-head">
                            <div>
                                <div className="od-section-label">Order Summary</div>
                                <div className="od-section-title">#{order._id?.slice(-8).toUpperCase()}</div>
                            </div>
                            <span className="od-status-badge" style={{ color: statusCfg.color, background: statusCfg.bg, borderColor: statusCfg.border }}>
                                <i className={`fa-solid ${statusCfg.icon}`} />
                                {order.orderStatus}
                            </span>
                        </div>
                        <div className="od-card-body">
                            <div className="od-meta-grid">
                                <div className="od-meta-item">
                                    <div className="od-meta-key">Order Date</div>
                                    <div className="od-meta-val">
                                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "N/A"}
                                    </div>
                                </div>
                                <div className="od-meta-item">
                                    <div className="od-meta-key">Payment Mode</div>
                                    <div className="od-meta-val">{order.paymentMode || "—"}</div>
                                </div>
                                <div className="od-meta-item">
                                    <div className="od-meta-key">Payment Status</div>
                                    <div className={`od-meta-val ${order.paymentStatus === "Paid" ? "paid" : "pending"}`}>
                                        <i className={`fa-solid ${order.paymentStatus === "Paid" ? "fa-circle-check" : "fa-clock"}`} style={{ marginRight: 5 }} />
                                        {order.paymentStatus}
                                    </div>
                                </div>
                                <div className="od-meta-item">
                                    <div className="od-meta-key">Items</div>
                                    <div className="od-meta-val">{(order.books || []).length} item{(order.books || []).length !== 1 ? "s" : ""}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── 2. Status Tracker ── */}
                    {!isCancelled ? (
                        <div className="od-card">
                            <div className="od-card-head">
                                <div>
                                    <div className="od-section-label">Shipment Progress</div>
                                    <div className="od-section-title">Track Your Order</div>
                                </div>
                            </div>
                            <div className="od-card-body">
                                <div className="od-tracker">
                                    {STATUS_STEPS.map((step, idx) => {
                                        const done   = idx < currentStep;
                                        const active = idx === currentStep;
                                        const icons  = ["fa-receipt","fa-gear","fa-box","fa-truck-fast","fa-circle-check"];
                                        return (
                                            <div key={step} className={`od-tracker-step ${done ? "done" : active ? "active" : ""}`}>
                                                <div className="od-tracker-dot">
                                                    {done ? <i className="fa-solid fa-check" /> : <i className={`fa-solid ${icons[idx]}`} />}
                                                </div>
                                                <div className="od-tracker-label">{step}</div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="od-card">
                            <div className="od-card-body" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: "50%", background: "#FFF1F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    <i className="fa-solid fa-ban" style={{ color: "var(--rose)", fontSize: 18 }} />
                                </div>
                                <div>
                                    <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: "var(--ink)", marginBottom: 3 }}>Order Cancelled</div>
                                    <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "var(--ink-muted)" }}>This order was cancelled and is no longer being processed.</div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── 3. Delivery Address ── */}
                    {order.user && (
                        <div className="od-card">
                            <div className="od-card-head">
                                <div>
                                    <div className="od-section-label">Delivery</div>
                                    <div className="od-section-title">Shipping Address</div>
                                </div>
                                <i className="fa-solid fa-location-dot" style={{ color: "var(--amber)", fontSize: 20 }} />
                            </div>
                            <div className="od-card-body">
                                <div className="od-address-grid">
                                    {[
                                        { key: "Name",    val: order.user?.name },
                                        { key: "Email",   val: order.user?.email },
                                        { key: "Phone",   val: order.user?.phone },
                                        { key: "Address", val: order.user?.address },
                                        { key: "City",    val: order.user?.city },
                                        { key: "State",   val: order.user?.state },
                                        { key: "Pincode", val: order.user?.pin },
                                    ].map(({ key, val }) => val ? (
                                        <div key={key} className="od-addr-item">
                                            <div className="od-addr-key">{key}</div>
                                            <div className="od-addr-val">{val}</div>
                                        </div>
                                    ) : null)}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── 4. Ordered Items ── */}
                    <div className="od-card">
                        <div className="od-card-head">
                            <div>
                                <div className="od-section-label">Items</div>
                                <div className="od-section-title">Ordered Books</div>
                            </div>
                        </div>
                        <div className="od-card-body" style={{ paddingTop: 8, paddingBottom: 8 }}>
                            {allItems.length > 0 ? allItems.map((cartItem, i) => {
                                const isEbook = cartItem.format === "Ebook";
                                return (
                                    <div key={i} className="od-book-row">
                                        <img
                                            className="od-book-img"
                                            src={`${process.env.NEXT_PUBLIC_SERVER}/${cartItem.book?.pic}`}
                                            alt={cartItem.book?.title}
                                        />
                                        <div className="od-book-info">
                                            <div className="od-book-title">{cartItem.book?.title || "—"}</div>
                                            <div className="od-book-author">by {cartItem.book?.author || "—"}</div>
                                            <span className={`od-fmt-badge ${isEbook ? "ebook" : "physical"}`}>
                                                <i className={`fa-solid ${isEbook ? "fa-tablet-screen-button" : "fa-book"}`} />
                                                {cartItem.format || "Paperback"}
                                            </span>
                                        </div>
                                        <div className="od-book-price-col">
                                            <div className="od-book-price">₹{cartItem.total}</div>
                                            {!isEbook && <div className="od-book-qty">Qty: {cartItem.qty}</div>}
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div style={{ fontFamily: "Outfit,sans-serif", fontSize: 13, color: "var(--ink-ghost)", textAlign: "center", padding: "20px 0" }}>
                                    No items found for this order.
                                </div>
                            )}
                        </div>
                        <div className="od-footer">
                            <div>
                                <div className="od-total-label">Order Total</div>
                                <div className="od-total-val">₹{order.total}</div>
                            </div>
                            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                                <button className="od-btn primary" onClick={generateInvoice}>
                                    <i className="fa-solid fa-file-invoice" /> View Invoice
                                </button>
                                <Link href="/order" className="od-btn outline">
                                    <i className="fa-solid fa-arrow-left" /> My Orders
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}