"use client"
import React, { useState } from 'react'
import HeroSection from '../Components/HeroSection'
import { useRouter } from 'next/navigation'

export default function ForgetPasswordPage1() {
    let router = useRouter()
    let [username, setUsername] = useState("")
    let [errorMessage, setErrorMessage] = useState("")

    function getInputData(e) {
        setUsername(e.target.value)
        setErrorMessage("")
    }

    async function postData(e) {
        e.preventDefault()
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/forgetPassword-1`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username })
            })
            response = await response.json()
            if (response.result === "Done") {
                localStorage.setItem("reset-password-username", username)
                router.push("/forgetPassword-2")
            } else {
                setErrorMessage("No account found with that username or email.")
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
                            <div style={{ ...styles.stepCircle, ...(i === 0 ? styles.stepActive : styles.stepInactive) }}>
                                {i + 1}
                            </div>
                            <span style={{ ...styles.stepLabel, ...(i === 0 ? styles.stepLabelActive : {}) }}>{label}</span>
                        </div>
                    ))}
                    <div style={styles.stepLine} />
                </div>

                <div style={styles.card}>
                    {/* Header */}
                    <div style={styles.cardHeader}>
                        <div style={styles.lockIcon}>
                            <i className="fa fa-lock" style={{ fontSize: 22, color: '#C8922A' }} />
                        </div>
                        <h4 style={styles.cardTitle}>Find Your Account</h4>
                        <p style={styles.cardSubtitle}>Enter your username or email and we'll send you a one-time password.</p>
                    </div>

                    <form onSubmit={postData} style={styles.form}>
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Username / Email</label>
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-user" style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="username"
                                    value={username}
                                    onChange={getInputData}
                                    placeholder="Enter your username or email"
                                    style={{
                                        ...styles.input,
                                        ...(errorMessage ? styles.inputError : styles.inputNormal)
                                    }}
                                    required
                                />
                            </div>
                            {errorMessage && (
                                <p style={styles.errorText}>
                                    <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
                                    {errorMessage}
                                </p>
                            )}
                        </div>

                        <button type="submit" style={styles.submitBtn}
                            onMouseOver={e => Object.assign(e.currentTarget.style, styles.submitBtnHover)}
                            onMouseOut={e => Object.assign(e.currentTarget.style, styles.submitBtn)}>
                            <i className="fa fa-paper-plane" style={{ marginRight: 8 }} />
                            Send OTP
                        </button>
                    </form>

                    <p style={styles.footerNote}>
                        Remembered your password?{" "}
                        <a href="/login" style={styles.link}>Sign in</a>
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
        background: '#E8D5B0',
        zIndex: 0,
    },
    stepItem: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        zIndex: 1,
    },
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
    stepActive: {
        background: '#6B2737',
        color: '#FDFAF5',
        boxShadow: '0 0 0 4px rgba(107,39,55,0.15)',
    },
    stepInactive: {
        background: '#E8D5B0',
        color: '#8C7B6B',
        border: '2px solid #E8D5B0',
    },
    stepLabel: {
        fontSize: 11,
        fontFamily: "'Lato', sans-serif",
        color: '#8C7B6B',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    stepLabelActive: {
        color: '#6B2737',
        fontWeight: 700,
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
    cardHeader: {
        textAlign: 'center',
        marginBottom: 28,
    },
    lockIcon: {
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
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    label: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1208',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
    },
    inputWrapper: {
        position: 'relative',
    },
    inputIcon: {
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#8C7B6B',
        fontSize: 14,
    },
    input: {
        width: '100%',
        padding: '11px 14px 11px 38px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        borderRadius: 8,
        outline: 'none',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        background: '#FDFAF5',
    },
    inputNormal: {
        border: '2px solid #E8D5B0',
    },
    inputError: {
        border: '2px solid #c0392b',
        background: '#fff5f5',
    },
    errorText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#c0392b',
        margin: '4px 0 0',
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
        transition: 'all 0.3s',
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
    link: {
        color: '#6B2737',
        fontWeight: 700,
        textDecoration: 'none',
    },
}