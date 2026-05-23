"use client"
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import formValidator from "../FormValidator/formValidator";
import { createContactUs } from "../Redux/ActionCreartors/ContactUsActionCreators";

const CONTACT_ITEMS = [
  {
    icon: "fa-solid fa-location-dot",
    label: "Our Address",
    value: "A-43 Sector-16, Noida",
    sub: "Uttar Pradesh, India",
    href: "https://www.google.com/maps?q=A-43+Sector-16+Noida",
    color: "#D97706",
    bg: "#FFFBEB",
    border: "#FDE68A",
  },
  {
    icon: "fa-solid fa-phone",
    label: "Call Us",
    value: "+012 3456 7890",
    sub: "Mon–Sat, 9am–6pm",
    href: "tel:+0123456789",
    color: "#059669",
    bg: "#ECFDF5",
    border: "#A7F3D0",
  },
  {
    icon: "fa-solid fa-envelope",
    label: "Email Us",
    value: "info@example.com",
    sub: "We reply within 24 hrs",
    href: "mailto:info@example.com",
    color: "#0284C7",
    bg: "#EFF6FF",
    border: "#BFDBFE",
  },
  {
    icon: "fa-brands fa-whatsapp",
    label: "WhatsApp",
    value: "+91-8218635347",
    sub: "Chat with us anytime",
    href: "https://wa.me/918218635347",
    color: "#16A34A",
    bg: "#F0FDF4",
    border: "#BBF7D0",
  },
];

const FIELDS = [
  { type: "text",   name: "name",    placeholder: "Your Name",         icon: "fa-solid fa-user" },
  { type: "email",  name: "email",   placeholder: "Your Email",         icon: "fa-solid fa-envelope" },
  { type: "number", name: "phone",   placeholder: "Your Phone Number",  icon: "fa-solid fa-phone" },
  { type: "text",   name: "subject", placeholder: "Subject",            icon: "fa-solid fa-tag" },
];

export default function ContactUs() {
  const [data, setData] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [errorMessage, setErrorMessage] = useState({
    name: "Name Field is Mandatory",
    email: "Email Field is Mandatory",
    phone: "Phone Field is Mandatory",
    subject: "Subject Field is Mandatory",
    message: "Message Field is Mandatory",
  });
  const [show, setShow]       = useState(false);
  const [success, setSuccess] = useState(false);
  const dispatch = useDispatch();

  const getInputData = (e) => {
    const { name, value } = e.target;
    setErrorMessage((old) => ({ ...old, [name]: formValidator(e) }));
    setData((old) => ({ ...old, [name]: value }));
  };

  const postData = (e) => {
    e.preventDefault();
    const error = Object.values(errorMessage).find((x) => x !== "");
    if (error) {
      setShow(true);
    } else {
      dispatch(createContactUs({ ...data, active: true, date: new Date() }));
      setSuccess(true);
      setData({ name: "", email: "", phone: "", subject: "", message: "" });
      setShow(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Outfit:wght@300;400;500;600;700&display=swap');

        :root {
          --cream:       #FAF8F5;
          --white:       #FFFFFF;
          --sand:        #F2EDE6;
          --sand-deep:   #E8E0D5;
          --ink:         #1C1917;
          --ink-soft:    #44403C;
          --ink-muted:   #78716C;
          --ink-ghost:   #A8A29E;
          --amber:       #D97706;
          --amber-lt:    #FEF3C7;
          --border:      #E7E2DA;
          --border-deep: #D6CFC5;
          --shadow-sm:   0 1px 3px rgba(28,25,23,.06), 0 1px 2px rgba(28,25,23,.04);
          --shadow-md:   0 4px 16px rgba(28,25,23,.09), 0 2px 6px rgba(28,25,23,.05);
          --shadow-lg:   0 16px 48px rgba(28,25,23,.12), 0 8px 24px rgba(28,25,23,.07);
        }

        /* ── PAGE ── */
        .cu-page {
          background: var(--cream);
          padding: 88px 0 112px;
          position: relative;
          overflow: hidden;
        }
        .cu-page::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            radial-gradient(ellipse 70% 50% at 0% 0%, rgba(217,119,6,.04) 0%, transparent 60%),
            radial-gradient(ellipse 60% 70% at 100% 100%, rgba(217,119,6,.05) 0%, transparent 60%),
            radial-gradient(circle, rgba(28,25,23,.04) 1px, transparent 1px);
          background-size: auto, auto, 28px 28px;
          pointer-events: none;
        }
        .cu-inner { position: relative; z-index: 1; }

        /* ── SECTION HEADER ── */
        .cu-eyebrow {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: .25em; text-transform: uppercase;
          color: var(--amber); margin-bottom: 12px;
        }
        .cu-eyebrow::before {
          content: ''; display: block;
          width: 24px; height: 1.5px;
          background: var(--amber); flex-shrink: 0;
        }
        .cu-heading {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px, 4vw, 50px);
          font-weight: 700; color: var(--ink);
          line-height: 1.08; letter-spacing: -.025em;
          margin-bottom: 14px;
        }
        .cu-heading em { font-style: italic; color: var(--amber); }
        .cu-subtext {
          font-family: 'Outfit', sans-serif;
          font-size: 15px; color: var(--ink-muted);
          font-weight: 400; line-height: 1.7;
          max-width: 480px; margin: 0 auto;
        }
        .cu-divider {
          width: 56px; height: 2px;
          background: linear-gradient(90deg, var(--amber), #FBBF24);
          border-radius: 2px; margin: 28px auto 0;
        }

        /* ── CONTACT INFO CARDS ── */
        .cu-info-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 18px;
          padding: 22px 20px;
          display: flex; align-items: flex-start; gap: 16px;
          box-shadow: var(--shadow-sm);
          text-decoration: none;
          transition: transform .32s cubic-bezier(.22,.68,0,1.18),
                      box-shadow .32s, border-color .25s;
          height: 100%;
        }
        .cu-info-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: var(--border-deep);
          text-decoration: none;
        }
        .cu-info-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
          border-width: 1px; border-style: solid;
        }
        .cu-info-body {}
        .cu-info-label {
          font-family: 'Outfit', sans-serif;
          font-size: 10px; font-weight: 700;
          letter-spacing: .18em; text-transform: uppercase;
          color: var(--ink-ghost); margin-bottom: 4px;
        }
        .cu-info-value {
          font-family: 'Playfair Display', serif;
          font-size: 15px; font-weight: 600; color: var(--ink);
          margin-bottom: 2px;
        }
        .cu-info-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 11.5px; color: var(--ink-ghost);
        }

        /* ── MAP ── */
        .cu-map-wrap {
          border-radius: 20px; overflow: hidden;
          border: 1.5px solid var(--border);
          box-shadow: var(--shadow-md);
          height: 100%; min-height: 460px;
          position: relative;
        }
        .cu-map-wrap iframe { width: 100%; height: 100%; border: none; display: block; }
        .cu-map-label {
          position: absolute; top: 14px; left: 14px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 100px; padding: 6px 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase; color: var(--ink-soft);
          box-shadow: var(--shadow-sm);
          display: flex; align-items: center; gap: 6px;
        }

        /* ── FORM CARD ── */
        .cu-form-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 24px;
          padding: 36px 36px 40px;
          box-shadow: var(--shadow-md);
        }
        .cu-form-title {
          font-family: 'Playfair Display', serif;
          font-size: 24px; font-weight: 700; color: var(--ink);
          margin-bottom: 6px;
        }
        .cu-form-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; color: var(--ink-ghost);
          margin-bottom: 28px;
        }

        /* Input wrapper */
        .cu-input-wrap {
          position: relative; margin-bottom: 16px;
        }
        .cu-input-icon {
          position: absolute; left: 15px; top: 50%;
          transform: translateY(-50%);
          font-size: 13px; color: var(--ink-ghost);
          pointer-events: none;
          transition: color .2s;
        }
        .cu-textarea-icon {
          position: absolute; left: 15px; top: 16px;
          font-size: 13px; color: var(--ink-ghost);
          pointer-events: none;
          transition: color .2s;
        }
        .cu-input {
          width: 100%;
          font-family: 'Outfit', sans-serif; font-size: 13.5px;
          color: var(--ink);
          background: var(--sand);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px 12px 40px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .cu-input:focus {
          border-color: var(--amber);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(217,119,6,.08);
        }
        .cu-input::placeholder { color: var(--ink-ghost); }
        .cu-input.is-error { border-color: #E11D48; background: #FFF1F2; }
        .cu-input.is-error:focus { box-shadow: 0 0 0 3px rgba(225,29,72,.08); }
        .cu-input.is-error::placeholder { color: #E11D48; }
        .cu-input.is-valid { border-color: #059669; }
        .cu-input-wrap:focus-within .cu-input-icon,
        .cu-input-wrap:focus-within .cu-textarea-icon { color: var(--amber); }

        .cu-textarea {
          width: 100%; resize: vertical; min-height: 110px;
          font-family: 'Outfit', sans-serif; font-size: 13.5px;
          color: var(--ink);
          background: var(--sand);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px 12px 40px;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        .cu-textarea:focus {
          border-color: var(--amber);
          background: var(--white);
          box-shadow: 0 0 0 3px rgba(217,119,6,.08);
        }
        .cu-textarea::placeholder { color: var(--ink-ghost); }
        .cu-textarea.is-error { border-color: #E11D48; background: #FFF1F2; }
        .cu-textarea.is-valid { border-color: #059669; }

        /* Error hint */
        .cu-field-err {
          font-family: 'Outfit', sans-serif;
          font-size: 11px; color: #E11D48; font-weight: 600;
          margin-top: -10px; margin-bottom: 10px; padding-left: 4px;
          display: flex; align-items: center; gap: 4px;
        }

        /* Submit */
        .cu-submit-btn {
          width: 100%;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: .1em; text-transform: uppercase;
          padding: 14px; border-radius: 12px; border: none;
          background: var(--ink); color: var(--white);
          cursor: pointer; margin-top: 8px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 4px 16px rgba(28,25,23,.18);
          transition: background .22s, transform .15s, box-shadow .22s;
        }
        .cu-submit-btn:hover {
          background: var(--amber);
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(217,119,6,.28);
        }

        /* Success banner */
        .cu-success {
          background: #ECFDF5; border: 1.5px solid #A7F3D0;
          border-radius: 14px; padding: 16px 20px; margin-bottom: 20px;
          display: flex; align-items: flex-start; gap: 12px;
        }
        .cu-success-icon {
          font-size: 20px; color: #059669; flex-shrink: 0; margin-top: 1px;
        }
        .cu-success-text {
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: #065F46; line-height: 1.6;
        }
        .cu-success-text strong { display: block; margin-bottom: 2px; font-size: 14px; }

        @media (max-width: 576px) {
          .cu-form-card { padding: 24px 18px 28px; }
          .cu-page { padding: 60px 0 80px; }
        }
      `}</style>

      <section className="cu-page">
        <div className="cu-inner">
          <div className="container">

            {/* ── Header ── */}
            <div className="text-center mb-5">
              <div className="cu-eyebrow">Get In Touch</div>
              <h2 className="cu-heading">We'd love to <em>hear</em> from you</h2>
              <p className="cu-subtext">
                Have a question, a suggestion, or just want to say hello? Drop us a message and we'll get back to you shortly.
              </p>
              <div className="cu-divider" />
            </div>

            {/* ── Info Cards ── */}
            <div className="row g-3 mb-5">
              {CONTACT_ITEMS.map((item, i) => (
                <div className="col-md-6 col-lg-3" key={i}>
                  <a href={item.href} target="_blank" rel="noreferrer" className="cu-info-card">
                    <div
                      className="cu-info-icon"
                      style={{ background: item.bg, borderColor: item.border, color: item.color }}
                    >
                      <i className={item.icon} />
                    </div>
                    <div className="cu-info-body">
                      <div className="cu-info-label">{item.label}</div>
                      <div className="cu-info-value">{item.value}</div>
                      <div className="cu-info-sub">{item.sub}</div>
                    </div>
                  </a>
                </div>
              ))}
            </div>

            {/* ── Map + Form ── */}
            <div className="row g-4 align-items-stretch">

              {/* Map */}
              <div className="col-lg-6 col-12">
                <div className="cu-map-wrap">
                  <div className="cu-map-label">
                    <i className="fa-solid fa-location-dot" style={{ color: "#D97706" }} />
                    A-43 Sector-16, Noida
                  </div>
                  <iframe
                    title="BookPlaza Location"
                    src="https://maps.google.com/maps?q=A-43%20Sector-16%20Noida&t=&z=13&ie=UTF8&iwloc=&output=embed"
                    allowFullScreen=""
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Form */}
              <div className="col-lg-6 col-12">
                <div className="cu-form-card">
                  <div className="cu-form-title">Send us a message</div>
                  <div className="cu-form-sub">Fill out the form and our team will respond within 24 hours.</div>

                  {/* Success state */}
                  {success && (
                    <div className="cu-success">
                      <i className="fa-solid fa-circle-check cu-success-icon" />
                      <div className="cu-success-text">
                        <strong>Message sent successfully!</strong>
                        Thanks for reaching out. Our team will contact you soon.
                      </div>
                    </div>
                  )}

                  <form onSubmit={postData} noValidate>
                    {FIELDS.map((field) => {
                      const hasErr = show && errorMessage[field.name];
                      const isOk  = !errorMessage[field.name] && data[field.name];
                      return (
                        <div key={field.name}>
                          <div className="cu-input-wrap">
                            <i className={`${field.icon} cu-input-icon`} />
                            <input
                              type={field.type}
                              name={field.name}
                              value={data[field.name]}
                              onChange={getInputData}
                              placeholder={hasErr ? errorMessage[field.name] : field.placeholder}
                              className={`cu-input ${hasErr ? "is-error" : isOk ? "is-valid" : ""}`}
                            />
                          </div>
                          {hasErr && (
                            <div className="cu-field-err">
                              <i className="fa-solid fa-circle-exclamation" />
                              {errorMessage[field.name]}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* Textarea */}
                    <div>
                      <div className="cu-input-wrap">
                        <i className="fa-solid fa-message cu-textarea-icon" />
                        <textarea
                          name="message"
                          value={data.message}
                          onChange={getInputData}
                          placeholder={show && errorMessage.message ? errorMessage.message : "Your Message"}
                          className={`cu-textarea ${show && errorMessage.message ? "is-error" : !errorMessage.message && data.message ? "is-valid" : ""}`}
                        />
                      </div>
                      {show && errorMessage.message && (
                        <div className="cu-field-err">
                          <i className="fa-solid fa-circle-exclamation" />
                          {errorMessage.message}
                        </div>
                      )}
                    </div>

                    <button type="submit" className="cu-submit-btn">
                      <i className="fa-solid fa-paper-plane" />
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
}