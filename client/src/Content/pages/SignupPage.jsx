"use client"
import React, { useState } from 'react'
import HeroSection from '../Components/HeroSection'
import formValidator from '../FormValidator/formValidator'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [data, setData] = useState({ name: "", username: "", email: "", phone: "", password: "", cpassword: "" })
  const [errorMessage, setErrorMessage] = useState({
    name: "Full Name is required",
    username: "Username is required",
    email: "Email is required",
    phone: "Phone number is required",
    password: "Password is required"
  })
  const [show, setShow] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  function getInputData(e) {
    const { name, value } = e.target
    setErrorMessage(old => ({ ...old, [name]: formValidator(e) }))
    setData(old => ({ ...old, [name]: value }))
  }

  async function postData(e) {
    e.preventDefault()
    if (data.password !== data.cpassword) {
      setShow(true)
      setErrorMessage(old => ({ ...old, password: 'Passwords do not match' }))
      return
    }
    const error = Object.values(errorMessage).find(x => x !== "")
    if (error) { setShow(true); return }

    setLoading(true)
    try {
      let response = await fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/user`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: data.name, username: data.username, email: data.email, phone: data.phone, password: data.password, role: "Buyer", active: true })
      })
      response = await response.json()
      if (response.result === "Done") router.push("/login")
      else {
        setShow(true)
        setErrorMessage(old => ({ ...old, username: response.reason?.username ?? "", email: response.reason?.email ?? "" }))
      }
    } catch { alert("Internal Server Error") }
    finally { setLoading(false) }
  }

  const fields = [
    { label: "Full Name", name: "name", type: "text", placeholder: "Jane Austen", half: true },
    { label: "Username", name: "username", type: "text", placeholder: "jane_austen", half: true },
    { label: "Email Address", name: "email", type: "email", placeholder: "jane@example.com", half: true },
    { label: "Phone Number", name: "phone", type: "number", placeholder: "+91 98765 43210", half: true },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

        .sp-page {
          min-height: 100vh;
          background: #F4EDE4;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          position: relative;
          overflow: hidden;
          font-family: 'DM Sans', sans-serif;
        }

        .sp-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(107,39,55,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(107,39,55,0.04) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .sp-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 640px;
          background: #FDFAF5;
          border-radius: 4px;
          overflow: hidden;
          box-shadow: 0 24px 80px rgba(26,18,8,0.12);
        }

        .sp-card-head {
          background: #6B2737;
          padding: 32px 40px 28px;
          position: relative;
          overflow: hidden;
        }

        .sp-card-head::after {
          content: '❧';
          position: absolute;
          right: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 5rem;
          color: rgba(253,250,245,0.07);
          pointer-events: none;
        }

        .sp-eyebrow {
          font-size: 0.68rem;
          font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #C8922A;
          margin-bottom: 8px;
        }

        .sp-title {
          font-family: 'Cormorant Garamond', Georgia, serif;
          font-size: 2rem;
          font-weight: 600;
          color: #FDFAF5;
          margin: 0;
          line-height: 1.15;
        }

        .sp-title em { font-style: italic; color: #E0C88A; }

        .sp-body {
          padding: 36px 40px 40px;
        }

        .sp-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .sp-field {
          margin-bottom: 20px;
        }

        .sp-label {
          display: block;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(26,18,8,0.5);
          margin-bottom: 6px;
        }

        .sp-input-wrap {
          position: relative;
        }

        .sp-input {
          width: 100%;
          padding: 12px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.9rem;
          color: #1A1208;
          background: #F4EDE4;
          border: 1.5px solid rgba(107,39,55,0.15);
          border-radius: 3px;
          outline: none;
          transition: border-color 0.2s ease, background 0.2s ease;
          -moz-appearance: textfield;
        }

        .sp-input:focus {
          border-color: #6B2737;
          background: #FDFAF5;
        }

        .sp-input.error {
          border-color: #c0392b;
          background: #fff8f8;
        }

        .sp-input::placeholder { color: rgba(26,18,8,0.3); }

        .sp-input::-webkit-outer-spin-button,
        .sp-input::-webkit-inner-spin-button { -webkit-appearance: none; }

        .sp-error {
          font-size: 0.72rem;
          color: #c0392b;
          margin-top: 5px;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .sp-eye {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          border: none;
          background: transparent;
          cursor: pointer;
          color: rgba(26,18,8,0.35);
          padding: 4px;
          transition: color 0.2s;
          font-size: 0.9rem;
        }
        .sp-eye:hover { color: #6B2737; }

        .sp-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
        }

        .sp-divider-line {
          flex: 1;
          height: 1px;
          background: rgba(107,39,55,0.12);
        }

        .sp-divider-text {
          font-size: 0.72rem;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(26,18,8,0.4);
        }

        .sp-submit {
          width: 100%;
          padding: 14px;
          background: #6B2737;
          color: #FDFAF5;
          border: none;
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s ease, transform 0.2s ease;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sp-submit:hover:not(:disabled) {
          background: #C8922A;
          color: #1A1208;
          transform: translateY(-1px);
        }

        .sp-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        .sp-social {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .sp-social-btn {
          padding: 11px;
          background: transparent;
          border: 1.5px solid rgba(107,39,55,0.2);
          border-radius: 3px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.8rem;
          color: rgba(26,18,8,0.7);
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .sp-social-btn:hover {
          border-color: #6B2737;
          color: #6B2737;
          background: rgba(107,39,55,0.04);
        }

        .sp-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(107,39,55,0.1);
        }

        .sp-footer a {
          font-size: 0.8rem;
          color: #6B2737;
          text-decoration: none;
          transition: color 0.2s;
        }

        .sp-footer a:hover { color: #C8922A; }

        @media (max-width: 600px) {
          .sp-row { grid-template-columns: 1fr; }
          .sp-card-head { padding: 24px 24px 20px; }
          .sp-body { padding: 24px 24px 28px; }
        }
      `}</style>

      <div className="sp-page">
        <div className="sp-card">
          <div className="sp-card-head">
            <p className="sp-eyebrow">Join ShopKaro</p>
            <h1 className="sp-title">Create Your <em>Account</em></h1>
          </div>

          <div className="sp-body">
            <form onSubmit={postData} noValidate>
              <div className="sp-row">
                {fields.map(({ label, name, type, placeholder }) => (
                  <div className="sp-field" key={name}>
                    <label className="sp-label">{label}</label>
                    <div className="sp-input-wrap">
                      <input
                        type={type}
                        name={name}
                        placeholder={placeholder}
                        onChange={getInputData}
                        className={`sp-input${show && errorMessage[name] ? " error" : ""}`}
                      />
                    </div>
                    {show && errorMessage[name] && (
                      <p className="sp-error"><i className="fas fa-exclamation-circle" />{errorMessage[name]}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* Password row */}
              <div className="sp-row">
                <div className="sp-field">
                  <label className="sp-label">Password</label>
                  <div className="sp-input-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Min. 8 characters"
                      onChange={getInputData}
                      className={`sp-input${show && errorMessage.password ? " error" : ""}`}
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" className="sp-eye" onClick={() => setShowPassword(v => !v)}>
                      <i className={`fas fa-${showPassword ? "eye-slash" : "eye"}`} />
                    </button>
                  </div>
                  {show && errorMessage.password && (
                    <p className="sp-error"><i className="fas fa-exclamation-circle" />{errorMessage.password}</p>
                  )}
                </div>

                <div className="sp-field">
                  <label className="sp-label">Confirm Password</label>
                  <div className="sp-input-wrap">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="cpassword"
                      placeholder="Repeat password"
                      onChange={getInputData}
                      className="sp-input"
                      style={{ paddingRight: 40 }}
                    />
                    <button type="button" className="sp-eye" onClick={() => setShowConfirmPassword(v => !v)}>
                      <i className={`fas fa-${showConfirmPassword ? "eye-slash" : "eye"}`} />
                    </button>
                  </div>
                </div>
              </div>

              <button type="submit" className="sp-submit" disabled={loading}>
                {loading ? <><i className="fas fa-circle-notch fa-spin" /> Creating…</> : "Create Account →"}
              </button>

              <div className="sp-divider">
                <span className="sp-divider-line" />
                <span className="sp-divider-text">or continue with</span>
                <span className="sp-divider-line" />
              </div>

              <div className="sp-social">
                <button type="button" className="sp-social-btn">
                  <i className="fab fa-google" /> Google
                </button>
                <button type="button" className="sp-social-btn">
                  <i className="fab fa-facebook-f" /> Facebook
                </button>
              </div>

              <div className="sp-footer">
                <Link href="#">Forgot Password?</Link>
                <Link href="/login">Already a member? Sign In →</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}