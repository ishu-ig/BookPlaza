"use client"
import React, { useEffect, useState } from 'react'
import HeroSection from '../Components/HeroSection'
import formValidator from '../FormValidator/formValidator'
import imageValidator from '../FormValidator/imageValidator'
import { useRouter } from 'next/navigation'

export default function UpdateProfilePage() {
    let router = useRouter()
    let [data, setData] = useState({ name: "", phone: "", address: "", city: "", state: "", pin: "", pic: "" })
    let [errorMessage, setErrorMessage] = useState({ name: "", phone: "", pic: "" })
    let [show, setShow] = useState(false)
    let [preview, setPreview] = useState(null)
    let [saving, setSaving] = useState(false)

    function getInputData(e) {
        let name = e.target.name
        let value = e.target.files ? e.target.files[0] : e.target.value

        if (name !== "active") {
            setErrorMessage(old => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e)
            }))
        }
        if (e.target.files && e.target.files[0]) {
            setPreview(URL.createObjectURL(e.target.files[0]))
        }
        setData(old => ({ ...old, [name]: value }))
    }

    async function postData(e) {
        e.preventDefault()
        let error = Object.values(errorMessage).find(x => x !== "")
        if (error) {
            setShow(true)
            return
        }
        setSaving(true)
        try {
            let formData = new FormData()
            formData.append("_id", data._id)
            formData.append("name", data.name)
            formData.append("phone", data.phone)
            formData.append("address", data.address)
            formData.append("pin", data.pin)
            formData.append("city", data.city)
            formData.append("state", data.state)
            formData.append("pic", data.pic)

            let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                method: "PUT",
                headers: { "authorization": localStorage.getItem("token") },
                body: formData
            })
            response = await response.json()
            if (response.result === "Done") router.push("/profile")
            else alert("Something Went Wrong")
        } catch (error) {
            alert("Internal Server Error")
        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user/${localStorage.getItem("userid")}`, {
                    method: "GET",
                    headers: { "content-type": "application/json", "authorization": localStorage.getItem("token") }
                })
                response = await response.json()
                if (response.result === "Done") setData(response.data)
            } catch (error) {
                alert("Internal Server Error")
            }
        })()
    }, [])

    const Field = ({ label, children, error }) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>{label}</label>
            {children}
            {show && error && <p style={styles.errorText}><i className="fa fa-exclamation-circle" style={{ marginRight: 5 }} />{error}</p>}
        </div>
    )

    return (
        <>
            <HeroSection title="Update Profile" />

            <div style={styles.pageWrapper}>
                <div style={styles.card}>
                    {/* Card header */}
                    <div style={styles.cardHeader}>
                        {/* Avatar preview */}
                        <div style={styles.avatarWrapper}>
                            {preview || data.pic ? (
                                <img
                                    src={preview || `${process.env.NEXT_PUBLIC_SERVER}/${data.pic}`}
                                    alt="Profile"
                                    style={styles.avatarImg}
                                />
                            ) : (
                                <div style={styles.avatarPlaceholder}>
                                    <i className="fa fa-user" style={{ fontSize: 32, color: '#8C7B6B' }} />
                                </div>
                            )}
                            <div style={styles.avatarEditDot}>
                                <i className="fa fa-camera" style={{ fontSize: 11, color: '#FDFAF5' }} />
                            </div>
                        </div>
                        <h4 style={styles.cardTitle}>Update Your Account</h4>
                        <p style={styles.cardSubtitle}>Keep your information accurate and up to date.</p>
                    </div>

                    <div style={styles.sectionDivider}>
                        <span style={styles.sectionLabel}>Personal Information</span>
                    </div>

                    <form onSubmit={postData} style={styles.form}>
                        <div style={styles.twoCol}>
                            <Field label="Full Name *" error={errorMessage.name}>
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-user" style={styles.inputIcon} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        placeholder="Full Name"
                                        onChange={getInputData}
                                        style={{ ...styles.input, ...(show && errorMessage.name ? styles.inputError : styles.inputNormal) }}
                                    />
                                </div>
                            </Field>
                            <Field label="Phone *" error={errorMessage.phone}>
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-phone" style={styles.inputIcon} />
                                    <input
                                        type="number"
                                        name="phone"
                                        value={data.phone}
                                        placeholder="Phone Number"
                                        onChange={getInputData}
                                        style={{ ...styles.input, ...(show && errorMessage.phone ? styles.inputError : styles.inputNormal) }}
                                    />
                                </div>
                            </Field>
                        </div>

                        <Field label="Address">
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-map-marker" style={{ ...styles.inputIcon, top: 16 }} />
                                <textarea
                                    name="address"
                                    value={data.address}
                                    placeholder="Street address..."
                                    onChange={getInputData}
                                    rows={3}
                                    style={{ ...styles.input, ...styles.textarea, ...styles.inputNormal }}
                                />
                            </div>
                        </Field>

                        <div style={styles.sectionDivider}>
                            <span style={styles.sectionLabel}>Location</span>
                        </div>

                        <div style={styles.twoCol}>
                            <Field label="City">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-building" style={styles.inputIcon} />
                                    <input type="text" name="city" value={data.city} placeholder="City" onChange={getInputData} style={{ ...styles.input, ...styles.inputNormal }} />
                                </div>
                            </Field>
                            <Field label="State">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-map" style={styles.inputIcon} />
                                    <input type="text" name="state" value={data.state} placeholder="State" onChange={getInputData} style={{ ...styles.input, ...styles.inputNormal }} />
                                </div>
                            </Field>
                        </div>

                        <div style={styles.twoCol}>
                            <Field label="Pin Code">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-hashtag" style={styles.inputIcon} />
                                    <input type="number" name="pin" value={data.pin} placeholder="Pin Code" onChange={getInputData} style={{ ...styles.input, ...styles.inputNormal }} />
                                </div>
                            </Field>
                            <Field label="Profile Picture" error={errorMessage.pic}>
                                <label style={styles.fileLabel}>
                                    <i className="fa fa-upload" style={{ marginRight: 8, color: '#6B2737' }} />
                                    {data.pic instanceof File ? data.pic.name : "Choose an image"}
                                    <input type="file" name="pic" onChange={getInputData} style={{ display: 'none' }} accept="image/*" />
                                </label>
                            </Field>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            style={{ ...styles.submitBtn, ...(saving ? styles.submitBtnDisabled : {}) }}
                            onMouseOver={e => !saving && Object.assign(e.currentTarget.style, styles.submitBtnHover)}
                            onMouseOut={e => !saving && Object.assign(e.currentTarget.style, styles.submitBtn)}
                        >
                            {saving ? (
                                <><i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />Saving…</>
                            ) : (
                                <><i className="fa fa-check" style={{ marginRight: 8 }} />Save Changes</>
                            )}
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
        alignItems: 'flex-start',
        justifyContent: 'center',
        padding: '40px 16px 60px',
    },
    card: {
        background: '#FDFAF5',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(26,18,8,0.12)',
        padding: '36px 40px',
        width: '100%',
        maxWidth: 680,
        border: '1px solid #E8D5B0',
    },
    cardHeader: { textAlign: 'center', marginBottom: 32 },
    avatarWrapper: {
        width: 88,
        height: 88,
        borderRadius: '50%',
        margin: '0 auto 16px',
        position: 'relative',
        border: '3px solid #C8922A',
    },
    avatarImg: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        objectFit: 'cover',
    },
    avatarPlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        background: '#F7F0E6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarEditDot: {
        position: 'absolute',
        bottom: 4,
        right: 4,
        width: 24,
        height: 24,
        borderRadius: '50%',
        background: '#6B2737',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '2px solid #FDFAF5',
    },
    cardTitle: {
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 22,
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
    sectionDivider: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        margin: '24px 0 16px',
    },
    sectionLabel: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 11,
        fontWeight: 700,
        color: '#6B2737',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        background: '#F7F0E6',
        padding: '3px 12px',
        borderRadius: 20,
        border: '1px solid #E8D5B0',
    },
    form: { display: 'flex', flexDirection: 'column', gap: 16 },
    twoCol: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: 5 },
    label: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        fontWeight: 700,
        color: '#1A1208',
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
    },
    inputWrapper: { position: 'relative' },
    inputIcon: {
        position: 'absolute',
        left: 13,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#8C7B6B',
        fontSize: 13,
    },
    input: {
        width: '100%',
        padding: '10px 13px 10px 36px',
        fontFamily: "'Lato', sans-serif",
        fontSize: 14,
        borderRadius: 8,
        outline: 'none',
        background: '#FDFAF5',
        transition: 'border-color 0.2s',
    },
    textarea: { paddingTop: 12, resize: 'vertical', minHeight: 80 },
    inputNormal: { border: '2px solid #E8D5B0' },
    inputError: { border: '2px solid #c0392b', background: '#fff5f5' },
    fileLabel: {
        display: 'flex',
        alignItems: 'center',
        padding: '10px 14px',
        background: '#F7F0E6',
        border: '2px dashed #C8922A',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: "'Lato', sans-serif",
        fontSize: 13,
        color: '#6B2737',
        fontWeight: 600,
        transition: 'background 0.2s',
    },
    errorText: {
        fontFamily: "'Lato', sans-serif",
        fontSize: 12,
        color: '#c0392b',
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
        marginTop: 8,
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
    submitBtnDisabled: { background: '#8C7B6B', cursor: 'not-allowed', boxShadow: 'none' },
}