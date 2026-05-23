"use client"
import React, { useEffect, useState } from 'react'
import HeroSection from '../Components/HeroSection'
import formValidator from '../FormValidator/formValidator'
import imageValidator from '../FormValidator/imageValidator'
import { useRouter } from 'next/navigation'

export default function UpdateProfilePage() {
    const router = useRouter()
    const [data, setData]               = useState({ name: "", phone: "", address: "", city: "", state: "", pin: "", pic: "" })
    const [errorMessage, setErrorMessage] = useState({ name: "", phone: "", pic: "" })
    const [show, setShow]               = useState(false)
    const [preview, setPreview]         = useState(null)
    const [saving, setSaving]           = useState(false)

    function getInputData(e) {
        const name  = e.target.name
        const value = e.target.files ? e.target.files[0] : e.target.value
        if (name !== "active") {
            setErrorMessage(old => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e)
            }))
        }
        if (e.target.files?.[0]) {
            setPreview(URL.createObjectURL(e.target.files[0]))
        }
        setData(old => ({ ...old, [name]: value }))
    }

    async function postData(e) {
        e.preventDefault()
        const error = Object.values(errorMessage).find(x => x !== "")
        if (error) { setShow(true); return }

        setSaving(true)
        try {
            const formData = new FormData()
            formData.append("name",    data.name)
            formData.append("phone",   data.phone)
            formData.append("address", data.address)
            formData.append("pin",     data.pin)
            formData.append("city",    data.city)
            formData.append("state",   data.state)
            // Only send pic when user actually chose a new file.
            // Sending the existing URL string causes multer to crash (500).
            if (data.pic instanceof File) {
                formData.append("pic", data.pic)
            }

            let response = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER}/api/user/${localStorage.getItem("userid")}`,
                { method: "PUT", headers: { authorization: localStorage.getItem("token") }, body: formData }
            )
            response = await response.json()
            if (response.result === "Done") router.push("/profile")
            else alert("Something Went Wrong")
        } catch {
            alert("Internal Server Error")
            console.log(error)

        } finally {
            setSaving(false)
        }
    }

    useEffect(() => {
        (async () => {
            try {
                let response = await fetch(
                    `${process.env.NEXT_PUBLIC_SERVER}/api/user/${localStorage.getItem("userid")}`,
                    { method: "GET", headers: { "content-type": "application/json", authorization: localStorage.getItem("token") } }
                )
                response = await response.json()
                if (response.result === "Done") setData(response.data)
            } catch { alert("Internal Server Error") }
        })()
    }, [])

    const Field = ({ label, children, error }) => (
        <div style={styles.fieldGroup}>
            <label style={styles.label}>{label}</label>
            {children}
            {show && error && (
                <p style={styles.errorText}>
                    <i className="fa fa-exclamation-circle" style={{ marginRight: 5 }} />{error}
                </p>
            )}
        </div>
    )

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Lato:wght@400;600;700&display=swap');
                .upf-page-wrapper{min-height:70vh;background:linear-gradient(135deg,#F7F0E6 0%,#EDE3D4 100%);display:flex;align-items:flex-start;justify-content:center;padding:40px 16px 60px;}
                .upf-card{background:#FDFAF5;border-radius:16px;box-shadow:0 8px 40px rgba(26,18,8,0.12);padding:36px 40px;width:100%;max-width:680px;border:1px solid #E8D5B0;}
                .upf-two-col{display:grid;grid-template-columns:1fr 1fr;gap:16px;}
                .upf-input{width:100%;padding:10px 13px 10px 36px;font-family:'Lato',sans-serif;font-size:14px;border-radius:8px;outline:none;background:#FDFAF5;transition:border-color 0.2s;border:2px solid #E8D5B0;box-sizing:border-box;}
                .upf-input:focus{border-color:#C8922A;}
                .upf-input.error{border:2px solid #c0392b;background:#fff5f5;}
                .upf-textarea{padding-top:12px;resize:vertical;min-height:80px;}
                .upf-file-label{display:flex;align-items:center;padding:10px 14px;background:#F7F0E6;border:2px dashed #C8922A;border-radius:8px;cursor:pointer;font-family:'Lato',sans-serif;font-size:13px;color:#6B2737;font-weight:600;transition:background 0.2s;word-break:break-all;}
                .upf-file-label:hover{background:#ede3d4;}
                .upf-submit-btn{width:100%;padding:13px;background:#6B2737;color:#FDFAF5;border:none;border-radius:8px;font-family:'Lato',sans-serif;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;cursor:pointer;box-shadow:0 4px 16px rgba(107,39,55,0.25);margin-top:8px;display:flex;align-items:center;justify-content:center;transition:all 0.3s;}
                .upf-submit-btn:hover:not(:disabled){background:#8a3046;box-shadow:0 6px 20px rgba(107,39,55,0.38);transform:translateY(-1px);}
                .upf-submit-btn:disabled{background:#8C7B6B;cursor:not-allowed;box-shadow:none;}
                @media(max-width:768px){.upf-card{padding:28px 24px;border-radius:12px;}.upf-two-col{gap:12px;}}
                @media(max-width:520px){
                    .upf-page-wrapper{padding:20px 10px 40px;}
                    .upf-card{padding:22px 16px;border-radius:10px;box-shadow:0 4px 20px rgba(26,18,8,0.10);}
                    .upf-two-col{grid-template-columns:1fr;gap:14px;}
                    .upf-input{font-size:16px;}
                    .upf-submit-btn{font-size:15px;padding:14px;}
                }
            `}</style>

            <HeroSection title="Update Profile" />

            <div className="upf-page-wrapper">
                <div className="upf-card">
                    {/* Avatar */}
                    <div style={styles.cardHeader}>
                        <div style={styles.avatarWrapper}>
                            {preview || data.pic
                                ? <img src={preview || data.pic} alt="Profile" style={styles.avatarImg} />
                                : <div style={styles.avatarPlaceholder}><i className="fa fa-user" style={{ fontSize: 32, color: '#8C7B6B' }} /></div>
                            }
                            <div style={styles.avatarEditDot}>
                                <i className="fa fa-camera" style={{ fontSize: 11, color: '#FDFAF5' }} />
                            </div>
                        </div>
                        <h4 style={styles.cardTitle}>Update Your Account</h4>
                        <p style={styles.cardSubtitle}>Keep your information accurate and up to date.</p>
                    </div>

                    <div style={styles.sectionDivider}><span style={styles.sectionLabel}>Personal Information</span></div>

                    <form onSubmit={postData} style={styles.form}>
                        <div className="upf-two-col">
                            <Field label="Full Name *" error={errorMessage.name}>
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-user" style={styles.inputIcon} />
                                    <input type="text" name="name" value={data.name} placeholder="Full Name" onChange={getInputData}
                                        className={`upf-input${show && errorMessage.name ? ' error' : ''}`} />
                                </div>
                            </Field>
                            <Field label="Phone *" error={errorMessage.phone}>
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-phone" style={styles.inputIcon} />
                                    <input type="number" name="phone" value={data.phone} placeholder="Phone Number" onChange={getInputData}
                                        className={`upf-input${show && errorMessage.phone ? ' error' : ''}`} />
                                </div>
                            </Field>
                        </div>

                        <Field label="Address">
                            <div style={styles.inputWrapper}>
                                <i className="fa fa-map-marker" style={{ ...styles.inputIcon, top: 16 }} />
                                <textarea name="address" value={data.address} placeholder="Street address..." onChange={getInputData}
                                    rows={3} className="upf-input upf-textarea" />
                            </div>
                        </Field>

                        <div style={styles.sectionDivider}><span style={styles.sectionLabel}>Location</span></div>

                        <div className="upf-two-col">
                            <Field label="City">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-building" style={styles.inputIcon} />
                                    <input type="text" name="city" value={data.city} placeholder="City" onChange={getInputData} className="upf-input" />
                                </div>
                            </Field>
                            <Field label="State">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-map" style={styles.inputIcon} />
                                    <input type="text" name="state" value={data.state} placeholder="State" onChange={getInputData} className="upf-input" />
                                </div>
                            </Field>
                        </div>

                        <div className="upf-two-col">
                            <Field label="Pin Code">
                                <div style={styles.inputWrapper}>
                                    <i className="fa fa-hashtag" style={styles.inputIcon} />
                                    <input type="number" name="pin" value={data.pin} placeholder="Pin Code" onChange={getInputData} className="upf-input" />
                                </div>
                            </Field>
                            <Field label="Profile Picture" error={errorMessage.pic}>
                                <label className="upf-file-label">
                                    <i className="fa fa-upload" style={{ marginRight: 8, color: '#6B2737', flexShrink: 0 }} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {data.pic instanceof File ? data.pic.name : "Choose an image"}
                                    </span>
                                    <input type="file" name="pic" onChange={getInputData} style={{ display: 'none' }} accept="image/*" />
                                </label>
                            </Field>
                        </div>

                        <button type="submit" disabled={saving} className="upf-submit-btn">
                            {saving
                                ? <><i className="fa fa-spinner fa-spin" style={{ marginRight: 8 }} />Saving…</>
                                : <><i className="fa fa-check" style={{ marginRight: 8 }} />Save Changes</>
                            }
                        </button>
                    </form>
                </div>
            </div>
        </>
    )
}

const styles = {
    cardHeader:       { textAlign: 'center', marginBottom: 32 },
    avatarWrapper:    { width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px', position: 'relative', border: '3px solid #C8922A' },
    avatarImg:        { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
    avatarPlaceholder:{ width: '100%', height: '100%', borderRadius: '50%', background: '#F7F0E6', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    avatarEditDot:    { position: 'absolute', bottom: 4, right: 4, width: 24, height: 24, borderRadius: '50%', background: '#6B2737', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FDFAF5' },
    cardTitle:        { fontFamily: "'Playfair Display', Georgia, serif", fontSize: 22, fontWeight: 700, color: '#1A1208', marginBottom: 6 },
    cardSubtitle:     { fontFamily: "'Lato', sans-serif", fontSize: 14, color: '#8C7B6B', margin: 0 },
    sectionDivider:   { display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0 16px' },
    sectionLabel:     { fontFamily: "'Lato', sans-serif", fontSize: 11, fontWeight: 700, color: '#6B2737', letterSpacing: '0.1em', textTransform: 'uppercase', background: '#F7F0E6', padding: '3px 12px', borderRadius: 20, border: '1px solid #E8D5B0' },
    form:             { display: 'flex', flexDirection: 'column', gap: 16 },
    fieldGroup:       { display: 'flex', flexDirection: 'column', gap: 5 },
    label:            { fontFamily: "'Lato', sans-serif", fontSize: 12, fontWeight: 700, color: '#1A1208', letterSpacing: '0.04em', textTransform: 'uppercase' },
    inputWrapper:     { position: 'relative' },
    inputIcon:        { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#8C7B6B', fontSize: 13, zIndex: 1, pointerEvents: 'none' },
    errorText:        { fontFamily: "'Lato', sans-serif", fontSize: 12, color: '#c0392b', margin: 0 },
}