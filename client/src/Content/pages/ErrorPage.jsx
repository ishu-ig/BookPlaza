import Link from 'next/link'

export default function ErrorPage() {
  return (
    <>
      <style>{`
        .err-wrap {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1.5rem;
          text-align: center;
          background: var(--cream, #FAF8F5);
        }
        .err-icon-circle {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #F2EDE6;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .err-number {
          font-size: clamp(80px, 18vw, 120px);
          font-weight: 700;
          line-height: 1;
          color: #1C1917;
          letter-spacing: -4px;
          position: relative;
          display: inline-block;
          margin-bottom: 0;
          font-family: 'Playfair Display', serif;
        }
        .err-number::after {
          content: '';
          position: absolute;
          bottom: 10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60%;
          height: 3px;
          background: #E7E2DA;
          border-radius: 2px;
        }
        .err-heading {
          font-family: 'Playfair Display', serif;
          font-size: clamp(20px, 4vw, 26px);
          font-weight: 700;
          color: #1C1917;
          margin: 1rem 0 0.5rem;
        }
        .err-sub {
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          color: #78716C;
          max-width: 360px;
          line-height: 1.7;
          margin: 0 auto 2rem;
        }
        .err-btn-row {
          display: flex;
          gap: 10px;
          justify-content: center;
          flex-wrap: wrap;
        }
        .err-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 24px;
          background: #1C1917;
          color: #fff;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background .2s, transform .15s;
        }
        .err-btn-primary:hover {
          background: #D97706;
          transform: translateY(-2px);
          color: #fff;
        }
        .err-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 11px 24px;
          background: transparent;
          color: #44403C;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          border: 1.5px solid #E7E2DA;
          transition: background .2s, border-color .2s;
        }
        .err-btn-outline:hover {
          background: #F2EDE6;
          border-color: #D6CFC5;
        }
        .err-crumbs {
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          color: #A8A29E;
          margin-top: 2.5rem;
        }
        .err-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #D6CFC5;
        }
      `}</style>

      <div className="err-wrap">
        <div className="err-icon-circle">
          <i className="fa-solid fa-map-location-dot" style={{ fontSize: 28, color: '#78716C' }} />
        </div>

        <div className="err-number">404</div>

        <h1 className="err-heading">Page not found</h1>
        <p className="err-sub">
          The page you're looking for doesn't exist or may have been moved.
          Let's get you back on track.
        </p>

        <div className="err-btn-row">
          <Link href="/" className="err-btn-primary">
            <i className="fa-solid fa-house" />
            Go home
          </Link>
          <Link href="javascript:history.back()" className="err-btn-outline">
            <i className="fa-solid fa-arrow-left" />
            Go back
          </Link>
        </div>

        <div className="err-crumbs">
          <span>Home</span>
          <div className="err-dot" />
          <span>404</span>
          <div className="err-dot" />
          <span style={{ color: '#1C1917' }}>Page not found</span>
        </div>
      </div>
    </>
  )
}