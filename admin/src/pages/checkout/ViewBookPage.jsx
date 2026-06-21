// ViewProductPage.jsx
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCheckout } from "../../Redux/ActionCreators/CheckoutActionCreators";

export function ViewProductPage() {
  const { _id } = useParams();
  const CheckoutStateData = useSelector((state) => state.CheckoutStateData);
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);

  const orders = Array.isArray(CheckoutStateData) ? CheckoutStateData : CheckoutStateData?.data ?? [];

  useEffect(() => { dispatch(getCheckout()); }, [dispatch]);

  useEffect(() => {
    if (orders.length > 0) {
      const found = orders.find((o) => o._id === _id);
      setOrder(found || null);
    }
  }, [orders, _id]);

  if (!order) {
    return (
      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4 d-flex align-items-center justify-content-center" style={{ minHeight: "60vh" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3"></div>
            <p className="text-muted">Loading items...</p>
          </div>
        </div>
      </main>
    );
  }

  const subtotal = order.books?.reduce((sum, i) => sum + (i?.total || 0), 0) ?? 0;
  const itemCount = order.books?.length ?? 0;

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-boxes" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Order Items</h1>
              <p className="text-muted mb-0">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · Order #{order._id?.slice(-8)}
              </p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/checkout">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Orders
            </Link>
          </div>
        </div>

        <section className="panel mt-3">
          <div className="panel-header">
            <div>
              <h2 className="h5 mb-1 section-title">
                <i className="bi bi-table" aria-hidden="true"></i>
                <span>Items in this Order</span>
              </h2>
              <p className="text-muted mb-0">Products purchased in this order.</p>
            </div>
          </div>

          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product Name</th>
                  <th>Format</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {itemCount > 0 ? (
                  order.books.map((item, idx) => (
                    <tr key={item._id ?? idx}>
                      <td className="text-muted">{idx + 1}</td>
                      <td className="fw-semibold">{item.book?.name ?? "N/A"}</td>
                      <td>
                        <span className="badge text-bg-secondary-subtle text-secondary-emphasis">
                          {item.format ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className="badge text-bg-primary-subtle text-primary-emphasis">
                          ×{item.qty}
                        </span>
                      </td>
                      <td>₹{item.qty ? (item.total / item.qty).toFixed(2) : 0}</td>
                      <td className="fw-semibold text-success">₹{item.total ?? 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">No items in this order.</td>
                  </tr>
                )}
              </tbody>
              {itemCount > 0 && (
                <tfoot>
                  <tr className="table-light">
                    <td colSpan="5" className="text-end fw-bold">Order Total</td>
                    <td className="fw-bold text-success">₹{subtotal}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}

export default ViewProductPage;