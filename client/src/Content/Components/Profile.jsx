"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function Profile({ title }) {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const userid = localStorage.getItem("userid");
        const token = localStorage.getItem("token");

        if (!userid || !token) {
          router.push("/login");
          return;
        }

        let response = await fetch(
          `${process.env.NEXT_PUBLIC_SERVER}/api/user/${userid}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              authorization: token,
            },
          }
        );
        response = await response.json();
        if (response.result === "Done") setData(response.data);
        else router.push("/login");
      } catch (error) {
        console.error("Profile fetch error:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ── LOADING ── */
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 0",
          color: "#A8A29E",
          fontFamily: "Outfit, sans-serif",
          fontSize: 14,
        }}
      >
        <i className="fa-solid fa-spinner fa-spin" style={{ marginRight: 8 }} />
        Loading profile...
      </div>
    );
  }

  /* ── CHECKOUT VIEW ── */
  if (title === "Checkout") {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

          .pco-card {
            background: #fff;
            border: 1.5px solid #E7E2DA;
            border-radius: 20px;
            padding: 28px;
            box-shadow: 0 1px 3px rgba(28,25,23,.06);
          }
          .pco-label {
            font-family: 'Outfit', sans-serif;
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.18em; text-transform: uppercase;
            color: #A8A29E; margin-bottom: 16px;
          }
          .pco-name {
            font-family: 'Playfair Display', serif;
            font-size: 20px; font-weight: 700; color: #1C1917;
            margin-bottom: 6px;
          }
          .pco-row {
            display: flex; align-items: flex-start; gap: 10px;
            font-family: 'Outfit', sans-serif;
            font-size: 13.5px; color: #78716C;
            margin-bottom: 8px; line-height: 1.5;
          }
          .pco-row i {
            color: #D97706; font-size: 13px;
            margin-top: 2px; flex-shrink: 0; width: 16px;
          }
          .pco-divider {
            border: none; border-top: 1.5px solid #E7E2DA;
            margin: 20px 0;
          }
          .pco-change-btn {
            display: inline-flex; align-items: center; gap: 6px;
            font-family: 'Outfit', sans-serif;
            font-size: 12px; font-weight: 700;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #D97706; background: #FEF3C7;
            border: 1.5px solid #FDE68A;
            padding: 8px 18px; border-radius: 100px;
            text-decoration: none;
            transition: background .2s, border-color .2s;
          }
          .pco-change-btn:hover {
            background: #FDE68A; border-color: #D97706; color: #D97706;
          }
          .pco-verified {
            display: inline-flex; align-items: center; gap: 5px;
            font-family: 'Outfit', sans-serif;
            font-size: 11px; font-weight: 600;
            color: #059669; background: rgba(5,150,105,.08);
            padding: 3px 10px; border-radius: 100px;
            margin-bottom: 16px;
          }
          .pco-empty-address {
            background: #FEF3C7;
            border: 1.5px dashed #FDE68A;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            font-family: 'Outfit', sans-serif;
            font-size: 13px;
            color: #78716C;
            margin-bottom: 16px;
          }
          .pco-empty-address i {
            font-size: 24px;
            color: #D97706;
            margin-bottom: 8px;
            display: block;
          }
        `}</style>

        <div className="pco-card">
          <div className="pco-label">
            <i
              className="fa-solid fa-location-dot"
              style={{ marginRight: 6, color: "#D97706" }}
            />
            Delivery Address
          </div>

          {data.address ? (
            <>
              <div className="pco-verified">
                <i className="fa-solid fa-circle-check" /> Verified Address
              </div>

              <div className="pco-name">{data.name || "—"}</div>

              <div className="pco-row">
                <i className="fa-solid fa-house" />
                <span>{data.address}</span>
              </div>
              <div className="pco-row">
                <i className="fa-solid fa-city" />
                <span>
                  {[data.city, data.state].filter(Boolean).join(", ")}
                  {data.pin ? ` — ${data.pin}` : ""}
                </span>
              </div>
              <div className="pco-row">
                <i className="fa-solid fa-phone" />
                <span>{data.phone || "No phone saved"}</span>
              </div>
              <div className="pco-row">
                <i className="fa-solid fa-envelope" />
                <span>{data.email || "—"}</span>
              </div>
            </>
          ) : (
            <div className="pco-empty-address">
              <i className="fa-solid fa-location-dot" />
              No address saved. Please add your delivery address.
            </div>
          )}

          <hr className="pco-divider" />

          <Link href="/updateProfile" className="pco-change-btn">
            <i className="fa-solid fa-pen" />{" "}
            {data.address ? "Change Address" : "Add Address"}
          </Link>
        </div>
      </>
    );
  }

  /* ── PROFILE PAGE VIEW ── */
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .pp-page { background: #FAF8F5; min-height: 100vh; padding: 40px 0 100px; }

        /* Avatar card */
        .pp-avatar-card {
          background: #fff;
          border: 1.5px solid #E7E2DA;
          border-radius: 20px;
          padding: 32px 24px;
          text-align: center;
          box-shadow: 0 1px 3px rgba(28,25,23,.06);
          position: sticky; top: 100px;
        }
        .pp-avatar-wrap {
          position: relative; display: inline-block; margin-bottom: 16px;
        }
        .pp-avatar {
          width: 110px; height: 110px;
          border-radius: 50%; object-fit: cover;
          border: 4px solid #FEF3C7;
          box-shadow: 0 0 0 2px #D97706;
        }
        .pp-avatar-badge {
          position: absolute; bottom: 4px; right: 4px;
          width: 24px; height: 24px; border-radius: 50%;
          background: #D97706; color: #fff;
          display: flex; align-items: center; justify-content: center;
          font-size: 10px;
          border: 2px solid #fff;
        }
        .pp-name {
          font-family: 'Playfair Display', serif;
          font-size: 20px; font-weight: 700; color: #1C1917;
          margin-bottom: 4px;
        }
        .pp-email {
          font-family: 'Outfit', sans-serif;
          font-size: 12.5px; color: #A8A29E; margin-bottom: 20px;
        }
        .pp-manage-btn {
          display: flex; align-items: center; justify-content: center; gap: 8px;
          width: 100%;
          font-family: 'Outfit', sans-serif;
          font-size: 12px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          padding: 12px; border-radius: 12px;
          background: #1C1917; color: #fff;
          text-decoration: none;
          transition: background .22s, transform .15s;
        }
        .pp-manage-btn:hover {
          background: #D97706; transform: translateY(-1px); color: #fff;
        }
        .pp-quick-links {
          margin-top: 16px; display: flex; flex-direction: column; gap: 8px;
        }
        .pp-quick-link {
          display: flex; align-items: center; gap: 10px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #78716C; text-decoration: none;
          padding: 10px 14px; border-radius: 12px;
          border: 1.5px solid #E7E2DA;
          transition: border-color .2s, color .2s, background .2s;
        }
        .pp-quick-link i { color: #D97706; width: 16px; text-align: center; }
        .pp-quick-link:hover {
          border-color: #D97706; color: #1C1917;
          background: #FEF3C7;
        }

        /* Info card */
        .pp-info-card {
          background: #fff;
          border: 1.5px solid #E7E2DA;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(28,25,23,.06);
        }
        .pp-info-header {
          padding: 20px 28px 16px;
          border-bottom: 1.5px solid #E7E2DA;
          display: flex; align-items: center; justify-content: space-between;
        }
        .pp-info-title {
          font-family: 'Playfair Display', serif;
          font-size: 18px; font-weight: 700; color: #1C1917;
        }
        .pp-info-edit {
          display: inline-flex; align-items: center; gap: 6px;
          font-family: 'Outfit', sans-serif;
          font-size: 11px; font-weight: 700;
          letter-spacing: 0.08em; text-transform: uppercase;
          color: #D97706; background: #FEF3C7;
          border: 1.5px solid #FDE68A;
          padding: 6px 14px; border-radius: 100px;
          text-decoration: none;
          transition: background .2s;
        }
        .pp-info-edit:hover { background: #FDE68A; color: #D97706; }

        .pp-field-row {
          display: flex; align-items: flex-start;
          padding: 16px 28px;
          border-bottom: 1px solid #F0EBE3;
          gap: 16px;
        }
        .pp-field-row:last-child { border-bottom: none; }
        .pp-field-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #FEF3C7;
          display: flex; align-items: center; justify-content: center;
          color: #D97706; font-size: 13px; flex-shrink: 0;
        }
        .pp-field-label {
          font-family: 'Outfit', sans-serif;
          font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: #A8A29E; margin-bottom: 2px;
        }
        .pp-field-value {
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 500; color: #1C1917;
        }
        .pp-field-empty {
          font-family: 'Outfit', sans-serif;
          font-size: 13px; color: #D4CCC1; font-style: italic;
        }
      `}</style>

      <div className="pp-page">
        <div className="container">
          <div className="row g-4 align-items-start">

            {/* LEFT: Avatar Card */}
            <div className="col-12 col-md-4">
              <div className="pp-avatar-card">
                <div className="pp-avatar-wrap">
                  <img
                    src={
                      data.pic
                        ? `${process.env.NEXT_PUBLIC_SERVER}/${data.pic}`
                        : "/img/noimage.jpg"
                    }
                    alt="Profile"
                    className="pp-avatar"
                  />
                  <div className="pp-avatar-badge">
                    <i className="fa-solid fa-pen" />
                  </div>
                </div>
                <div className="pp-name">{data.name || "User"}</div>
                <div className="pp-email">{data.email || "—"}</div>

                <Link href="/updateProfile" className="pp-manage-btn">
                  <i className="fa-solid fa-pen-to-square" /> Edit Profile
                </Link>

                <div className="pp-quick-links">
                  <Link href="/orders" className="pp-quick-link">
                    <i className="fa-solid fa-box" /> My Orders
                  </Link>
                  <Link href="/wishlist" className="pp-quick-link">
                    <i className="fa-regular fa-heart" /> Wishlist
                  </Link>
                  <Link href="/cart" className="pp-quick-link">
                    <i className="fa-solid fa-cart-shopping" /> My Cart
                  </Link>
                </div>
              </div>
            </div>

            {/* RIGHT: Info Card */}
            <div className="col-12 col-md-8">
              <div className="pp-info-card">
                <div className="pp-info-header">
                  <div className="pp-info-title">Account Information</div>
                  <Link href="/updateProfile" className="pp-info-edit">
                    <i className="fa-solid fa-pen" /> Edit
                  </Link>
                </div>

                {[
                  { icon: "fa-user",     label: "Full Name",  value: data.name },
                  { icon: "fa-at",       label: "Username",   value: data.username },
                  { icon: "fa-envelope", label: "Email",      value: data.email },
                  { icon: "fa-phone",    label: "Phone",      value: data.phone },
                  { icon: "fa-house",    label: "Address",    value: data.address },
                  { icon: "fa-map-pin",  label: "Pin Code",   value: data.pin },
                  { icon: "fa-city",     label: "City",       value: data.city },
                  { icon: "fa-map",      label: "State",      value: data.state },
                ].map((field, i) => (
                  <div key={i} className="pp-field-row">
                    <div className="pp-field-icon">
                      <i className={`fa-solid ${field.icon}`} />
                    </div>
                    <div>
                      <div className="pp-field-label">{field.label}</div>
                      {field.value ? (
                        <div className="pp-field-value">{field.value}</div>
                      ) : (
                        <div className="pp-field-empty">Not provided</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}