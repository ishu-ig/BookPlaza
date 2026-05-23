"use client"
import React, { useEffect, useState } from "react"
import { useRazorpay } from "react-razorpay"
import { useDispatch, useSelector } from "react-redux"
import { getCheckout } from "../Redux/ActionCreartors/CheckoutActionCreators"
import HeroSection from "../Components/HeroSection"
import { useParams, useRouter } from "next/navigation"

export default function Payment() {
    const [checkout, setCheckout] = useState({})
    const [loading, setLoading] = useState(false)

    const { Razorpay } = useRazorpay()
    const router = useRouter()
    const { id } = useParams()
    const dispatch = useDispatch()
    const CheckoutStateData = useSelector((state) => state.CheckoutStateData)

    async function getData() {
        dispatch(getCheckout())
        if (CheckoutStateData.length) {
            const result = id === "-1"
                ? CheckoutStateData[0]
                : CheckoutStateData.find((item) => item._id === id)   // FIX: was item.id
            setCheckout(result)
        }
    }

    useEffect(() => { getData() }, [CheckoutStateData.length])

    const initPayment = (data) => {
        const options = {
            key: "rzp_test_hPWsSLPsp2DADQ",
            amount: data.amount,
            currency: "INR",
            order_id: data.id,              // FIX: was orderid (wrong key, Razorpay requires order_id)
            prefill: {
                name: checkout?.user?.name,
                email: checkout?.user?.email,
                contact: checkout?.user?.phone,
            },
            handler: async (response) => {
                try {
                    let res = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/checkout/verify`, {
                        method: "post",
                        headers: {
                            "content-type": "application/json",
                            "authorization": localStorage.getItem("token")
                        },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,  // FIX: was razorpay_paymentid
                            checkid: checkout._id                               // FIX: was checkout.id
                        })
                    })
                    res = await res.json()
                    if (res.result === "Done") {
                        dispatch(getCheckout())
                        router.push("/confirmation")
                    }
                } catch (error) {
                    console.log(error)
                } finally {
                    setLoading(false)
                }
            },
            theme: { color: "#6B2737" },
        }
        const rzp1 = new Razorpay(options)
        rzp1.open()
    }

    const handlePayment = async () => {
        setLoading(true)
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/checkout/order`, {
                method: "post",
                headers: { "Content-Type": "application/json", authorization: localStorage.getItem("token") },
                body: JSON.stringify({ amount: checkout.total })
            })
            response = await response.json()
            initPayment(response.data)
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }

    return (
        <>
            <HeroSection title="Online Payment" />

            <div style={styles.pageWrapper}>
                {checkout && (
                    <div style={styles.card}>
                        {/* Header */}
                        <div style={styles.cardHeader}>
                            <div style={styles.iconBadge}>
                                <i className="fa fa-credit-card" style={{ fontSize: 24, color: '#C8922A' }} />
                            </div>
                            <h4 style={styles.cardTitle}>Complete Your Order</h4>
                            <p style={styles.cardSubtitle}>Secure payment powered by Razorpay</p>
                        </div>

                        {/* Divider */}
                        <div style={styles.divider} />

                        {/* Order summary */}
                        <div style={styles.summaryBox}>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    <i className="fa fa-user" style={{ marginRight: 8, color: '#8C7B6B' }} />
                                    Customer
                                </span>
                                <span style={styles.summaryValue}>{checkout?.user?.name || "—"}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    <i className="fa fa-envelope" style={{ marginRight: 8, color: '#8C7B6B' }} />
                                    Email
                                </span>
                                <span style={styles.summaryValue}>{checkout?.user?.email || "—"}</span>
                            </div>
                            <div style={styles.summaryRow}>
                                <span style={styles.summaryLabel}>
                                    <i className="fa fa-phone" style={{ marginRight: 8, color: '#8C7B6B' }} />
                                    Phone
                                </span>
                                <span style={styles.summaryValue}>{checkout?.user?.phone || "—"}</span>
                            </div>
                        </div>

                        {/* Total */}
                        <div style={styles.totalBox}>
                            <span style={styles.totalLabel}>Order Total</span>
                            <span style={styles.totalAmount}>₹{checkout.total}</span>
                        </div>

                        {/* Security badges */}
                        <div style={styles.badgeRow}>
                            {[
                                ["fa-lock", "SSL Secured"],
                                ["fa-shield", "Safe & Encrypted"],
                                ["fa-check-circle", "Verified"],
                            ].map(([icon, text]) => (
                                <div key={text} style={styles.badge}>
                                    <i className={`fa ${icon}`} style={{ color: '#C8922A', marginRight: 5 }} />
                                    <span>{text}</span>
                                </div>
                            ))}
                        </div>

                        {/* Pay button */}
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            style={{ ...styles.payBtn, ...(loading ? styles.payBtnDisabled : {}) }}
                            onMouseOver={e => !loading && Object.assign(e.currentTarget.style, styles.payBtnHover)}
                            onMouseOut={e => !loading && Object.assign(e.currentTarget.style, styles.payBtn)}
                        >
                            {loading ? (
                                <>
                                    <i className="fa fa-spinner fa-spin" style={{ marginRight: 10 }} />
                                    Processing…
                                </>
                            ) : (
                                <>
                                    <i className="fa fa-lock" style={{ marginRight: 10 }} />
                                    Pay ₹{checkout.total} Securely
                                </>
                            )}
                        </button>

                        <p style={styles.disclaimer}>
                            By completing payment you agree to our{" "}
                            <a href="/terms" style={styles.link}>Terms & Conditions</a>.
                        </p>
                    </div>
                )}
            </div>
            <div style={{ height: 80 }} />
        </>
    )
}

const styles = {
    pageWrapper: {
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #F7F0E6 0%, #EDE3D4 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
    },
    card: {
        background: '#FDFAF5',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(26,18,8,0.12)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 440,
        border: '1px solid #E8D5B0',
    },
    cardHeader: { textAlign: 'center', marginBottom: 24 },
    iconBadge: {
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #F7F0E6, #E8D5B0)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 16px',
        border: '2px solid #C8922A',
    },
    cardTitle: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 24,
        fontWeight: 700,
        color: '#1A1208',
        marginBottom: 6,
    },
    cardSubtitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        color: '#8C7B6B',
        margin: 0,
    },
    divider: {
        height: 1,
        background: 'linear-gradient(to right, transparent, #E8D5B0, transparent)',
        margin: '20px 0',
    },
    summaryBox: {
        background: '#F7F0E6',
        borderRadius: 10,
        padding: '14px 18px',
        border: '1px solid #E8D5B0',
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
    },
    summaryRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#8C7B6B',
        fontWeight: 600,
    },
    summaryValue: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#1A1208',
        fontWeight: 700,
        maxWidth: '55%',
        textAlign: 'right',
        wordBreak: 'break-all',
    },
    totalBox: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #6B2737, #8a3046)',
        borderRadius: 10,
        padding: '16px 20px',
        marginBottom: 20,
    },
    totalLabel: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 16,
        color: '#E8D5B0',
        fontWeight: 600,
    },
    totalAmount: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 28,
        color: '#FDFAF5',
        fontWeight: 700,
    },
    badgeRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 24,
        flexWrap: 'wrap',
    },
    badge: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        color: '#8C7B6B',
        display: 'flex',
        alignItems: 'center',
        letterSpacing: '0.02em',
    },
    payBtn: {
        width: '100%',
        padding: '15px',
        background: '#6B2737',
        color: '#FDFAF5',
        border: 'none',
        borderRadius: 10,
        fontFamily: "'Lato', sans-serif",
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 6px 24px rgba(107,39,55,0.30)',
        transition: 'all 0.3s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    payBtnHover: {
        background: '#8a3046',
        boxShadow: '0 8px 28px rgba(107,39,55,0.42)',
        transform: 'translateY(-2px)',
    },
    payBtnDisabled: {
        background: '#8C7B6B',
        cursor: 'not-allowed',
        boxShadow: 'none',
    },
    disclaimer: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: '#8C7B6B',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 0,
    },
    link: { color: '#6B2737', fontWeight: 700, textDecoration: 'none' },
}