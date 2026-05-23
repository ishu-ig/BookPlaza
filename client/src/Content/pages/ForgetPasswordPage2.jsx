"use client"
import React, { useState, useRef } from 'react'
import HeroSection from '../Components/HeroSection'
import { useRouter } from 'next/navigation'

export default function ForgetPasswordPage2() {
    let router = useRouter()
    // 6-digit OTP split into individual boxes
    let [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])
    let [errorMessage, setErrorMessage] = useState("")
    let inputRefs = useRef([])

    function handleDigitChange(e, index) {
        const val = e.target.value.replace(/\D/g, "").slice(-1)
        const updated = [...otpDigits]
        updated[index] = val
        setOtpDigits(updated)
        setErrorMessage("")
        if (val && index < 5) inputRefs.current[index + 1]?.focus()
    }

    function handleKeyDown(e, index) {
        if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    function handlePaste(e) {
        e.preventDefault()
        const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6)
        const updated = [...otpDigits]
        paste.split("").forEach((ch, i) => { updated[i] = ch })
        setOtpDigits(updated)
        inputRefs.current[Math.min(paste.length, 5)]?.focus()
    }

    async function postData(e) {
        e.preventDefault()
        const otp = otpDigits.join("")
        if (otp.length < 6) {
            setErrorMessage("Please enter the full 6-digit OTP.")
            return
        }
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/forgetPassword-2`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username: localStorage.getItem("reset-password-username"), otp })
            })
            response = await response.json()
            if (response.result === "Done") {
                router.push("/forgetPassword-3")
            } else {
                setErrorMessage(response.reason || "Invalid or expired OTP.")
            }
        } catch (error) {
            alert("Internal Server Error")
        }
    }

    return (
        <>
            <HeroSection title="Reset Password" />

            <div style={styles.pageWrapper}>
                {/* Step indicator */}
                <div style={styles.stepRow}>
                    {["Identify", "Verify OTP", "New Password"].map((label, i) => (
                        <div key={i} style={styles.stepItem}>
                            <div style={{ ...styles.stepCircle, ...(i === 0 ? styles.stepDone : i === 1 ? styles.stepActive : styles.stepInactive) }}>
                                {i === 0 ? <i className="fa fa-check" style={{ fontSize: 12 }} /> : i + 1}
                            </div>
                            <span style={{ ...styles.stepLabel, ...(i === 1 ? styles.stepLabelActive : {}) }}>{label}</span>
                        </div>
                    ))}
                    <div style={styles.stepLine} />
                </div>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBadge}>
                            <i className="fa fa-envelope-open" style={{ fontSize: 22, color: '#C8922A' }} />
                        </div>
                        <h4 style={styles.cardTitle}>Check Your Email</h4>
                        <p style={styles.cardSubtitle}>
                            We've sent a 6-digit OTP to your registered email. Enter it below to continue.
                        </p>
                    </div>

                    <form onSubmit={postData}>
                        {/* OTP digit boxes */}
                        <div style={styles.otpRow} onPaste={handlePaste}>
                            {otpDigits.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={el => inputRefs.current[i] = el}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={e => handleDigitChange(e, i)}
                                    onKeyDown={e => handleKeyDown(e, i)}
                                    style={{
                                        ...styles.otpBox,
                                        ...(errorMessage ? styles.otpBoxError : digit ? styles.otpBoxFilled : styles.otpBoxEmpty)
                                    }}
                                />
                            ))}
                        </div>

                        {errorMessage && (
                            <p style={styles.errorText}>
                                <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
                                {errorMessage}
                            </p>
                        )}

                        <button type="submit" style={styles.submitBtn}
                            onMouseOver={e => Object.assign(e.currentTarget.style, styles.submitBtnHover)}
                            onMouseOut={e => Object.assign(e.currentTarget.style, styles.submitBtn)}>
                            <i className="fa fa-check-circle" style={{ marginRight: 8 }} />
                            Verify OTP
                        </button>
                    </form>

                    <p style={styles.footerNote}>
                        Didn't receive it?{" "}
                        <a href="/forgetPassword-1" style={styles.link}>Resend OTP</a>
                    </p>
                </div>
            </div>
        </>
    )
}

const styles = {
    pageWrapper: {
        minHeight: '70vh',
        background: 'linear-gradient(135deg, #F7F0E6 0%, #EDE3D4 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 16px',
    },
    stepRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 0,
        marginBottom: 40,
        position: 'relative',
        width: '100%',
        maxWidth: 420,
        justifyContent: 'space-between',
    },
    stepLine: {
        position: 'absolute',
        top: 16,
        left: '10%',
        width: '80%',
        height: 2,
        background: 'linear-gradient(to right, #6B2737 35%, #E8D5B0 35%)',
        zIndex: 0,
    },
    stepItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 1 },
    stepCircle: {
        width: 32,
        height: 32,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 700,
    },
    stepDone: { background: '#6B2737', color: '#FDFAF5' },
    stepActive: { background: '#6B2737', color: '#FDFAF5', boxShadow: '0 0 0 4px rgba(107,39,55,0.15)' },
    stepInactive: { background: '#E8D5B0', color: '#8C7B6B' },
    stepLabel: { fontSize: 11, fontFamily: "'Lato', sans-serif", color: '#8C7B6B', letterSpacing: '0.04em', textTransform: 'uppercase' },
    stepLabelActive: { color: '#6B2737', fontWeight: 700 },
    card: {
        background: '#FDFAF5',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(26,18,8,0.12)',
        padding: '40px 36px',
        width: '100%',
        maxWidth: 440,
        border: '1px solid #E8D5B0',
    },
    cardHeader: { textAlign: 'center', marginBottom: 32 },
    iconBadge: {
        width: 56,
        height: 56,
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
        fontSize: 22,
        fontWeight: 700,
        color: '#1A1208',
        marginBottom: 8,
    },
    cardSubtitle: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        color: '#8C7B6B',
        lineHeight: 1.6,
        margin: 0,
    },
    otpRow: {
        display: 'flex',
        gap: 10,
        justifyContent: 'center',
        marginBottom: 16,
    },
    otpBox: {
        width: 50,
        height: 58,
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 700,
        fontFamily: "'Playfair Display', Georgia, serif",
        borderRadius: 10,
        outline: 'none',
        transition: 'all 0.2s',
    },
    otpBoxEmpty: {
        border: '2px solid #E8D5B0',
        background: '#FDFAF5',
        color: '#1A1208',
    },
    otpBoxFilled: {
        border: '2px solid #6B2737',
        background: '#F7F0E6',
        color: '#6B2737',
    },
    otpBoxError: {
        border: '2px solid #c0392b',
        background: '#fff5f5',
        color: '#c0392b',
    },
    errorText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#c0392b',
        textAlign: 'center',
        marginBottom: 16,
    },
    submitBtn: {
        width: '100%',
        padding: '13px',
        background: '#6B2737',
        color: '#FDFAF5',
        border: 'none',
        borderRadius: 8,
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        cursor: 'pointer',
        boxShadow: '0 4px 16px rgba(107,39,55,0.25)',
        marginTop: 4,
    },
    submitBtnHover: {
        background: '#8a3046',
        boxShadow: '0 6px 20px rgba(107,39,55,0.38)',
        transform: 'translateY(-1px)',
    },
    footerNote: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#8C7B6B',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 0,
    },
    link: { color: '#6B2737', fontWeight: 700, textDecoration: 'none' },
}