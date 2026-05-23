"use client"
import React, { useState } from "react"
import HeroSection from "../Components/HeroSection"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
    const navigate = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [data, setData] = useState({ username: "", password: "" })
    const [errorMessage, setErrorMessage] = useState("")
    const [loading, setLoading] = useState(false)

    function getInputData(e) {
        let { name, value } = e.target
        setErrorMessage("")
        setData(old => ({ ...old, [name]: value }))
    }

    async function postData(e) {
        e.preventDefault()
        setLoading(true)
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/login`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify(data),
            })
            response = await response.json()

            if (response.result === "Done" && response.data.active === false) {
                setErrorMessage("Your account is not active.")
            } else if (response.result === "Done" && response.data.role === "Buyer") {
                localStorage.setItem("login", true)
                localStorage.setItem("name", response.data.name)
                localStorage.setItem("userid", response.data._id)
                localStorage.setItem("role", response.data.role)
                localStorage.setItem("token", response.token)
                navigate.push("/profile")
            } else if (response.result === "Done" && (response.data.role === "Admin" || response.data.role === "Super Admin")) {
                setErrorMessage("Admin login is not permitted here.")
            } else {
                setErrorMessage("Invalid username or password.")
            }
        } catch (error) {
            setErrorMessage("Internal server error. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <HeroSection title="Sign In" />

            <div style={styles.pageWrapper}>
                <div style={styles.card}>

                    {/* Header */}
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBadge}>
                            <i className="fa fa-book" style={{ fontSize: 24, color: '#C8922A' }} />
                        </div>
                        <h4 style={styles.cardTitle}>Welcome Back</h4>
                        <p style={styles.cardSubtitle}>Sign in to your account to continue browsing.</p>
                    </div>

                    <form onSubmit={postData} style={styles.form}>

                        {/* Username */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Username / Email</label>
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-user" style={styles.inputIcon} />
                                <input
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    onChange={getInputData}
                                    placeholder="Enter your username or email"
                                    style={{ ...styles.input, ...(errorMessage ? styles.inputError : styles.inputNormal) }}
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={styles.fieldGroup}>
                            <div style={styles.labelRow}>
                                <label style={styles.label}>Password</label>
                                <Link href="/forgetPassword-1" style={styles.forgotLink}>Forgot password?</Link>
                            </div>
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-lock" style={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={getInputData}
                                    placeholder="Enter your password"
                                    style={{ ...styles.input, ...styles.inputWithEye, ...(errorMessage ? styles.inputError : styles.inputNormal) }}
                                    required
                                />
                                <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {errorMessage && (
                            <div style={styles.errorBox}>
                                <i className="fa fa-exclamation-circle" style={{ marginRight: 8, flexShrink: 0 }} />
                                {errorMessage}
                            </div>
                        )}

                        {/* Remember me */}
                        <label style={styles.checkboxLabel}>
                            <input type="checkbox" style={styles.checkbox} />
                            <span style={styles.checkboxText}>Remember me on this device</span>
                        </label>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.submitBtn, ...(loading ? styles.submitBtnDisabled : {}) }}
                            onMouseOver={e => !loading && Object.assign(e.currentTarget.style, styles.submitBtnHover)}
                            onMouseOut={e => !loading && Object.assign(e.currentTarget.style, styles.submitBtn)}
                        >
                            {loading
                                ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />Signing in…</>
                                : <><i className="fa fa-sign-in" style={{ marginRight: 8 }} />Sign In</>
                            }
                        </button>

                        {/* Divider */}
                        <div style={styles.dividerRow}>
                            <div style={styles.dividerLine} />
                            <span style={styles.dividerText}>or continue with</span>
                            <div style={styles.dividerLine} />
                        </div>

                        {/* Social buttons */}
                        <div style={styles.socialRow}>
                            <button
                                type="button"
                                style={styles.socialBtn}
                                onMouseOver={e => Object.assign(e.currentTarget.style, styles.socialBtnHover)}
                                onMouseOut={e => Object.assign(e.currentTarget.style, styles.socialBtn)}
                            >
                                <i className="fab fa-google" style={{ marginRight: 8, color: '#EA4335' }} />
                                Google
                            </button>
                            <button
                                type="button"
                                style={styles.socialBtn}
                                onMouseOver={e => Object.assign(e.currentTarget.style, styles.socialBtnHover)}
                                onMouseOut={e => Object.assign(e.currentTarget.style, styles.socialBtn)}
                            >
                                <i className="fab fa-facebook" style={{ marginRight: 8, color: '#1877F2' }} />
                                Facebook
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <p style={styles.footerNote}>
                        Don't have an account?{" "}
                        <Link href="/signup" style={styles.signupLink}>Create one free</Link>
                    </p>
                </div>
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
    cardHeader: {
        textAlign: 'center',
        marginBottom: 28,
    },
    iconBadge: {
        width: 60,
        height: 60,
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
        lineHeight: 1.6,
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
    },
    fieldGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
    },
    labelRow: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    label: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        color: '#1A1208',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    forgotLink: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: '#6B2737',
        fontWeight: 600,
        textDecoration: 'none',
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
        fontSize: 13,
        pointerEvents: 'none',
    },
    input: {
        width: '100%',
        padding: '11px 14px 11px 38px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        borderRadius: 8,
        outline: 'none',
        background: '#FDFAF5',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        color: '#1A1208',
    },
    inputWithEye: {
        paddingRight: 44,
    },
    inputNormal: {
        border: '2px solid #E8D5B0',
    },
    inputError: {
        border: '2px solid #c0392b',
        background: '#fff8f8',
    },
    eyeBtn: {
        position: 'absolute',
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: '#8C7B6B',
        fontSize: 15,
        padding: 4,
        lineHeight: 1,
    },
    errorBox: {
        display: 'flex',
        alignItems: 'flex-start',
        background: '#fff5f5',
        border: '1.5px solid #f1948a',
        borderRadius: 8,
        padding: '10px 14px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#c0392b',
        lineHeight: 1.5,
    },
    checkboxLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
    },
    checkbox: {
        width: 16,
        height: 16,
        accentColor: '#6B2737',
        cursor: 'pointer',
        flexShrink: 0,
    },
    checkboxText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#8C7B6B',
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
    },
    submitBtnHover: {
        background: '#8a3046',
        boxShadow: '0 6px 20px rgba(107,39,55,0.38)',
        transform: 'translateY(-1px)',
    },
    submitBtnDisabled: {
        background: '#8C7B6B',
        cursor: 'not-allowed',
        boxShadow: 'none',
        transform: 'none',
    },
    dividerRow: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        background: '#E8D5B0',
    },
    dividerText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        color: '#8C7B6B',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
    },
    socialRow: {
        display: 'flex',
        gap: 12,
    },
    socialBtn: {
        flex: 1,
        padding: '10px 14px',
        background: '#FDFAF5',
        border: '1.5px solid #E8D5B0',
        borderRadius: 8,
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 600,
        color: '#1A1208',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s',
    },
    socialBtnHover: {
        background: '#F7F0E6',
        borderColor: '#C8922A',
    },
    footerNote: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#8C7B6B',
        textAlign: 'center',
        marginTop: 24,
        marginBottom: 0,
    },
    signupLink: {
        color: '#6B2737',
        fontWeight: 700,
        textDecoration: 'none',
    },
}