import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getBook, deleteBook, updateBook } from "../../Redux/ActionCreators/BookActionCreators";

const FORMAT_COLORS = {
  Paperback: "#0d6efd",
  Hardcover: "#6f42c1",
  Ebook:     "#198754",
};

export default function AdminBook() {
  const BookStateData = useSelector((state) => state.BookStateData);
  const dispatch = useDispatch();
  const [flag, setFlag] = useState(false);
  const [search, setSearch] = useState("");

  const totalCount    = BookStateData?.length ?? 0;
  const activeCount   = BookStateData?.filter((i) => i.active).length ?? 0;
  const inactiveCount = totalCount - activeCount;
  const featuredCount = BookStateData?.filter((i) => i.featured).length ?? 0;

  function deleteRecord(_id) {
    if (window.confirm("Are you sure you want to delete this book?")) {
      dispatch(deleteBook({ _id }));
      setFlag((f) => !f);
    }
  }

  function toggleActive(_id) {
    const item = BookStateData.find((b) => b._id === _id);
    if (!item) return;
    const formData = new FormData();
    formData.append("_id", item._id);
    formData.append("title", item.title);
    formData.append("active", !item.active);
    dispatch(updateBook(formData));
    setFlag((f) => !f);
  }

  useEffect(() => { dispatch(getBook()); }, [flag]);

  const filteredData = BookStateData?.filter((item) =>
    item.title?.toLowerCase().includes(search.toLowerCase()) ||
    item.author?.toLowerCase().includes(search.toLowerCase()) ||
    item.isbn?.toLowerCase().includes(search.toLowerCase()) ||
    item.publisher?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.category?.name?.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <>
      <style>{`
        .act-strip {
          display: inline-flex; align-items: center; gap: 2px;
          background: var(--bs-tertiary-bg, #f8f9fa);
          border: 1px solid var(--bs-border-color, #dee2e6);
          border-radius: 8px; padding: 3px;
        }
        .act-btn {
          display: inline-flex; align-items: center; justify-content: center;
          width: 30px; height: 30px; border-radius: 6px;
          border: none; background: transparent; cursor: pointer;
          font-size: 0.88rem; color: #6c757d;
          transition: background .13s, color .13s, transform .1s;
          text-decoration: none; position: relative;
        }
        .act-btn:hover { transform: scale(1.1); }
        .act-btn-edit:hover  { background: #cfe2ff; color: #0d6efd; }
        .act-btn-on:hover    { background: #d1e7dd; color: #198754; }
        .act-btn-off:hover   { background: #fff3cd; color: #856404; }
        .act-btn-del:hover   { background: #f8d7da; color: #dc3545; }
        .act-sep { width: 1px; height: 16px; background: var(--bs-border-color, #dee2e6); flex-shrink: 0; }
        .act-btn::after {
          content: attr(data-tip);
          position: absolute; bottom: calc(100% + 6px); left: 50%;
          transform: translateX(-50%);
          background: #212529; color: #fff;
          font-size: 0.67rem; font-weight: 600;
          padding: 3px 7px; border-radius: 4px; white-space: nowrap;
          pointer-events: none; z-index: 20;
          opacity: 0; transition: opacity .12s;
        }
        .act-btn:hover::after { opacity: 1; }
        .book-cover {
          width: 46px; height: 64px; object-fit: cover;
          border-radius: 6px; border: 1px solid var(--bs-border-color, #dee2e6);
        }
        .book-title-cell { font-weight: 600; font-size: 0.875rem; }
        .book-author-cell { font-size: 0.75rem; color: #6c757d; }
        .book-isbn-cell { font-size: 0.7rem; color: #6c757d; font-family: monospace; }
        .fmt-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 2px 6px; border-radius: 6px; margin-bottom: 3px; font-size: 0.75rem;
        }
        .fmt-badge {
          font-size: 0.65rem; color: #fff; border-radius: 4px; padding: 1px 6px; font-weight: 600;
        }
      `}</style>

      <main className="dashboard-content">
        <div className="container-fluid px-3 px-lg-4 py-4">

          <div className="page-heading">
            <div className="page-heading-copy">
              <span className="page-icon">
                <i className="bi bi-book" aria-hidden="true"></i>
              </span>
              <div>
                <p className="eyebrow mb-1">Management</p>
                <h1 className="h3 mb-1">Books</h1>
                <p className="text-muted mb-0">Review and manage your book catalogue.</p>
              </div>
            </div>
            <div className="heading-actions">
              <Link className="btn btn-primary btn-sm" to="/book/create">
                <i className="bi bi-plus-circle" aria-hidden="true"></i> Add Book
              </Link>
            </div>
          </div>

          <section className="row g-3 mt-2 mb-1" aria-label="Book summary">
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Total</span>
                  <span className="metric-icon"><i className="bi bi-book-fill"></i></span>
                </div>
                <div className="metric-value">{totalCount}</div>
                <div className="metric-meta"><span>all</span><span>books</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Active</span>
                  <span className="metric-icon"><i className="bi bi-check-circle-fill"></i></span>
                </div>
                <div className="metric-value">{activeCount}</div>
                <div className="metric-meta"><span>published</span><span>on site</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card">
                <div className="metric-top">
                  <span className="metric-label">Inactive</span>
                  <span className="metric-icon"><i className="bi bi-eye-slash-fill"></i></span>
                </div>
                <div className="metric-value">{inactiveCount}</div>
                <div className="metric-meta"><span>hidden</span><span>from site</span></div>
              </article>
            </div>
            <div className="col-12 col-sm-6 col-xl-3">
              <article className="metric-card text-white">
                <div className="metric-top">
                  <span className="metric-label">Featured</span>
                  <span className="metric-icon"><i className="bi bi-star-fill"></i></span>
                </div>
                <div className="metric-value">{featuredCount}</div>
                <div className="metric-meta"><span>highlighted</span><span>titles</span></div>
              </article>
            </div>
          </section>

          <section className="panel mt-3">
            <div className="panel-header">
              <div>
                <h2 className="h5 mb-1 section-title">
                  <i className="bi bi-table" aria-hidden="true"></i>
                  <span>Book List</span>
                </h2>
                <p className="text-muted mb-0">Search, review, and manage books.</p>
              </div>
              <div className="ms-auto" style={{ minWidth: 220 }}>
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input type="text" className="form-control border-start-0"
                    placeholder="Search books..." value={search}
                    onChange={(e) => setSearch(e.target.value)} />
                  {search && (
                    <button className="btn btn-outline-secondary" type="button"
                      onClick={() => setSearch("")} title="Clear">
                      <i className="bi bi-x"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cover</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Publisher</th>
                    <th>Format / Pricing</th>
                    <th>Stock</th>
                    <th>Rating</th>
                    <th>Featured</th>
                    <th>Status</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <tr key={item._id}>
                        <td>{index + 1}</td>
                        <td>
                          {item.pic ? (
                            <a href={item.pic} target="_blank" rel="noreferrer">
                              <img src={item.pic} className="book-cover" alt={item.title} />
                            </a>
                          ) : (
                            <div className="book-cover d-flex align-items-center justify-content-center bg-light">
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="book-title-cell">{item.title}</div>
                          <div className="book-author-cell">{item.author}</div>
                          <div className="book-isbn-cell">{item.isbn}</div>
                        </td>
                        <td>
                          <div className="small">{item.category?.name ?? "—"}</div>
                          <div className="text-muted" style={{ fontSize: "0.75rem" }}>{item.subcategory?.name}</div>
                        </td>
                        <td className="small">{item.publisher?.name ?? "—"}</td>
                        <td style={{ minWidth: "170px" }}>
                          {Array.isArray(item.formatPricing) && item.formatPricing.length > 0
                            ? item.formatPricing.map((fp) => {
                                const color = FORMAT_COLORS[fp.format] || "#6c757d";
                                return (
                                  <div key={fp.format} className="fmt-row"
                                    style={{ backgroundColor: color + "12", border: `1px solid ${color}40` }}>
                                    <span className="fmt-badge" style={{ backgroundColor: color }}>{fp.format}</span>
                                    <span>
                                      {fp.discount > 0 && (
                                        <span className="text-muted text-decoration-line-through me-1" style={{ fontSize: "0.68rem" }}>
                                          ₹{fp.price}
                                        </span>
                                      )}
                                      <span className="fw-semibold" style={{ color }}>₹{fp.finalPrice}</span>
                                    </span>
                                  </div>
                                );
                              })
                            : <span className="text-muted small">—</span>
                          }
                        </td>
                        <td>
                          <span className={`badge ${item.stock > 0 ? "text-bg-success" : "text-bg-danger"}`}>
                            {item.stock > 0 ? `${item.stock} left` : "Out"}
                          </span>
                        </td>
                        <td className="small">
                          {item.rating ?? 0} <i className="bi bi-star-fill text-warning"></i>
                          <div className="text-muted" style={{ fontSize: "0.7rem" }}>({item.totalReviews ?? 0})</div>
                        </td>
                        <td>
                          <span className={`badge ${item.featured ? "text-bg-warning" : "text-bg-light text-muted"}`}>
                            {item.featured ? "Yes" : "No"}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${item.active ? "text-bg-success" : "text-bg-secondary"}`}>
                            {item.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="act-strip">
                            <Link className="act-btn act-btn-edit"
                              to={`/book/update/${item._id}`} data-tip="Edit">
                              <i className="bi bi-pencil-square"></i>
                            </Link>
                            <span className="act-sep"></span>
                            <button className={`act-btn ${item.active ? "act-btn-off" : "act-btn-on"}`}
                              onClick={() => toggleActive(item._id)}
                              data-tip={item.active ? "Deactivate" : "Activate"}>
                              <i className={`bi ${item.active ? "bi-pause-fill" : "bi-play-fill"}`}></i>
                            </button>
                            <span className="act-sep"></span>
                            <button className="act-btn act-btn-del"
                              onClick={() => deleteRecord(item._id)} data-tip="Delete">
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" className="text-center text-muted py-4">
                        {search ? `No books found for "${search}"` : "No books available."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}