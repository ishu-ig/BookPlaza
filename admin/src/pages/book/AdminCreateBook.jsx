import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import ReactQuill from "react-quill-new"
import "react-quill-new/dist/quill.snow.css"

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { createBook } from "../../Redux/ActionCreators/BookActionCreators"
import { getCategory } from "../../Redux/ActionCreators/CategoryActionCreators"
import { getSubcategory } from "../../Redux/ActionCreators/SubcategoryActionCreators"
import { getPublisher } from "../../Redux/ActionCreators/PublisherActionCreators"

const FORMAT_OPTIONS = ["Paperback", "Hardcover", "Ebook"]

// Default discount suggestions per format (admin can override)
const DEFAULT_DISCOUNTS = { Paperback: 0, Hardcover: 0, Ebook: 20 }

const checklist = [
    { dot: "bg-success", title: "Title & details",   body: "Add title, author, ISBN, category, and publisher."   },
    { dot: "bg-primary", title: "Set format pricing", body: "Pick at least one format and set its price."          },
    { dot: "bg-warning", title: "Upload files",       body: "Add a cover image, gallery photos, and an ebook PDF if needed." },
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

export default function AdminCreateBook() {
    const navigate = useNavigate()
    const dispatch = useDispatch()

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
            Paperback: { selected: false, price: "", discount: DEFAULT_DISCOUNTS.Paperback },
            Hardcover: { selected: false, price: "", discount: DEFAULT_DISCOUNTS.Hardcover },
            Ebook:     { selected: false, price: "", discount: DEFAULT_DISCOUNTS.Ebook     },
        },
    })

    const [error, setError] = useState({
        title:         "Title is Mandatory",
        author:        "Author is Mandatory",
        isbn:          "ISBN is Mandatory",
        language:      "Language is Mandatory",
        pages:         "Pages is Mandatory",
        stock:         "Stock is Mandatory",
        pic:           "Pic is Mandatory",
        formatPricing: "Select at least one format",
    })

    const [show, setShow] = useState(false)

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

        // ── Handle ebookFile separately — skip imageValidator for PDFs ──
        if (name === "ebookFile") {
            const file = e.target.files?.[0] || ""
            setError(old => ({ ...old, ebookFile: file ? "" : "Ebook PDF is required" }))
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

        // Ebook PDF required when Ebook format is selected
        const ebookSelected = data.formatPricing.Ebook.selected
        if (ebookSelected && !data.ebookFile) {
            activeErrors.ebookFile = "Ebook PDF is required"
        } else {
            delete activeErrors.ebookFile
        }

        // Validate that selected formats all have a price
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

        // Build formatPricing array for the backend
        const formatPricingArray = FORMAT_OPTIONS
            .filter(fmt => data.formatPricing[fmt].selected)
            .map(fmt => {
                const fp = data.formatPricing[fmt]
                const price      = parseFloat(fp.price)
                const discount   = parseFloat(fp.discount) || 0
                const finalPrice = computeFinalPrice(price, discount)
                return { format: fmt, price, discount, finalPrice }
            })

        const formData = new FormData()
        formData.append("title",         data.title)
        formData.append("author",        data.author)
        formData.append("isbn",          data.isbn)
        formData.append("category",      data.category    || CategoryStateData[0]?._id)
        formData.append("subcategory",   data.subcategory || SubcategoryStateData[0]?._id)
        formData.append("publisher",     data.publisher   || PublisherStateData[0]?._id)
        formData.append("language",      data.language)
        formData.append("pages",         data.pages)
        formData.append("formatPricing", JSON.stringify(formatPricingArray))
        formData.append("publishedDate", data.publishedDate)
        formData.append("stock",         data.stock)
        formData.append("featured",      data.featured)
        formData.append("active",        data.active)
        formData.append("description",   data.description)
        formData.append("pic",           data.pic)
        data.images.forEach(img => formData.append("images", img))

        // Only append ebookFile when it's an actual File object
        if (ebookSelected && data.ebookFile && typeof data.ebookFile !== "string") {
            formData.append("ebookFile", data.ebookFile)
        }

        dispatch(createBook(formData))
        navigate("/book")
    }

    useEffect(() => { dispatch(getCategory()) },    [CategoryStateData.length])
    useEffect(() => { dispatch(getSubcategory()) }, [SubcategoryStateData.length])
    useEffect(() => { dispatch(getPublisher()) },   [PublisherStateData.length])

    return (
        <main className="dashboard-content">
            <style>{descriptionEditorStyles}</style>
            <div className="container-fluid px-3 px-lg-4 py-4">

                <div className="page-heading">
                    <div className="page-heading-copy">
                        <span className="page-icon">
                            <i className="bi bi-plus-circle" aria-hidden="true"></i>
                        </span>
                        <div>
                            <p className="eyebrow mb-1">Management</p>
                            <h1 className="h3 mb-1">Add Book</h1>
                            <p className="text-muted mb-0">Create a new book with format pricing, cover, and files.</p>
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
                                    <p className="text-muted mb-0">Fill in the details to create a new book.</p>
                                </div>
                            </div>

                            <div className="row g-3">
                                <div className="col-12">
                                    <label className="form-label" htmlFor="title">Title</label>
                                    <input id="title" className={`form-control ${show && error.title ? "is-invalid" : ""}`}
                                        type="text" name="title" onChange={getInputData} placeholder="Book Title" />
                                    {show && error.title && <div className="text-danger small mt-1">{error.title}</div>}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="author">Author</label>
                                    <input id="author" className={`form-control ${show && error.author ? "is-invalid" : ""}`}
                                        type="text" name="author" onChange={getInputData} placeholder="Author Name" />
                                    {show && error.author && <div className="text-danger small mt-1">{error.author}</div>}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="isbn">ISBN</label>
                                    <input id="isbn" className={`form-control ${show && error.isbn ? "is-invalid" : ""}`}
                                        type="text" name="isbn" onChange={getInputData} placeholder="ISBN" />
                                    {show && error.isbn && <div className="text-danger small mt-1">{error.isbn}</div>}
                                </div>

                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="category">Category</label>
                                    <select id="category" className="form-select" name="category" onChange={getInputData}>
                                        {CategoryStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="subcategory">Subcategory</label>
                                    <select id="subcategory" className="form-select" name="subcategory" onChange={getInputData}>
                                        {SubcategoryStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="publisher">Publisher</label>
                                    <select id="publisher" className="form-select" name="publisher" onChange={getInputData}>
                                        {PublisherStateData.filter(x => x.active).map(item => (
                                            <option key={item._id} value={item._id}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-lg-3 col-md-6">
                                    <label className="form-label" htmlFor="language">Language</label>
                                    <input id="language" className={`form-control ${show && error.language ? "is-invalid" : ""}`}
                                        type="text" name="language" onChange={getInputData} placeholder="e.g. English" />
                                    {show && error.language && <div className="text-danger small mt-1">{error.language}</div>}
                                </div>

                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="pages">Pages</label>
                                    <input id="pages" className={`form-control ${show && error.pages ? "is-invalid" : ""}`}
                                        type="number" name="pages" onChange={getInputData} placeholder="Number of Pages" />
                                    {show && error.pages && <div className="text-danger small mt-1">{error.pages}</div>}
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="publishedDate">Published Date</label>
                                    <input id="publishedDate" className="form-control" type="date" name="publishedDate" onChange={getInputData} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label" htmlFor="stock">Stock</label>
                                    <input id="stock" className={`form-control ${show && error.stock ? "is-invalid" : ""}`}
                                        type="number" name="stock" onChange={getInputData} placeholder="Available Quantity" />
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
                                            const finalPrice = fp.selected
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
                                                                id={`create-fmt-${fmt}`}
                                                                checked={fp.selected}
                                                                onChange={() => toggleFormat(fmt)}
                                                            />
                                                            <label htmlFor={`create-fmt-${fmt}`}
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
                                    <label className="form-label" htmlFor="pic">Cover Image</label>
                                    <input id="pic" className={`form-control ${show && error.pic ? "is-invalid" : ""}`}
                                        type="file" name="pic" onChange={getInputData} accept="image/*" />
                                    {show && error.pic && <div className="text-danger small mt-1">{error.pic}</div>}
                                    {data.pic && (
                                        <img src={URL.createObjectURL(data.pic)} height={80} alt="cover preview"
                                            className="mt-2 rounded border" />
                                    )}
                                </div>

                                <div className="col-md-6">
                                    <label className="form-label" htmlFor="images">
                                        Additional Images <span className="text-muted fw-normal">(up to 10)</span>
                                    </label>
                                    <input id="images" className="form-control" type="file" name="images"
                                        onChange={getInputData} accept="image/*" multiple />
                                    {data.images.length > 0 && (
                                        <div className="d-flex flex-wrap gap-2 mt-2">
                                            {data.images.map((img, i) => (
                                                <img key={i} src={URL.createObjectURL(img)} height={60} width={60}
                                                    alt={`preview-${i}`} className="rounded border" style={{ objectFit: "cover" }} />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {data.formatPricing.Ebook.selected && (
                                    <div className="col-md-6">
                                        <label className="form-label" htmlFor="ebookFile">Ebook PDF</label>
                                        <input id="ebookFile" className={`form-control ${show && error.ebookFile ? "is-invalid" : ""}`}
                                            type="file" name="ebookFile" onChange={getInputData} accept="application/pdf" />
                                        {show && error.ebookFile && <div className="text-danger small mt-1">{error.ebookFile}</div>}
                                        {data.ebookFile && typeof data.ebookFile !== "string" && (
                                            <div className="text-success small mt-1">
                                                <i className="bi bi-check-circle me-1"></i>{data.ebookFile.name}
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
                                    <i className="bi bi-check-circle" aria-hidden="true"></i> Create Book
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-xl-4">
                        <div className="panel h-100">
                            <h2 className="h5 mb-3 section-title">
                                <i className="bi bi-list-check" aria-hidden="true"></i>
                                <span>Setup Checklist</span>
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