import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { updateBook, getBook } from "../../Redux/ActionCreators/BookActionCreators"
import { getCategory } from "../../Redux/ActionCreators/CategoryActionCreators"
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators"
import { getPublisher } from "../../Redux/ActionCreators/PublisherActionCreators"

const FORMAT_OPTIONS = ["Paperback", "Hardcover", "Ebook"]

const checklist = [
    { dot: "bg-success", title: "Review details",  body: "Confirm title, author, category, and publisher are correct." },
    { dot: "bg-primary", title: "Check pricing",    body: "Verify format pricing and stock are up to date."             },
    { dot: "bg-warning", title: "Manage files",     body: "Replace cover, gallery images, or the ebook file as needed." },
]

const quillModules = {
    toolbar: [
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link"],
        ["clean"],
    ],
}

// ReactQuill's `style` prop only reaches its outer wrapper div, not the
// actual editable area (.ql-editor), so editor height has to be set via CSS.
const descriptionEditorStyles = `
    .book-description-editor .ql-editor {
        min-height: 150px;
    }
`

function computeFinalPrice(price, discount) {
    const p = parseFloat(price) || 0
    const d = parseFloat(discount) || 0
    return Math.round(p * (1 - d / 100) * 100) / 100
}

// Build the formatPricing state object from a flat array (e.g. from the DB)
function buildFormatPricingState(formatPricingArray = []) {
    const base = {
        Paperback: { selected: false, price: "", discount: 0  },
        Hardcover: { selected: false, price: "", discount: 0  },
        Ebook:     { selected: false, price: "", discount: 20 },
    }
    formatPricingArray.forEach(fp => {
        if (base[fp.format] !== undefined) {
            base[fp.format] = {
                selected: true,
                price:    fp.price    ?? "",
                discount: fp.discount ?? 0,
            }
        }
    })
    return base
}

export default function AdminUpdateBook() {
    const { _id }  = useParams()
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const BookStateData        = useSelector(state => state.BookStateData)
    const CategoryStateData    = useSelector(state => state.CategoryStateData)
    const SubcategoryStateData = useSelector(state => state.SubcategoryStateData)
    const PublisherStateData   = useSelector(state => state.PublisherStateData)

    const [data, setData] = useState({
        title:         "",
        author:        "",
        isbn:          "",
        category:      "",
        subcategory:   "",
        publisher:     "",
        language:      "",
        pages:         "",
        publishedDate: "",
        stock:         "",
        featured:      false,
        active:        true,
        pic:           "",
        images:        [],
        ebookFile:     "",
        description:   "",
        formatPricing: {
            Paperback: { selected: false, price: "", discount: 0  },
            Hardcover: { selected: false, price: "", discount: 0  },
            Ebook:     { selected: false, price: "", discount: 20 },
        },
    })

    const [error, setError] = useState({
        title:         "",
        author:        "",
        isbn:          "",
        language:      "",
        pages:         "",
        stock:         "",
        formatPricing: "",
    })

    const [show,      setShow]      = useState(false)
    const [oldPic,    setOldPic]    = useState("")
    const [oldImages, setOldImages] = useState([])

    // ── Toggle a format on/off ────────────────────────────────────────────────
    function toggleFormat(fmt) {
        setData(old => {
            const updated = {
                ...old.formatPricing,
                [fmt]: { ...old.formatPricing[fmt], selected: !old.formatPricing[fmt].selected },
            }
            const anySelected = Object.values(updated).some(v => v.selected)
            setError(err => ({
                ...err,
                formatPricing: anySelected ? "" : "Select at least one format",
            }))
            return { ...old, formatPricing: updated }
        })
    }

    // ── Update price or discount for a specific format ────────────────────────
    function updateFormatField(fmt, field, value) {
        setData(old => ({
            ...old,
            formatPricing: {
                ...old.formatPricing,
                [fmt]: { ...old.formatPricing[fmt], [field]: value },
            },
        }))
    }

    function getInputData(e) {
        const { name } = e.target

        // Handle multiple images
        if (name === "images") {
            setData(old => ({ ...old, images: Array.from(e.target.files) }))
            return
        }

        // Handle ebookFile separately — skip imageValidator for PDFs
        if (name === "ebookFile") {
            const file = e.target.files?.[0] || ""
            setData(old => ({ ...old, ebookFile: file }))
            return
        }

        const value = e.target.files ? e.target.files[0] : e.target.value

        if (!["active", "featured"].includes(name)) {
            setError(old => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e),
            }))
        }
        setData(old => ({
            ...old,
            [name]: ["active", "featured"].includes(name) ? (value === "1") : value,
        }))
    }

    function getDescriptionData(value) {
        setData(old => ({ ...old, description: value }))
    }

    function postSubmit(e) {
        e.preventDefault()

        const activeErrors = { ...error }
        // ebookFile is optional on update (keep existing if not replaced)
        delete activeErrors.ebookFile

        // Validate at least one format selected
        const anySelected = Object.values(data.formatPricing).some(v => v.selected)
        if (!anySelected) {
            activeErrors.formatPricing = "Select at least one format"
        }

        // Validate prices for selected formats
        let pricingError = ""
        FORMAT_OPTIONS.forEach(fmt => {
            const fp = data.formatPricing[fmt]
            if (fp.selected && (!fp.price || parseFloat(fp.price) <= 0)) {
                pricingError = `Price is required for ${fmt}`
            }
        })
        if (pricingError) activeErrors.formatPricing = pricingError

        const errorItem = Object.values(activeErrors).find(x => x !== "")
        if (errorItem) {
            setShow(true)
            setError(activeErrors)
            return
        }

        const formatPricingArray = FORMAT_OPTIONS
            .filter(fmt => data.formatPricing[fmt].selected)
            .map(fmt => {
                const fp         = data.formatPricing[fmt]
                const price      = parseFloat(fp.price)
                const discount   = parseFloat(fp.discount) || 0
                const finalPrice = computeFinalPrice(price, discount)
                return { format: fmt, price, discount, finalPrice }
            })

        const formData = new FormData()
        formData.append("_id",           data._id)
        formData.append("title",         data.title)
        formData.append("author",        data.author)
        formData.append("isbn",          data.isbn)
        formData.append(
            "category",
            data.category && typeof data.category === "object"
                ? data.category._id
                : data.category || ""
        )
        formData.append(
            "subcategory",
            data.subcategory && typeof data.subcategory === "object"
                ? data.subcategory._id
                : data.subcategory || ""
        )
        formData.append(
            "publisher",
            data.publisher && typeof data.publisher === "object"
                ? data.publisher._id
                : data.publisher || ""
        )
        formData.append("language",      data.language)
        formData.append("pages",         data.pages)
        formData.append("formatPricing", JSON.stringify(formatPricingArray))
        formData.append("publishedDate", data.publishedDate)
        formData.append("stock",         data.stock)
        formData.append("featured",      data.featured)
        formData.append("active",        data.active)
        formData.append("description",   data.description)

        // Cover image — only append if a new file was chosen
        if (data.pic && typeof data.pic !== "string") {
            formData.append("pic", data.pic)
        }

        // Additional images — only append if new files were chosen
        data.images.forEach(img => formData.append("images", img))

        // Only append ebookFile when it's an actual new File object
        // Do NOT append the old string path — backend keeps existing if absent
        if (data.formatPricing.Ebook.selected && data.ebookFile && typeof data.ebookFile !== "string") {
            formData.append("ebookFile", data.ebookFile)
        }

        dispatch(updateBook(formData))
        navigate("/book")
    }

    useEffect(() => { dispatch(getCategory()) },    [CategoryStateData.length])
    useEffect(() => { dispatch(getSubcategory()) }, [SubcategoryStateData.length])
    useEffect(() => { dispatch(getPublisher()) },   [PublisherStateData.length])

    useEffect(() => {
        dispatch(getBook())
        if (BookStateData.length) {
            const item = BookStateData.find(x => x._id === _id)
            if (item) {
                setData({
                    ...item,
                    images:        [],
                    ebookFile:     item.ebookFile || "",   // keep the existing path as a string
                    description:   item.description || "",
                    formatPricing: buildFormatPricingState(item.formatPricing || []),
                })
                setOldPic(item.pic || "")
                setOldImages(item.images || [])
            }
        }
    }, [BookStateData.length])

    return (
        <main className="dashboard-content">
            <style>{descriptionEditorStyles}</style>
            <div className="container-fluid px-3 px-lg-4 py-4">

                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-pencil-square" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Update Book</h1>
                            <p className="text-muted mb-0">Edit details, pricing, files, and status.</p>
                        </div>
                    </div>
                    <div className="heading-actions">
                        <Link className="btn btn-outline-secondary btn-sm" to="/book">
                            <i className="bi bi-arrow-left" aria-hidden="true"></i> Back to Books
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
                                        <i className="bi bi-book" aria-hidden="true"></i>
                                        <span>Book Information</span>
                                    </h2>
                                    <p className="text-muted mb-0">Update the details for this book.</p>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="title">Title</label>
                                    <input id="title" className={`form-control ${show && error.title ? "is-invalid" : ""}`}
                                        type="text" name="title" value={data.title} onChange={getInputData} placeholder="Book Title" />
                                    {show && error.title && <div className="text-danger small mt-1">{error.title}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="author">Author</label>
                                    <input id="author" className={`form-control ${show && error.author ? "is-invalid" : ""}`}
                                        type="text" name="author" value={data.author} onChange={getInputData} placeholder="Author Name" />
                                    {show && error.author && <div className="text-danger small mt-1">{error.author}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="isbn">ISBN</label>
                                    <input id="isbn" className={`form-control ${show && error.isbn ? "is-invalid" : ""}`}
                                        type="text" name="isbn" value={data.isbn} onChange={getInputData} placeholder="ISBN" />
                                    {show && error.isbn && <div className="text-danger small mt-1">{error.isbn}</div>}
                                </div>

                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="category">Category</label>
                                    <select id="category" className="form-select" name="category"
                                        value={typeof data.category === "object" ? data.category._id : data.category}
                                        onChange={getInputData}>
                                        {CategoryStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="subcategory">Subcategory</label>
                                    <select id="subcategory" className="form-select" name="subcategory"
                                        value={typeof data.subcategory === "object" ? data.subcategory._id : data.subcategory}
                                        onChange={getInputData}>
                                        {SubcategoryStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="publisher">Publisher</label>
                                    <select id="publisher" className="form-select" name="publisher"
                                        value={typeof data.publisher === "object" ? data.publisher._id : data.publisher}
                                        onChange={getInputData}>
                                        {PublisherStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="language">Language</label>
                                    <input id="language" className={`form-control ${show && error.language ? "is-invalid" : ""}`}
                                        type="text" name="language" value={data.language} onChange={getInputData} placeholder="e.g. English" />
                                    {show && error.language && <div className="text-danger small mt-1">{error.language}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="pages">Pages</label>
                                    <input id="pages" className={`form-control ${show && error.pages ? "is-invalid" : ""}`}
                                        type="number" name="pages" value={data.pages} onChange={getInputData} placeholder="Number of Pages" />
                                    {show && error.pages && <div className="text-danger small mt-1">{error.pages}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="publishedDate">Published Date</label>
                                    <input id="publishedDate" className="form-control" type="date" name="publishedDate"
                                        value={data.publishedDate ? new Date(data.publishedDate).toISOString().split("T")[0] : ""}
                                        onChange={getInputData} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="stock">Stock</label>
                                    <input id="stock" className={`form-control ${show && error.stock ? "is-invalid" : ""}`}
                                        type="number" name="stock" value={data.stock} onChange={getInputData} placeholder="Available Quantity" />
                                    {show && error.stock && <div className="text-danger small mt-1">{error.stock}</div>}
                                </div>

                                {/* ── Per-Format Pricing ──────────────────────────────────── */}
                                <div className="col-12">
                                    <label className="form-label fw-semibold mb-2 d-block">
                                        Format &amp; Pricing
                                        <span className="text-muted fw-normal small ms-2">Select formats and set individual prices</span>
                                    </label>
                                    {show && error.formatPricing && (
                                        <div className="text-danger small mb-2">{error.formatPricing}</div>
                                    )}
                                    <div className="row g-3">
                                        {FORMAT_OPTIONS.map(fmt => {
                                            const fp = data.formatPricing[fmt]
                                            const finalPrice = fp.selected && fp.price
                                                ? computeFinalPrice(fp.price, fp.discount)
                                                : null
                                            const badgeColor = fmt === "Paperback" ? "#0d6efd" : fmt === "Hardcover" ? "#6f42c1" : "#198754"
                                            return (
                                                <div key={fmt} className="col-md-4">
                                                    <div className={`card border-2 h-100 ${fp.selected ? 'border-primary' : 'border-secondary'}`}
                                                        style={{ opacity: fp.selected ? 1 : 0.6 }}>
                                                        <div className="card-header d-flex align-items-center gap-2 py-2"
                                                            style={{ backgroundColor: fp.selected ? badgeColor + "18" : "#f8f9fa" }}>
                                                            <input
                                                                className="form-check-input mt-0"
                                                                type="checkbox"
                                                                id={`update-fmt-${fmt}`}
                                                                checked={fp.selected}
                                                                onChange={() => toggleFormat(fmt)}
                                                            />
                                                            <label htmlFor={`update-fmt-${fmt}`}
                                                                className="form-check-label fw-semibold mb-0"
                                                                style={{ cursor: "pointer", color: badgeColor }}>
                                                                {fmt}
                                                            </label>
                                                            {fmt === "Ebook" && (
                                                                <span className="badge bg-success ms-auto small">Higher discount</span>
                                                            )}
                                                        </div>
                                                        <div className="card-body py-2">
                                                            <div className="mb-2">
                                                                <label className="form-label small mb-1">
                                                                    Price (₹){fp.selected && "*"}
                                                                </label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    placeholder="0.00"
                                                                    disabled={!fp.selected}
                                                                    value={fp.price}
                                                                    onChange={e => updateFormatField(fmt, "price", e.target.value)}
                                                                    className="form-control form-control-sm border-2"
                                                                />
                                                            </div>
                                                            <div className="mb-2">
                                                                <label className="form-label small mb-1">Discount (%)</label>
                                                                <input
                                                                    type="number"
                                                                    min="0"
                                                                    max="100"
                                                                    placeholder="0"
                                                                    disabled={!fp.selected}
                                                                    value={fp.discount}
                                                                    onChange={e => updateFormatField(fmt, "discount", e.target.value)}
                                                                    className="form-control form-control-sm border-2"
                                                                />
                                                            </div>
                                                            {fp.selected && fp.price && (
                                                                <div className="text-end">
                                                                    <span className="text-muted small text-decoration-line-through me-1">
                                                                        ₹{parseFloat(fp.price).toFixed(2)}
                                                                    </span>
                                                                    <span className="fw-bold" style={{ color: badgeColor }}>
                                                                        ₹{finalPrice.toFixed(2)}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                <div className="col-12">
                                    <label className="form-label" htmlFor="description">Description</label>
                                    <ReactQuill
                                        id="description"
                                        theme="snow"
                                        value={data.description}
                                        onChange={getDescriptionData}
                                        modules={quillModules}
                                        className="book-description-editor"
                                        placeholder="Write a description for this book..."
                                    />
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="pic">
                                        Cover Image <span className="text-muted fw-normal">(leave blank to keep existing)</span>
                                    </label>
                                    <input id="pic" className="form-control" type="file" name="pic" onChange={getInputData} accept="image/*" />
                                    {data.pic && typeof data.pic !== "string" && (
                                        <div className="mt-2">
                                            <small className="text-muted">New cover:</small><br />
                                            <img src={URL.createObjectURL(data.pic)} height={80} alt="new cover" className="rounded border mt-1" />
                                        </div>
                                    )}
                                    {oldPic && (
                                        <div className="mt-2">
                                            <small className="text-muted">Current cover:</small><br />
                                            <img src={oldPic} height={80} alt="current cover" className="rounded border mt-1" />
                                        </div>
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="images">
                                        Additional Images <span className="text-muted fw-normal">(leave blank to keep existing)</span>
                                    </label>
                                    <input id="images" className="form-control" type="file" name="images"
                                        onChange={getInputData} accept="image/*" multiple />
                                    {data.images.length > 0 && (
                                        <div className="mt-2">
                                            <small className="text-muted">New images:</small>
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {data.images.map((img, i) => (
                                                    <img key={i} src={URL.createObjectURL(img)} height={60} width={60}
                                                        alt={`new-${i}`} className="rounded border" style={{ objectFit: "cover" }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                    {oldImages.length > 0 && (
                                        <div className="mt-2">
                                            <small className="text-muted">Current images:</small>
                                            <div className="d-flex flex-wrap gap-2 mt-1">
                                                {oldImages.map((img, i) => (
                                                    <img key={i} src={img} height={60} width={60}
                                                        alt={`existing-${i}`} className="rounded border" style={{ objectFit: "cover" }} />
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {data.formatPricing.Ebook.selected && (
                                    <div className="col-md-6">
                                        <label className="form-label" htmlFor="ebookFile">
                                            Ebook PDF <span className="text-muted fw-normal">(leave blank to keep existing)</span>
                                        </label>
                                        <input id="ebookFile" className="form-control" type="file" name="ebookFile"
                                            onChange={getInputData} accept="application/pdf" />
                                        {data.ebookFile && typeof data.ebookFile !== "string" && (
                                            <div className="text-success small mt-1">
                                                <i className="bi bi-check-circle me-1"></i>New file: {data.ebookFile.name}
                                            </div>
                                        )}
                                        {data.ebookFile && typeof data.ebookFile === "string" && (
                                            <div className="text-muted small mt-1">
                                                <i className="bi bi-file-earmark-pdf me-1"></i>
                                                Current: {data.ebookFile.split("/").pop()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="featured">Featured</label>
                                    <select id="featured" className="form-select" name="featured"
                                        value={data.featured ? "1" : "0"} onChange={getInputData}>
                                        <option value="0">No</option>
                                        <option value="1">Yes</option>
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="active">Status</label>
                                    <select id="active" className="form-select" name="active"
                                        value={data.active ? "1" : "0"} onChange={getInputData}>
                                        <option value="1">Active</option>
                                        <option value="0">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            <div className="d-flex flex-wrap justify-content-end gap-2 mt-4">
                                <Link className="btn btn-outline-secondary" to="/book">Cancel</Link>
                                <button className="btn btn-primary" type="button" onClick={postSubmit}>
                                    <i className="bi bi-check-circle" aria-hidden="true"></i> Update Book
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
    )
}