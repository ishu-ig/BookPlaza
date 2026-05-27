import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
    PieChart, Pie, Cell, Legend,
} from "recharts";

import { getCategory }     from "../Redux/ActionCreartors/CategoryActionCreators";
import { getSubcategory }  from "../Redux/ActionCreartors/SubcategoryActionCreators";
import { getPublisher }    from "../Redux/ActionCreartors/PublisherActionCreators";
import { getTestimonial }  from "../Redux/ActionCreartors/TestimonialActionCreators";
import { getBook }         from "../Redux/ActionCreartors/BookActionCreators";
import { getBanner }       from "../Redux/ActionCreartors/BannerActionCreators";
import { getCheckout }     from "../Redux/ActionCreartors/CheckoutActionCreators";
import { getNewsletter }   from "../Redux/ActionCreartors/NewsletterActionCreators";
import { getContactUs }    from "../Redux/ActionCreartors/ContactUsActionCreators";

// ── Sample fallback data ───────────────────────────────────────────────────────
const SAMPLE = {
    categories: [
        { name: "Fiction",      active: true  },
        { name: "Non-Fiction",  active: true  },
        { name: "Science",      active: true  },
        { name: "History",      active: false },
        { name: "Technology",   active: true  },
    ],
    subcategories: [
        { name: "Fantasy",       active: true  },
        { name: "Mystery",       active: true  },
        { name: "Biography",     active: true  },
        { name: "Self-Help",     active: false },
        { name: "Programming",   active: true  },
        { name: "Physics",       active: true  },
    ],
    publishers: [
        { name: "Penguin Random House", active: true  },
        { name: "HarperCollins",        active: true  },
        { name: "Oxford Press",         active: true  },
        { name: "Scholastic",           active: false },
    ],
    testimonials: [
        { name: "Rahul Sharma",  active: true  },
        { name: "Priya Mehta",   active: true  },
        { name: "Aakash Singh",  active: false },
        { name: "Sneha Patel",   active: true  },
        { name: "Vikram Nair",   active: false },
        { name: "Anjali Rao",    active: true  },
    ],
    books: [
        { title: "The Great Gatsby",       category: "Fiction",     featured: true,  active: true,  rating: 4.5, stock: 12, formatPricing: [{ format: "Paperback", finalPrice: 299 }] },
        { title: "Sapiens",                category: "Non-Fiction", featured: true,  active: true,  rating: 4.8, stock: 8,  formatPricing: [{ format: "Hardcover", finalPrice: 499 }] },
        { title: "Clean Code",             category: "Technology",  featured: false, active: true,  rating: 4.7, stock: 5,  formatPricing: [{ format: "Ebook",     finalPrice: 199 }] },
        { title: "A Brief History of Time",category: "Science",     featured: true,  active: true,  rating: 4.6, stock: 0,  formatPricing: [{ format: "Paperback", finalPrice: 349 }] },
        { title: "Atomic Habits",          category: "Non-Fiction", featured: false, active: false, rating: 4.9, stock: 20, formatPricing: [{ format: "Hardcover", finalPrice: 599 }] },
        { title: "1984",                   category: "Fiction",     featured: true,  active: true,  rating: 4.4, stock: 3,  formatPricing: [{ format: "Paperback", finalPrice: 249 }] },
    ],
    banners: [
        { title: "Summer Sale",     active: true  },
        { title: "New Arrivals",    active: true  },
        { title: "Ebook Offers",    active: false },
    ],
    checkouts: [
        { orderStatus: "Delivered",       paymentStatus: "Done",    total: 598,  paymentMode: "Net Banking" },
        { orderStatus: "Ordered",         paymentStatus: "Pending", total: 299,  paymentMode: "COD"         },
        { orderStatus: "Processing",      paymentStatus: "Pending", total: 499,  paymentMode: "COD"         },
        { orderStatus: "Shipped",         paymentStatus: "Done",    total: 1098, paymentMode: "Net Banking" },
        { orderStatus: "Cancelled",       paymentStatus: "Failed",  total: 349,  paymentMode: "Net Banking" },
        { orderStatus: "Out For Delivery",paymentStatus: "Pending", total: 249,  paymentMode: "COD"         },
        { orderStatus: "Delivered",       paymentStatus: "Done",    total: 799,  paymentMode: "Net Banking" },
    ],
    newsletters: Array(34).fill(null).map((_, i) => ({ _id: `nl${i}`, email: `user${i}@example.com`, active: true })),
    contacts: [
        { name: "Rahul Sharma",  email: "rahul@email.com",  subject: "Book Recommendation", active: true  },
        { name: "Priya Mehta",   email: "priya@email.com",  subject: "Bulk Order Query",    active: true  },
        { name: "Aakash Singh",  email: "aakash@email.com", subject: "Return Request",      active: false },
        { name: "Sneha Patel",   email: "sneha@email.com",  subject: "Ebook Access Issue",  active: true  },
        { name: "Vikram Nair",   email: "vikram@email.com", subject: "Feedback",            active: false },
    ],
};

// ── Custom tooltip ─────────────────────────────────────────────────────────────
const DashTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: "#161D2F", border: "1px solid rgba(79,142,247,0.25)",
            borderRadius: "10px", padding: "10px 14px", fontSize: "12.5px", lineHeight: 1.8,
        }}>
            {label && <p style={{ color: "#8896B3", marginBottom: "4px", fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>}
            {payload.map((p, i) => (
                <p key={i} style={{ color: p.color || p.fill || "#EEF2FF", margin: 0 }}>
                    {p.name}: <strong style={{ color: "#EEF2FF" }}>{p.value}</strong>
                </p>
            ))}
        </div>
    );
};

// ── Unwrap any Redux slice shape ───────────────────────────────────────────────
function unwrap(slice) {
    if (!slice) return [];
    if (Array.isArray(slice)) return slice;
    if (Array.isArray(slice.data)) return slice.data;
    if (slice.data && Array.isArray(slice.data.data)) return slice.data.data;
    for (const key of ["result", "records", "items", "list"]) {
        if (Array.isArray(slice[key])) return slice[key];
    }
    return [];
}

const currency = (n) =>
    `Rs. ${Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

export default function Home() {
    const dispatch = useDispatch();
    const [loaded, setLoaded]           = useState(false);
    const [usingSample, setUsingSample] = useState(false);

    const raw = {
        categories:    useSelector(s => s.CategoryStateData),
        subcategories: useSelector(s => s.SubcategoryStateData),
        publishers:    useSelector(s => s.PublisherStateData),
        testimonials:  useSelector(s => s.TestimonialStateData),
        books:         useSelector(s => s.BookStateData),
        banners:       useSelector(s => s.BannerStateData),
        checkouts:     useSelector(s => s.CheckoutStateData),
        newsletters:   useSelector(s => s.NewsletterStateData),
        contacts:      useSelector(s => s.ContactUsStateData),
    };

    useEffect(() => {
        dispatch(getCategory());
        dispatch(getSubcategory());
        dispatch(getPublisher());
        dispatch(getTestimonial());
        dispatch(getBook());
        dispatch(getBanner());
        dispatch(getCheckout());
        dispatch(getNewsletter());
        dispatch(getContactUs());
        setTimeout(() => setLoaded(true), 600);
    }, []);

    const live = {
        categories:    unwrap(raw.categories),
        subcategories: unwrap(raw.subcategories),
        publishers:    unwrap(raw.publishers),
        testimonials:  unwrap(raw.testimonials),
        books:         unwrap(raw.books),
        banners:       unwrap(raw.banners),
        checkouts:     unwrap(raw.checkouts),
        newsletters:   unwrap(raw.newsletters),
        contacts:      unwrap(raw.contacts),
    };

    const allEmpty = loaded && Object.values(live).every(a => a.length === 0);
    useEffect(() => { if (loaded) setUsingSample(allEmpty); }, [allEmpty, loaded]);

    const D = allEmpty ? SAMPLE : live;

    // ── Derived numbers ────────────────────────────────────────────────────────
    const featuredBooks       = D.books.filter(b => b.featured).length;
    const activeBooks         = D.books.filter(b => b.active).length;
    const outOfStockBooks     = D.books.filter(b => (b.stock ?? 1) === 0).length;
    const activeTestimonials  = D.testimonials.filter(t => t.active).length;
    const pendingTestimonials = D.testimonials.filter(t => !t.active).length;
    const activeBanners       = D.banners.filter(b => b.active).length;
    const pendingContacts     = D.contacts.filter(c => c.active).length;
    const activeNewsletters   = D.newsletters.filter(n => n.active).length;

    // Order status breakdown
    const orderStatusMap = {};
    D.checkouts.forEach(o => {
        const s = o.orderStatus || "Unknown";
        orderStatusMap[s] = (orderStatusMap[s] || 0) + 1;
    });
    const orderStatusData = Object.entries(orderStatusMap).map(([name, count]) => ({ name, count }));

    // Revenue from delivered orders
    const totalRevenue = D.checkouts
        .filter(o => o.paymentStatus === "Done")
        .reduce((sum, o) => sum + Number(o.total || 0), 0);

    // Payment mode split
    const codOrders     = D.checkouts.filter(o => o.paymentMode === "COD").length;
    const onlineOrders  = D.checkouts.filter(o => o.paymentMode === "Net Banking").length;
    const paymentModeData = [
        { name: "COD",         value: codOrders,    color: "#F7C35F" },
        { name: "Net Banking", value: onlineOrders, color: "#4F8EF7" },
    ].filter(d => d.value > 0);

    // Payment status split
    const payStatusMap = {};
    D.checkouts.forEach(o => {
        const s = o.paymentStatus || "Unknown";
        payStatusMap[s] = (payStatusMap[s] || 0) + 1;
    });
    const payStatusColors = { Done: "#38EF91", Pending: "#F7C35F", Failed: "#F75F5F", Refunded: "#A78BFA" };
    const payStatusData = Object.entries(payStatusMap).map(([name, count]) => ({
        name, count, color: payStatusColors[name] || "#8896B3",
    }));

    // Books by category (use populated category name or fallback)
    const bookCatMap = {};
    D.books.forEach(b => {
        const cat = (typeof b.category === "object" ? b.category?.name : b.category) || "Uncategorized";
        bookCatMap[cat] = (bookCatMap[cat] || 0) + 1;
    });
    const bookCatData = Object.entries(bookCatMap).map(([name, count]) => ({ name, count }));

    // Top rated books
    const topRatedBooks = [...D.books]
        .filter(b => b.rating > 0)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 5);

    const PIE_COLORS = ["#4F8EF7", "#38EFC3", "#A78BFA", "#F7C35F", "#38EF91", "#F97316", "#F75F5F", "#EC4899"];
    const axis = { fontSize: 11, fill: "#8896B3" };
    const grid = { stroke: "rgba(255,255,255,0.05)" };

    // ── Stat cards ─────────────────────────────────────────────────────────────
    const statCards = [
        { label: "Total Books",    value: D.books.length,         icon: "fa-book",         accent: "#4F8EF7", link: "/book"         },
        { label: "Categories",     value: D.categories.length,    icon: "fa-layer-group",  accent: "#38EFC3", link: "/category"     },
        { label: "Subcategories",  value: D.subcategories.length, icon: "fa-tags",         accent: "#A78BFA", link: "/subcategory"  },
        { label: "Publishers",     value: D.publishers.length,    icon: "fa-building",     accent: "#F7C35F", link: "/publisher"    },
        { label: "Total Orders",   value: D.checkouts.length,     icon: "fa-shopping-bag", accent: "#38EF91", link: "/checkout"     },
        { label: "Testimonials",   value: D.testimonials.length,  icon: "fa-star",         accent: "#EC4899", link: "/testimonial"  },
        { label: "Newsletters",    value: activeNewsletters,      icon: "fa-envelope",     accent: "#F97316", link: "/newsletter"   },
        { label: "Banners",        value: D.banners.length,       icon: "fa-image",        accent: "#14B8A6", link: "/banner"       },
    ];

    // ── Alert cards ────────────────────────────────────────────────────────────
    const alertCards = [
        { label: "New Messages",         value: pendingContacts,     icon: "fa-envelope",      color: "#4F8EF7" },
        { label: "Pending Testimonials", value: pendingTestimonials, icon: "fa-clock",         color: "#F7C35F" },
        { label: "Out of Stock Books",   value: outOfStockBooks,     icon: "fa-exclamation-triangle", color: "#F75F5F" },
        { label: "Active Banners",       value: activeBanners,       icon: "fa-image",         color: "#38EF91" },
    ];

    return (
        <>
        <style>{`
            .hm-root {
                padding: 28px 24px 80px; max-width: 1280px;
                margin: 0 auto; width: 100%;
                opacity: 0; transform: translateY(14px);
                transition: opacity .45s ease, transform .45s ease;
            }
            .hm-root.hm-loaded { opacity: 1; transform: none; }
            .hm-sample-banner {
                display: flex; align-items: center; gap: 10px;
                background: rgba(247,195,95,0.1);
                border: 1px solid rgba(247,195,95,0.3);
                border-radius: 10px; padding: 10px 16px;
                font-size: 13px; color: #F7C35F; margin-bottom: 20px;
                animation: hmFadeUp .4s ease;
            }
            @keyframes hmFadeUp {
                from { opacity:0; transform:translateY(8px); }
                to   { opacity:1; transform:none; }
            }
            .hm-header {
                display: flex; align-items: flex-start;
                justify-content: space-between; flex-wrap: wrap;
                gap: 12px; margin-bottom: 22px;
            }
            .hm-title {
                font-family: 'Syne', sans-serif;
                font-size: 24px; font-weight: 800;
                color: var(--text-primary); letter-spacing: -.02em; margin: 0;
            }
            .hm-subtitle { font-size: 13px; color: var(--text-secondary); margin: 3px 0 0; }
            .hm-date {
                font-size: 12.5px; color: var(--text-muted);
                background: var(--bg-card); border: 1px solid var(--border);
                border-radius: 8px; padding: 7px 14px;
                display: flex; align-items: center; gap: 7px;
            }

            /* ── Overview banner ── */
            .hm-rev-banner {
                background: linear-gradient(135deg, #0d1d46 0%, #0a1530 60%, #061020 100%);
                border: 1px solid var(--border-accent);
                border-radius: 16px; padding: 22px 28px;
                margin-bottom: 20px; position: relative; overflow: hidden;
            }
            .hm-rev-banner::before {
                content:''; position:absolute; inset:0;
                background: radial-gradient(ellipse at 10% 50%, rgba(79,142,247,.1) 0%, transparent 60%),
                            radial-gradient(ellipse at 90% 50%, rgba(56,239,195,.07) 0%, transparent 60%);
            }
            .hm-rev-inner {
                display: flex; align-items: center;
                justify-content: space-between; flex-wrap: wrap; gap: 16px; position: relative;
            }
            .hm-rev-label {
                font-size: 12px; text-transform: uppercase; letter-spacing: .08em;
                color: var(--text-secondary); margin-bottom: 6px; font-weight: 700;
            }
            .hm-rev-value {
                font-family: 'Syne', sans-serif;
                font-size: 34px; font-weight: 800;
                color: var(--text-primary); letter-spacing: -.02em;
            }
            .hm-rev-icon {
                width: 54px; height: 54px;
                background: linear-gradient(135deg, var(--accent), #3a7de0);
                border-radius: 14px;
                display: flex; align-items: center; justify-content: center;
                font-size: 22px; color: #fff;
                box-shadow: 0 8px 24px rgba(79,142,247,.4);
            }
            .hm-rev-sub {
                display: flex; align-items: center; flex-wrap: wrap; gap: 20px;
                margin-top: 14px; padding-top: 14px;
                border-top: 1px solid rgba(255,255,255,.06); position: relative;
            }
            .hm-rev-sub span { font-size: 12.5px; color: var(--text-secondary); display: flex; align-items: center; gap: 6px; }
            .hm-rev-sub span i { color: var(--accent); }

            /* ── Stat grid ── */
            .hm-stat-grid {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 14px; margin-bottom: 14px;
            }
            .hm-stat-card {
                background: var(--bg-surface); border: 1px solid var(--border);
                border-radius: 14px; padding: 16px 18px;
                display: flex; align-items: center; gap: 14px;
                text-decoration: none; transition: var(--transition);
                animation: hmFadeUp .4s ease both;
                position: relative; overflow: hidden;
            }
            .hm-stat-card::after {
                content:''; position:absolute; bottom:0; left:0; right:0; height: 2px;
                background: var(--card-accent, var(--accent));
                transform: scaleX(0); transform-origin: left; transition: transform .3s ease;
            }
            .hm-stat-card:hover { background: var(--bg-hover); transform: translateY(-2px); }
            .hm-stat-card:hover::after { transform: scaleX(1); }
            .hm-stat-icon {
                width: 42px; height: 42px; border-radius: 11px;
                display: flex; align-items: center; justify-content: center;
                font-size: 16px; flex-shrink: 0;
            }
            .hm-stat-value {
                font-family: 'Syne', sans-serif; font-size: 24px; font-weight: 800;
                color: var(--text-primary); display: block; line-height: 1;
            }
            .hm-stat-label { font-size: 11.5px; color: var(--text-secondary); display: block; margin-top: 3px; font-weight: 600; }
            .hm-stat-arrow { margin-left: auto; color: var(--text-muted); font-size: 12px; }

            /* ── Alert grid ── */
            .hm-alert-grid {
                display: grid; grid-template-columns: repeat(4, 1fr);
                gap: 14px; margin-bottom: 20px;
            }
            .hm-alert-card {
                background: var(--bg-surface); border: 1px solid var(--border);
                border-radius: 12px; padding: 14px 16px;
                display: flex; align-items: center; gap: 12px;
                animation: hmFadeUp .4s ease both;
            }
            .hm-alert-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; }
            .hm-alert-lbl { font-size: 12px; color: var(--text-secondary); font-weight: 600; }

            /* ── Chart cards ── */
            .hm-card {
                background: var(--bg-surface); border: 1px solid var(--border);
                border-radius: 14px; padding: 20px; animation: hmFadeUp .45s ease both;
            }
            .hm-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
            .hm-card-title {
                font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700;
                color: var(--text-primary); margin: 0; display: flex; align-items: center; gap: 8px;
            }
            .hm-card-title i { color: var(--accent); font-size: 13px; }
            .hm-card-link { font-size: 12px; color: var(--accent); text-decoration: none; font-weight: 600; transition: color .2s; }
            .hm-card-link:hover { color: var(--accent-2); }
            .hm-empty { font-size: 13px; color: var(--text-muted); text-align: center; padding: 28px 0; font-style: italic; }

            /* ── Layouts ── */
            .hm-row-wide   { display: grid; grid-template-columns: 1.6fr 1fr; gap: 16px; margin-bottom: 16px; }
            .hm-row-three  { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; }
            .hm-row-two    { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
            .hm-row-bottom { display: grid; grid-template-columns: 1.4fr 1fr; gap: 16px; margin-bottom: 16px; }

            /* ── Tables ── */
            .hm-table-wrap { overflow-x: auto; margin: 0 -4px; padding: 0 4px; }
            .hm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
            .hm-table thead tr th {
                background: var(--bg-card); color: var(--text-muted); font-size: 10.5px;
                text-transform: uppercase; letter-spacing: .07em; font-weight: 700;
                padding: 10px 14px; border-bottom: 1px solid var(--border); white-space: nowrap;
            }
            .hm-table tbody tr { border-bottom: 1px solid var(--border); transition: background .15s; }
            .hm-table tbody tr:last-child { border-bottom: none; }
            .hm-table tbody tr:hover { background: var(--bg-hover); }
            .hm-table tbody td { padding: 11px 14px; vertical-align: middle; color: var(--text-secondary); white-space: nowrap; }
            .hm-table tbody tr:hover td { color: var(--text-primary); }

            /* ── Badges ── */
            .hm-badge {
                display: inline-block; padding: 3px 10px; border-radius: 20px;
                font-size: 11px; font-weight: 700;
                background: var(--bg-card); color: var(--text-muted); border: 1px solid var(--border);
            }
            .hm-badge--success { background:rgba(56,239,145,.12); color:#38EF91; border-color:rgba(56,239,145,.25); }
            .hm-badge--warn    { background:rgba(247,195,95,.12);  color:#F7C35F; border-color:rgba(247,195,95,.25); }
            .hm-badge--info    { background:rgba(79,142,247,.12);  color:#4F8EF7; border-color:rgba(79,142,247,.25); }
            .hm-badge--danger  { background:rgba(247,95,95,.12);   color:#F75F5F; border-color:rgba(247,95,95,.25);  }
            .hm-badge--purple  { background:rgba(167,139,250,.12); color:#A78BFA; border-color:rgba(167,139,250,.25); }

            /* ── Quick actions ── */
            .hm-quick-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 16px; }
            .hm-quick-btn {
                display: flex; align-items: center; gap: 10px;
                background: var(--bg-card); border: 1px solid var(--border);
                border-radius: 10px; padding: 10px 12px;
                color: var(--text-secondary); font-size: 12.5px; font-weight: 600;
                text-decoration: none; transition: var(--transition);
                border-left: 3px solid var(--q-color, var(--accent));
            }
            .hm-quick-btn:hover { background: var(--bg-hover); color: var(--text-primary); transform: translateX(2px); }
            .hm-quick-btn i { font-size: 13px; width: 16px; text-align: center; }

            /* ── Responsive ── */
            @media (max-width: 900px) {
                .hm-stat-grid  { grid-template-columns: repeat(2,1fr); }
                .hm-alert-grid { grid-template-columns: repeat(2,1fr); }
                .hm-row-wide   { grid-template-columns: 1fr; }
                .hm-row-three  { grid-template-columns: 1fr 1fr; }
                .hm-row-bottom { grid-template-columns: 1fr; }
                .hm-row-two    { grid-template-columns: 1fr; }
            }
            @media (max-width: 600px) {
                .hm-stat-grid  { grid-template-columns: repeat(2,1fr); }
                .hm-alert-grid { grid-template-columns: repeat(2,1fr); }
                .hm-row-three  { grid-template-columns: 1fr; }
                .hm-rev-value  { font-size: 26px; }
            }
        `}</style>

        <div className={`hm-root ${loaded ? "hm-loaded" : ""}`}>

            {usingSample && (
                <div className="hm-sample-banner">
                    <i className="fas fa-flask"></i>
                    <strong>Preview mode —</strong> showing sample data because the API returned no records.
                </div>
            )}

            {/* ── Header ── */}
            <div className="hm-header">
                <div>
                    <h1 className="hm-title p-2 bg-primary text-light">Dashboard</h1>
                    <p className="hm-subtitle">Welcome back, Admin — here's your bookstore at a glance.</p>
                </div>
                <span className="hm-date">
                    <i className="fas fa-calendar-alt"></i>
                    {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
            </div>

            {/* ── Overview banner ── */}
            <div className="hm-rev-banner">
                <div className="hm-rev-inner">
                    <div>
                        <p className="hm-rev-label">Total Revenue (Paid Orders)</p>
                        <p className="hm-rev-value">{currency(totalRevenue)}</p>
                    </div>
                    <div className="hm-rev-icon"><i className="fas fa-rupee-sign"></i></div>
                </div>
                <div className="hm-rev-sub">
                    <span><i className="fas fa-book"></i> Books: <strong>{D.books.length}</strong> ({featuredBooks} featured)</span>
                    <span><i className="fas fa-shopping-bag"></i> Orders: <strong>{D.checkouts.length}</strong></span>
                    <span><i className="fas fa-box-open"></i> Out of Stock: <strong>{outOfStockBooks}</strong></span>
                    <span><i className="fas fa-envelope-open"></i> Newsletter: <strong>{activeNewsletters}</strong> subs</span>
                    <span><i className="fas fa-star"></i> Approved Testimonials: <strong>{activeTestimonials}</strong></span>
                </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="hm-stat-grid">
                {statCards.map((c, i) => (
                    <Link to={c.link} key={i} className="hm-stat-card"
                        style={{ "--card-accent": c.accent, animationDelay: `${i * .05}s` }}>
                        <div className="hm-stat-icon" style={{ background: c.accent + "22", color: c.accent }}>
                            <i className={`fas ${c.icon}`}></i>
                        </div>
                        <div>
                            <span className="hm-stat-value">{c.value}</span>
                            <span className="hm-stat-label">{c.label}</span>
                        </div>
                        <div className="hm-stat-arrow"><i className="fas fa-arrow-right"></i></div>
                    </Link>
                ))}
            </div>

            {/* ── Alert cards ── */}
            <div className="hm-alert-grid">
                {alertCards.map((c, i) => (
                    <div key={i} className="hm-alert-card" style={{ animationDelay: `${.4 + i * .07}s` }}>
                        <i className={`fas ${c.icon}`} style={{ color: c.color, fontSize: 18 }}></i>
                        <div>
                            <div className="hm-alert-val" style={{ color: c.color }}>{c.value}</div>
                            <div className="hm-alert-lbl">{c.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* ── Order status chart + Payment mode pie ── */}
            <div className="hm-row-wide">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-shopping-bag"></i> Orders by Status</h2>
                        <Link to="/checkout" className="hm-card-link">View all</Link>
                    </div>
                    {orderStatusData.length === 0
                        ? <p className="hm-empty">No orders yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={orderStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 40 }} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" {...grid} />
                                <XAxis dataKey="name" tick={{ ...axis, fontSize: 9.5 }}
                                    axisLine={false} tickLine={false} angle={-20} textAnchor="end" interval={0} />
                                <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<DashTooltip />} />
                                <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                                    {orderStatusData.map((_, i) => (
                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-credit-card"></i> Payment Mode</h2>
                        <Link to="/checkout" className="hm-card-link">View all</Link>
                    </div>
                    {paymentModeData.length === 0
                        ? <p className="hm-empty">No orders yet.</p>
                        : <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={paymentModeData} dataKey="value" nameKey="name"
                                    cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                                    paddingAngle={3} strokeWidth={0}>
                                    {paymentModeData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={<DashTooltip />} />
                                <Legend iconType="circle" iconSize={8}
                                    formatter={v => <span style={{ fontSize: 11, color: "#8896B3" }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            {/* ── 3-col: books by category + payment status + testimonial status ── */}
            <div className="hm-row-three">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-layer-group"></i> Books by Category</h2>
                    </div>
                    {bookCatData.length === 0
                        ? <p className="hm-empty">No data yet.</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={bookCatData} dataKey="count" nameKey="name"
                                    cx="50%" cy="44%" outerRadius={68} paddingAngle={4} strokeWidth={0}>
                                    {bookCatData.map((e, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<DashTooltip />} />
                                <Legend iconType="circle" iconSize={8}
                                    formatter={v => <span style={{ fontSize: 10, color: "#8896B3" }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-receipt"></i> Payment Status</h2>
                    </div>
                    {payStatusData.length === 0
                        ? <p className="hm-empty">No orders yet.</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={payStatusData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={36}>
                                <CartesianGrid strokeDasharray="3 3" {...grid} />
                                <XAxis dataKey="name" tick={{ ...axis, fontSize: 10 }} axisLine={false} tickLine={false} />
                                <YAxis tick={axis} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip content={<DashTooltip />} />
                                <Bar dataKey="count" name="Orders" radius={[6, 6, 0, 0]}>
                                    {payStatusData.map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    }
                </div>
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-star"></i> Testimonials</h2>
                        <Link to="/testimonial" className="hm-card-link">View all</Link>
                    </div>
                    {D.testimonials.length === 0
                        ? <p className="hm-empty">No testimonials yet.</p>
                        : <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={[
                                        { name: "Approved", value: activeTestimonials,  color: "#38EF91" },
                                        { name: "Pending",  value: pendingTestimonials, color: "#F7C35F" },
                                    ].filter(d => d.value > 0)}
                                    dataKey="value" nameKey="name"
                                    cx="50%" cy="44%" innerRadius={46} outerRadius={68}
                                    paddingAngle={3} strokeWidth={0}>
                                    {[{ color: "#38EF91" }, { color: "#F7C35F" }].map((e, i) => <Cell key={i} fill={e.color} />)}
                                </Pie>
                                <Tooltip content={<DashTooltip />} />
                                <Legend iconType="circle" iconSize={8}
                                    formatter={v => <span style={{ fontSize: 10, color: "#8896B3" }}>{v}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    }
                </div>
            </div>

            {/* ── Top rated books + Recent messages ── */}
            <div className="hm-row-two">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-trophy"></i> Top Rated Books</h2>
                        <Link to="/book" className="hm-card-link">View all</Link>
                    </div>
                    {topRatedBooks.length === 0
                        ? <p className="hm-empty">No rated books yet.</p>
                        : <div className="hm-table-wrap">
                            <table className="hm-table">
                                <thead>
                                    <tr><th>#</th><th>Title</th><th>Rating</th><th>Stock</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {topRatedBooks.map((b, i) => (
                                        <tr key={i}>
                                            <td style={{ color: "var(--text-muted)", fontSize: 11 }}>#{i + 1}</td>
                                            <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{b.title || "—"}</td>
                                            <td>
                                                <span style={{ color: "#F7C35F", fontWeight: 700 }}>
                                                    ★ {b.rating?.toFixed(1) || "—"}
                                                </span>
                                            </td>
                                            <td style={{ color: (b.stock ?? 1) === 0 ? "#F75F5F" : "var(--text-secondary)" }}>
                                                {b.stock ?? "—"}
                                            </td>
                                            <td>
                                                <span className={`hm-badge ${b.active ? "hm-badge--success" : "hm-badge--danger"}`}>
                                                    {b.active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>

                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-envelope"></i> Recent Messages</h2>
                        <Link to="/contactus" className="hm-card-link">View all</Link>
                    </div>
                    {D.contacts.length === 0
                        ? <p className="hm-empty">No messages yet.</p>
                        : <div className="hm-table-wrap">
                            <table className="hm-table">
                                <thead><tr><th>Name</th><th>Subject</th><th>Status</th></tr></thead>
                                <tbody>
                                    {D.contacts.slice(0, 5).map((c, i) => (
                                        <tr key={i}>
                                            <td style={{ color: "var(--text-primary)", fontWeight: 600 }}>{c.name || "—"}</td>
                                            <td>{c.subject || "—"}</td>
                                            <td>
                                                <span className={`hm-badge ${c.active ? "hm-badge--warn" : "hm-badge--success"}`}>
                                                    {c.active ? "Unread" : "Read"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>
            </div>

            {/* ── Recent orders + Quick actions ── */}
            <div className="hm-row-bottom">
                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-list-alt"></i> Recent Orders</h2>
                        <Link to="/checkout" className="hm-card-link">View all</Link>
                    </div>
                    {D.checkouts.length === 0
                        ? <p className="hm-empty">No orders yet.</p>
                        : <div className="hm-table-wrap">
                            <table className="hm-table">
                                <thead>
                                    <tr><th>#</th><th>Order Status</th><th>Payment</th><th>Mode</th><th>Total</th></tr>
                                </thead>
                                <tbody>
                                    {D.checkouts.slice(0, 6).map((o, i) => {
                                        const statusBadge = {
                                            Delivered:        "hm-badge--success",
                                            Cancelled:        "hm-badge--danger",
                                            Ordered:          "hm-badge--info",
                                            Processing:       "hm-badge--warn",
                                            Shipped:          "hm-badge--purple",
                                            "Out For Delivery":"hm-badge--info",
                                        }[o.orderStatus] || "";
                                        const payBadge = {
                                            Done:     "hm-badge--success",
                                            Pending:  "hm-badge--warn",
                                            Failed:   "hm-badge--danger",
                                            Refunded: "hm-badge--purple",
                                        }[o.paymentStatus] || "";
                                        return (
                                            <tr key={i}>
                                                <td style={{ color: "var(--text-muted)", fontSize: 11 }}>#{i + 1}</td>
                                                <td><span className={`hm-badge ${statusBadge}`}>{o.orderStatus || "—"}</span></td>
                                                <td><span className={`hm-badge ${payBadge}`}>{o.paymentStatus || "—"}</span></td>
                                                <td style={{ color: "var(--text-secondary)" }}>{o.paymentMode || "—"}</td>
                                                <td style={{ color: "var(--text-primary)", fontWeight: 700 }}>{currency(o.total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    }
                </div>

                <div className="hm-card">
                    <div className="hm-card-header">
                        <h2 className="hm-card-title"><i className="fas fa-bolt"></i> Quick Actions</h2>
                    </div>

                    <div className="hm-quick-grid">
                        {[
                            { label: "Add Book",        icon: "fa-book",         link: "/book/create",        color: "#4F8EF7" },
                            { label: "Add Category",    icon: "fa-layer-group",  link: "/category/create",    color: "#38EFC3" },
                            { label: "Add Subcategory", icon: "fa-tags",         link: "/subcategory/create", color: "#A78BFA" },
                            { label: "Add Publisher",   icon: "fa-building",     link: "/publisher/create",   color: "#F7C35F" },
                            { label: "Add Banner",      icon: "fa-image",        link: "/banner/create",      color: "#38EF91" },
                            { label: "View Orders",     icon: "fa-shopping-bag", link: "/checkout",           color: "#F97316" },
                            { label: "View Messages",   icon: "fa-envelope",     link: "/contactus",          color: "#F75F5F" },
                            { label: "Testimonials",    icon: "fa-star",         link: "/testimonial",        color: "#EC4899" },
                        ].map((q, i) => (
                            <Link to={q.link} key={i} className="hm-quick-btn" style={{ "--q-color": q.color }}>
                                <i className={`fas ${q.icon}`} style={{ color: q.color }}></i>
                                <span>{q.label}</span>
                            </Link>
                        ))}
                    </div>

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 7 }}>
                                <i className="fas fa-envelope-open" style={{ color: "var(--accent)" }}></i> Newsletter Subscribers
                            </span>
                            <Link to="/newsletter" className="hm-card-link"><strong>{activeNewsletters}</strong> active</Link>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 7 }}>
                                <i className="fas fa-book" style={{ color: "#38EFC3" }}></i> Featured Books
                            </span>
                            <Link to="/book" className="hm-card-link"><strong>{featuredBooks}</strong> featured</Link>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontSize: 13, color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 7 }}>
                                <i className="fas fa-box-open" style={{ color: "#F75F5F" }}></i> Out of Stock
                            </span>
                            <Link to="/book" className="hm-card-link"><strong>{outOfStockBooks}</strong> books</Link>
                        </div>
                    </div>
                </div>
            </div>

        </div>
        </>
    );
}