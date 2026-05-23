"use client"
import React, { useState } from 'react'
import HeroSection from '../Components/HeroSection'
import { useRouter } from 'next/navigation'

export default function ForgetPasswordPage3() {
    let router = useRouter()
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    let [data, setData] = useState({ password: "", cpassword: "" })
    let [errorMessage, setErrorMessage] = useState("")

    function getStrength(pw) {
        if (!pw) return 0
        let score = 0
        if (pw.length >= 8) score++
        if (/[A-Z]/.test(pw)) score++
        if (/[0-9]/.test(pw)) score++
        if (/[^A-Za-z0-9]/.test(pw)) score++
        return score
    }

    function getInputData(e) {
        let { name, value } = e.target
        setErrorMessage("")
        setData(old => ({ ...old, [name]: value }))
    }

    async function postData(e) {
        e.preventDefault()
        if (data.password !== data.cpassword) {
            setErrorMessage("Passwords do not match.")
            return
        }
        if (data.password.length < 8) {
            setErrorMessage("Password must be at least 8 characters.")
            return
        }
        try {
            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/forgetPassword-3`, {
                method: "POST",
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ username: localStorage.getItem("reset-password-username"), password: data.password })
            })
            response = await response.json()
            if (response.result === "Done") {
                localStorage.removeItem("reset-password-username")
                router.push("/login")
            } else {
                setErrorMessage(response.reason || "Something went wrong.")
            }
        } catch (error) {
            alert("Internal Server Error")
        }
    }

    const strength = getStrength(data.password)
    const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"]
    const strengthColors = ["", "#c0392b", "#e67e22", "#C8922A", "#27ae60"]

    return (
        <>
            <HeroSection title="Reset Password" />

            <div style={styles.pageWrapper}>
                {/* Step indicator */}
                <div style={styles.stepRow}>
                    {["Identify", "Verify OTP", "New Password"].map((label, i) => (
                        <div key={i} style={styles.stepItem}>
                            <div style={{ ...styles.stepCircle, ...(i < 2 ? styles.stepDone : styles.stepActive) }}>
                                {i < 2 ? <i className="fa fa-check" style={{ fontSize: 12 }} /> : i + 1}
                            </div>
                            <span style={{ ...styles.stepLabel, ...(i === 2 ? styles.stepLabelActive : {}) }}>{label}</span>
                        </div>
                    ))}
                    <div style={styles.stepLine} />
                </div>

                <div style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div style={styles.iconBadge}>
                            <i className="fa fa-key" style={{ fontSize: 22, color: '#C8922A' }} />
                        </div>
                        <h4 style={styles.cardTitle}>Create New Password</h4>
                        <p style={styles.cardSubtitle}>Choose a strong password to protect your account.</p>
                    </div>

                    <form onSubmit={postData} style={styles.form}>
                        {/* Password field */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>New Password</label>
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-lock" style={styles.inputIcon} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={data.password}
                                    onChange={getInputData}
                                    placeholder="Enter new password"
                                    style={{ ...styles.input, ...(errorMessage ? styles.inputError : styles.inputNormal) }}
                                    required
                                />
                                <button type="button" style={styles.eyeBtn} onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`fa ${showPassword ? "fa-eye-slash" : "fa-eye"}`} />
                                </button>
                            </div>

                            {/* Strength meter */}
                            {data.password.length > 0 && (
                                <div style={styles.strengthWrapper}>
                                    <div style={styles.strengthBarRow}>
                                        {[1, 2, 3, 4].map(n => (
                                            <div key={n} style={{
                                                ...styles.strengthSegment,
                                                background: n <= strength ? strengthColors[strength] : '#E8D5B0'
                                            }} />
                                        ))}
                                    </div>
                                    <span style={{ ...styles.strengthLabel, color: strengthColors[strength] }}>
                                        {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div style={styles.fieldGroup}>
                            <label style={styles.label}>Confirm Password</label>
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-lock" style={styles.inputIcon} />
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    name="cpassword"
                                    value={data.cpassword}
                                    onChange={getInputData}
                                    placeholder="Confirm new password"
                                    style={{ ...styles.input, ...(errorMessage ? styles.inputError : styles.inputNormal) }}
                                    required
                                />
                                <button type="button" style={styles.eyeBtn} onClick={() => setShowConfirm(!showConfirm)}>
                                    <i className={`fa ${showConfirm ? "fa-eye-slash" : "fa-eye"}`} />
                                </button>
                            </div>
                            {/* Match indicator */}
                            {data.cpassword.length > 0 && (
                                <p style={{ ...styles.matchNote, color: data.password === data.cpassword ? '#27ae60' : '#c0392b' }}>
                                    <i className={`fa ${data.password === data.cpassword ? "fa-check-circle" : "fa-times-circle"}`} style={{ marginRight: 5 }} />
                                    {data.password === data.cpassword ? "Passwords match" : "Passwords do not match"}
                                </p>
                            )}
                        </div>

                        {errorMessage && (
                            <p style={styles.errorText}>
                                <i className="fa fa-exclamation-circle" style={{ marginRight: 6 }} />
                                {errorMessage}
                            </p>
                        )}

                        {/* Password hints */}
                        <div style={styles.hintBox}>
                            {[
                                ["fa-check-circle", data.password.length >= 8, "At least 8 characters"],
                                ["fa-check-circle", /[A-Z]/.test(data.password), "One uppercase letter"],
                                ["fa-check-circle", /[0-9]/.test(data.password), "One number"],
                            ].map(([icon, met, text], i) => (
                                <span key={i} style={{ ...styles.hint, color: met ? '#27ae60' : '#8C7B6B' }}>
                                    <i className={`fa ${icon}`} style={{ marginRight: 4 }} />{text}
                                </span>
                            ))}
                        </div>

                        <button type="submit" style={styles.submitBtn}
                            onMouseOver={e => Object.assign(e.currentTarget.style, styles.submitBtnHover)}
                            onMouseOut={e => Object.assign(e.currentTarget.style, styles.submitBtn)}>
                            <i className="fa fa-shield" style={{ marginRight: 8 }} />
                            Reset Password
                        </button>
                    </form>
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
        background: '#6B2737',
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
    cardHeader: { textAlign: 'center', marginBottom: 28 },
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
    form: { display: 'flex', flexDirection: 'column', gap: 20 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
    label: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1208',
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
    },
    inputWrapper: { position: 'relative' },
    inputIcon: { position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#8C7B6B', fontSize: 14 },
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
    },
    input: {
        width: '100%',
        padding: '11px 40px 11px 38px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        borderRadius: 8,
        outline: 'none',
        background: '#FDFAF5',
    },
    inputNormal: { border: '2px solid #E8D5B0' },
    inputError: { border: '2px solid #c0392b', background: '#fff5f5' },
    strengthWrapper: { display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 },
    strengthBarRow: { display: 'flex', gap: 4, flex: 1 },
    strengthSegment: { height: 4, flex: 1, borderRadius: 4, transition: 'background 0.3s' },
    strengthLabel: { fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, minWidth: 44 },
    matchNote: { fontFamily: "'Lato', sans-serif", fontSize: 12, marginTop: 4 },
    hintBox: {
        display: 'flex',
        gap: 12,
        flexWrap: 'wrap',
        background: '#F7F0E6',
        borderRadius: 8,
        padding: '10px 14px',
        border: '1px solid #E8D5B0',
    },
    hint: { fontFamily: "'Lato', sans-serif", fontSize: 12 },
    errorText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#c0392b',
        textAlign: 'center',
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
}