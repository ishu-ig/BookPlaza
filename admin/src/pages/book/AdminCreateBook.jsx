import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { createBook } from "../../Redux/ActionCreartors/BookActionCreators"
import { getCategory } from "../../Redux/ActionCreartors/CategoryActionCreators"
import { getSubcategory } from "../../Redux/ActionCreartors/SubcategoryActionCreators"
import { getPublisher } from "../../Redux/ActionCreartors/PublisherActionCreators"

const FORMAT_OPTIONS = ["Paperback", "Hardcover", "Ebook"]

// Default discount suggestions per format (admin can override)
const DEFAULT_DISCOUNTS = { Paperback: 0, Hardcover: 0, Ebook: 20 }

function computeFinalPrice(price, discount) {
    const p = parseFloat(price) || 0
    const d = parseFloat(discount) || 0
    return Math.round(p * (1 - d / 100) * 100) / 100
}

export default function AdminCreateBook() {
    const refdiv   = useRef(null)
    const rteRef   = useRef(null)
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

        // ── FIX: handle ebookFile separately — skip imageValidator for PDFs ──
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
        formData.append("description",   rteRef.current ? rteRef.current.getHTMLCode() : "")
        formData.append("pic",           data.pic)
        data.images.forEach(img => formData.append("images", img))

        // ── FIX: only append ebookFile when it's an actual File object ────────
        if (ebookSelected && data.ebookFile && typeof data.ebookFile !== "string") {
            formData.append("ebookFile", data.ebookFile)
        }

        dispatch(createBook(formData))
        navigate("/book")
    }

    useEffect(() => {
        if (!refdiv.current || !window.RichTextEditor) return
        const timer = setTimeout(() => {
            if (!refdiv.current || !window.RichTextEditor) return
            rteRef.current = new window.RichTextEditor(refdiv.current)
            rteRef.current.setHTMLCode("")
        }, 0)
        return () => {
            clearTimeout(timer)
            if (rteRef.current && typeof rteRef.current.destroy === "function") {
                rteRef.current.destroy()
            }
            rteRef.current = null
        }
    }, [])

    useEffect(() => { dispatch(getCategory()) },    [CategoryStateData.length])
    useEffect(() => { dispatch(getSubcategory()) }, [SubcategoryStateData.length])
    useEffect(() => { dispatch(getPublisher()) },   [PublisherStateData.length])

    return (
        <div>
            <h5 className="bg-primary text-light text-center p-2">
                Create Book
                <Link to="/book"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link>
            </h5>

            <div className="card mt-3 shadow-sm p-4">
                <form onSubmit={postSubmit}>

                    {/* Title */}
                    <div className="mb-3">
                        <label>Title*</label>
                        <input type="text" name="title" onChange={getInputData} placeholder="Book Title"
                            className={`form-control border-3 ${show && error.title ? 'border-danger' : 'border-primary'}`} />
                        {show && error.title && <p className="text-danger text-capitalize">{error.title}</p>}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Author*</label>
                            <input type="text" name="author" onChange={getInputData} placeholder="Author Name"
                                className={`form-control border-3 ${show && error.author ? 'border-danger' : 'border-primary'}`} />
                            {show && error.author && <p className="text-danger text-capitalize">{error.author}</p>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>ISBN*</label>
                            <input type="text" name="isbn" onChange={getInputData} placeholder="ISBN"
                                className={`form-control border-3 ${show && error.isbn ? 'border-danger' : 'border-primary'}`} />
                            {show && error.isbn && <p className="text-danger text-capitalize">{error.isbn}</p>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Category*</label>
                            <select name="category" onChange={getInputData} className="form-select border-3 border-primary">
                                {CategoryStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Subcategory*</label>
                            <select name="subcategory" onChange={getInputData} className="form-select border-3 border-primary">
                                {SubcategoryStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Publisher*</label>
                            <select name="publisher" onChange={getInputData} className="form-select border-3 border-primary">
                                {PublisherStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Language*</label>
                            <input type="text" name="language" onChange={getInputData} placeholder="e.g. English"
                                className={`form-control border-3 ${show && error.language ? 'border-danger' : 'border-primary'}`} />
                            {show && error.language && <p className="text-danger text-capitalize">{error.language}</p>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label>Pages*</label>
                            <input type="number" name="pages" onChange={getInputData} placeholder="Number of Pages"
                                className={`form-control border-3 ${show && error.pages ? 'border-danger' : 'border-primary'}`} />
                            {show && error.pages && <p className="text-danger text-capitalize">{error.pages}</p>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Published Date</label>
                            <input type="date" name="publishedDate" onChange={getInputData}
                                className="form-control border-3 border-primary" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Stock*</label>
                            <input type="number" name="stock" onChange={getInputData} placeholder="Available Quantity"
                                className={`form-control border-3 ${show && error.stock ? 'border-danger' : 'border-primary'}`} />
                            {show && error.stock && <p className="text-danger text-capitalize">{error.stock}</p>}
                        </div>
                    </div>

                    {/* ── Per-Format Pricing ──────────────────────────────────── */}
                    <div className="mb-3">
                        <label className="fw-semibold mb-2 d-block">
                            Format &amp; Pricing*
                            <span className="text-muted fw-normal small ms-2">Select formats and set individual prices</span>
                        </label>
                        {show && error.formatPricing && (
                            <p className="text-danger text-capitalize">{error.formatPricing}</p>
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

                    {/* Description RTE */}
                    <div className="mb-3">
                        <label>Description*</label>
                        <div ref={refdiv} className="border-3 border-primary"></div>
                    </div>

                    <div className="row">
                        {/* Cover Image */}
                        <div className="col-md-6 mb-3">
                            <label>Cover Image*</label>
                            <input type="file" name="pic" onChange={getInputData} accept="image/*"
                                className={`form-control border-3 ${show && error.pic ? 'border-danger' : 'border-primary'}`} />
                            {show && error.pic && <p className="text-danger text-capitalize">{error.pic}</p>}
                            {data.pic && (
                                <div className="mt-2">
                                    <img src={URL.createObjectURL(data.pic)} height={80} alt="cover preview"
                                        className="rounded border" />
                                </div>
                            )}
                        </div>

                        {/* Additional Images */}
                        <div className="col-md-6 mb-3">
                            <label>Additional Images <span className="text-muted small">(up to 10)</span></label>
                            <input type="file" name="images" onChange={getInputData} accept="image/*" multiple
                                className="form-control border-3 border-primary" />
                            {data.images.length > 0 && (
                                <div className="d-flex flex-wrap gap-2 mt-2">
                                    {data.images.map((img, i) => (
                                        <img key={i} src={URL.createObjectURL(img)}
                                            height={60} width={60} alt={`preview-${i}`}
                                            className="rounded border object-fit-cover" />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Ebook PDF — only shown when Ebook format is selected */}
                        {data.formatPricing.Ebook.selected && (
                            <div className="col-md-6 mb-3">
                                <label>Ebook PDF*</label>
                                <input type="file" name="ebookFile" onChange={getInputData} accept="application/pdf"
                                    className={`form-control border-3 ${show && error.ebookFile ? 'border-danger' : 'border-primary'}`} />
                                {show && error.ebookFile && <p className="text-danger text-capitalize">{error.ebookFile}</p>}
                                {data.ebookFile && typeof data.ebookFile !== "string" && (
                                    <p className="text-success small mt-1">
                                        <i className="fa fa-check-circle me-1"></i>
                                        {data.ebookFile.name}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Featured</label>
                            <select name="featured" onChange={getInputData} className="form-select border-3 border-primary">
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Active</label>
                            <select name="active" onChange={getInputData} className="form-select border-3 border-primary">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary w-100 text-light">Create</button>
                    </div>

                </form>
            </div>
        </div>
    )
}