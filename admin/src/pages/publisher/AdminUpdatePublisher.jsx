import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import formValidator from "../../FormValidators/formValidator";
import imageValidator from "../../FormValidators/imageValidator";
import { getPublisher, updatePublisher } from "../../Redux/ActionCreators/PublisherActionCreators";

const checklist = [
  { dot: "bg-success", title: "Review Name",    body: "Ensure the publisher name is correct and unique." },
  { dot: "bg-primary", title: "Update Contact",  body: "Keep address, email, and phone current."          },
  { dot: "bg-warning", title: "Save Changes",    body: "Changes take effect immediately on the site."     },
];

export default function AdminUpdatePublisher() {
  const { _id }            = useParams();
  const navigate           = useNavigate();
  const PublisherStateData = useSelector((state) => state.PublisherStateData);
  const dispatch            = useDispatch();

  const [data, setData]   = useState({
    name: "", address: "", email: "", phone: "", website: "", logo: "", active: true,
  });
  const [error, setError] = useState({ name: "" });
  const [imagePreview, setImagePreview] = useState(null);
  const [show, setShow]   = useState(false);

  function getInputData(e) {
    const name  = e.target.name;
    const value = e.target.files ? e.target.files[0] : e.target.value;

    if (name === "name") {
      setError((old) => ({ ...old, name: formValidator(e) }));
    }
    if (name === "logo" && e.target.files?.[0]) {
      const imgError = imageValidator(e);
      if (imgError) setShow(true);
      setImagePreview(URL.createObjectURL(e.target.files[0]));
    }
    setData((old) => ({
      ...old,
      [name]: name === "active" ? (value === "1") : value,
    }));
  }

  function postSubmit(e) {
    e.preventDefault();
    const errorItem = Object.values(error).find((x) => x !== "");
    if (errorItem) { setShow(true); return; }

    const duplicate = PublisherStateData.find(
      (x) => x._id !== _id && x.name.toLowerCase() === data.name.toLowerCase()
    );
    if (duplicate) {
      setShow(true);
      setError((old) => ({ ...old, name: "Publisher Already Exists" }));
      return;
    }

    const formData = new FormData();
    formData.append("_id",     data._id);
    formData.append("name",    data.name);
    formData.append("address", data.address);
    formData.append("email",   data.email);
    formData.append("phone",   data.phone);
    formData.append("website", data.website);
    formData.append("logo",    data.logo);
    formData.append("active",  data.active);
    dispatch(updatePublisher(formData));
    navigate("/publisher");
  }

  useEffect(() => {
    dispatch(getPublisher());
    if (PublisherStateData.length) {
      const item = PublisherStateData.find((x) => x._id === _id);
      if (item) {
        setData({ ...item });
        if (item.logo) setImagePreview(item.logo);
      }
    }
  }, [PublisherStateData.length]);

  return (
    <main className="dashboard-content">
      <div className="container-fluid px-3 px-lg-4 py-4">

        <div className="page-heading">
          <div className="page-heading-copy">
            <span className="page-icon">
              <i className="bi bi-pencil-square" aria-hidden="true"></i>
            </span>
            <div>
              <p className="eyebrow mb-1">Management</p>
              <h1 className="h3 mb-1">Update Publisher</h1>
              <p className="text-muted mb-0">Edit the publisher details below.</p>
            </div>
          </div>
          <div className="heading-actions">
            <Link className="btn btn-outline-secondary btn-sm" to="/publisher">
              <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Publishers
            </Link>
          </div>
        </div>

        {show && (
          <div className="alert alert-danger alert-dismissible" role="alert">
            {Object.values(error).find((x) => x !== "")}
            <button type="button" className="btn-close" onClick={() => setShow(false)} aria-label="Close" />
          </div>
        )}

        <section className="row g-3">
          <div className="col-12 col-xl-8">
            <div className="panel">
              <div className="panel-header">
                <div>
                  <h2 className="h5 mb-1 section-title">
                    <i className="bi bi-building" aria-hidden="true"></i>
                    <span>Publisher Information</span>
                  </h2>
                  <p className="text-muted mb-0">Update the details for this publisher.</p>
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label" htmlFor="name">Publisher Name</label>
                  <input id="name" type="text" name="name" className="form-control"
                    placeholder="e.g. Penguin Random House" value={data.name} onChange={getInputData} />
                  {show && error.name && <div className="text-danger small mt-1">{error.name}</div>}
                </div>

                <div className="col-12">
                  <label className="form-label" htmlFor="address">Address</label>
                  <input id="address" type="text" name="address" className="form-control"
                    placeholder="Street, City, Country" value={data.address} onChange={getInputData} />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="email">Email</label>
                  <input id="email" type="email" name="email" className="form-control"
                    placeholder="contact@publisher.com" value={data.email} onChange={getInputData} />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="phone">Phone</label>
                  <input id="phone" type="text" name="phone" className="form-control"
                    placeholder="+1 555 000 1234" value={data.phone} onChange={getInputData} />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="website">Website</label>
                  <input id="website" type="text" name="website" className="form-control"
                    placeholder="https://publisher.com" value={data.website} onChange={getInputData} />
                </div>

                <div className="col-md-6">
                  <label className="form-label" htmlFor="active">Status</label>
                  <select id="active" name="active" className="form-select"
                    value={data.active ? "1" : "0"} onChange={getInputData}>
                    <option value="1">Active</option>
                    <option value="0">Inactive</option>
                  </select>
                </div>

                <div className="col-md-12">
                  <label className="form-label" htmlFor="logo">
                    Logo <span className="text-muted fw-normal">(leave blank to keep current)</span>
                  </label>
                  <input id="logo" type="file" name="logo" className="form-control"
                    accept="image/jpeg,image/png,image/webp" onChange={getInputData} />
                  {imagePreview && (
                    <img src={imagePreview} alt="Preview"
                      className="mt-2 rounded border"
                      style={{ height: 60, objectFit: "contain", background: "#f8f9fa", padding: 4 }} />
                  )}
                </div>
              </div>

              <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                <Link className="btn btn-outline-secondary" to="/publisher">Cancel</Link>
                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                  <i className="bi bi-check-circle" aria-hidden="true"></i> Update Publisher
                </button>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-4">
            <div className="panel h-100">
              <h2 className="h5 mb-3 section-title">
                <i className="bi bi-list-check" aria-hidden="true"></i>
                <span>Update Checklist</span>
              </h2>
              <div className="activity-list">
                {checklist.map(({ dot, title, body }) => (
                  <div key={title} className="activity-item">
                    <span className={`activity-dot ${dot}`}></span>
                    <div>
                      <p className="mb-1 fw-semibold">{title}</p>
                      <p className="text-muted small mb-0">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}