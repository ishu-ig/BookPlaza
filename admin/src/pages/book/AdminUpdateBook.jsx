import React, { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { updateBook, getBook } from "../../Redux/ActionCreartors/BookActionCreators"
import { getCategory } from "../../Redux/ActionCreartors/CategoryActionCreators"
import { getSubcategory } from "../../Redux/ActionCreartors/SubcategoryActionCreators"
import { getPublisher } from "../../Redux/ActionCreartors/PublisherActionCreators"

const FORMAT_OPTIONS = ["Paperback", "Hardcover", "Ebook"]

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
    const refdiv   = useRef(null)
    const rteRef   = useRef(null)
    const rteReady = useRef(false)

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

        // ── FIX: handle ebookFile separately — skip imageValidator for PDFs ──
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
        formData.append("description",   rteRef.current ? rteRef.current.getHTMLCode() : "")

        // Cover image — only append if a new file was chosen
        if (data.pic && typeof data.pic !== "string") {
            formData.append("pic", data.pic)
        }

        // Additional images — only append if new files were chosen
        data.images.forEach(img => formData.append("images", img))

        // ── FIX: only append ebookFile when it's an actual new File object ────
        // Do NOT append the old string path — backend keeps existing if absent
        if (data.formatPricing.Ebook.selected && data.ebookFile && typeof data.ebookFile !== "string") {
            formData.append("ebookFile", data.ebookFile)
        }

        dispatch(updateBook(formData))
        navigate("/book")
    }

    function initRTE(html = "") {
        if (!refdiv.current || !window.RichTextEditor) return
        if (rteRef.current && typeof rteRef.current.destroy === "function") {
            rteRef.current.destroy()
            rteRef.current = null
        }
        rteRef.current = new window.RichTextEditor(refdiv.current)
        rteRef.current.setHTMLCode(html)
        rteReady.current = true
    }

    useEffect(() => {
        return () => {
            if (rteRef.current && typeof rteRef.current.destroy === "function") {
                rteRef.current.destroy()
            }
            rteRef.current   = null
            rteReady.current = false
        }
    }, [])

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
                    formatPricing: buildFormatPricingState(item.formatPricing || []),
                })
                setOldPic(item.pic || "")
                setOldImages(item.images || [])
                setTimeout(() => initRTE(item.description || ""), 0)
            }
        }
    }, [BookStateData.length])

    return (
        <div>
            <h5 className="bg-primary text-light text-center p-2">
                Update Book
                <Link to="/book"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link>
            </h5>

            <div className="card mt-3 shadow-sm p-4">
                <form onSubmit={postSubmit}>

                    {/* Title */}
                    <div className="mb-3">
                        <label>Title*</label>
                        <input type="text" name="title" value={data.title} onChange={getInputData} placeholder="Book Title"
                            className={`form-control border-3 ${show && error.title ? 'border-danger' : 'border-primary'}`} />
                        {show && error.title && <p className="text-danger text-capitalize">{error.title}</p>}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Author*</label>
                            <input type="text" name="author" value={data.author} onChange={getInputData} placeholder="Author Name"
                                className={`form-control border-3 ${show && error.author ? 'border-danger' : 'border-primary'}`} />
                            {show && error.author && <p className="text-danger text-capitalize">{error.author}</p>}
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>ISBN*</label>
                            <input type="text" name="isbn" value={data.isbn} onChange={getInputData} placeholder="ISBN"
                                className={`form-control border-3 ${show && error.isbn ? 'border-danger' : 'border-primary'}`} />
                            {show && error.isbn && <p className="text-danger text-capitalize">{error.isbn}</p>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Category*</label>
                            <select name="category"
                                value={typeof data.category === "object" ? data.category._id : data.category}
                                onChange={getInputData} className="form-select border-3 border-primary">
                                {CategoryStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Subcategory*</label>
                            <select name="subcategory"
                                value={typeof data.subcategory === "object" ? data.subcategory._id : data.subcategory}
                                onChange={getInputData} className="form-select border-3 border-primary">
                                {SubcategoryStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Publisher*</label>
                            <select name="publisher"
                                value={typeof data.publisher === "object" ? data.publisher._id : data.publisher}
                                onChange={getInputData} className="form-select border-3 border-primary">
                                {PublisherStateData.filter(x => x.active).map(item => (
                                    <option key={item._id} value={item._id}>{item.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-lg-3 col-md-6 mb-3">
                            <label>Language*</label>
                            <input type="text" name="language" value={data.language} onChange={getInputData} placeholder="e.g. English"
                                className={`form-control border-3 ${show && error.language ? 'border-danger' : 'border-primary'}`} />
                            {show && error.language && <p className="text-danger text-capitalize">{error.language}</p>}
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label>Pages*</label>
                            <input type="number" name="pages" value={data.pages} onChange={getInputData} placeholder="Number of Pages"
                                className={`form-control border-3 ${show && error.pages ? 'border-danger' : 'border-primary'}`} />
                            {show && error.pages && <p className="text-danger text-capitalize">{error.pages}</p>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Published Date</label>
                            <input type="date" name="publishedDate"
                                value={data.publishedDate ? new Date(data.publishedDate).toISOString().split("T")[0] : ""}
                                onChange={getInputData} className="form-control border-3 border-primary" />
                        </div>
                        <div className="col-md-4 mb-3">
                            <label>Stock*</label>
                            <input type="number" name="stock" value={data.stock} onChange={getInputData} placeholder="Available Quantity"
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

                    {/* Description RTE */}
                    <div className="mb-3">
                        <label>Description*</label>
                        <div ref={refdiv} className="border-3 border-primary"></div>
                    </div>

                    <div className="row">
                        {/* Cover Image */}
                        <div className="col-md-6 mb-3">
                            <label>Cover Image <span className="text-muted small">(leave blank to keep existing)</span></label>
                            <input type="file" name="pic" onChange={getInputData} accept="image/*"
                                className="form-control border-3 border-primary" />
                            {data.pic && typeof data.pic !== "string" && (
                                <div className="mt-2">
                                    <small className="text-muted">New cover:</small><br />
                                    <img src={URL.createObjectURL(data.pic)} height={80}
                                        alt="new cover" className="rounded border mt-1" />
                                </div>
                            )}
                            {oldPic && (
                                <div className="mt-2">
                                    <small className="text-muted">Current cover:</small><br />
                                    <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${oldPic}`}
                                        height={80} alt="current cover" className="rounded border mt-1" />
                                </div>
                            )}
                        </div>

                        {/* Additional Images */}
                        <div className="col-md-6 mb-3">
                            <label>Additional Images <span className="text-muted small">(leave blank to keep existing)</span></label>
                            <input type="file" name="images" onChange={getInputData} accept="image/*" multiple
                                className="form-control border-3 border-primary" />
                            {data.images.length > 0 && (
                                <div className="mt-2">
                                    <small className="text-muted">New images:</small>
                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                        {data.images.map((img, i) => (
                                            <img key={i} src={URL.createObjectURL(img)}
                                                height={60} width={60} alt={`new-${i}`}
                                                className="rounded border object-fit-cover" />
                                        ))}
                                    </div>
                                </div>
                            )}
                            {oldImages.length > 0 && (
                                <div className="mt-2">
                                    <small className="text-muted">Current images:</small>
                                    <div className="d-flex flex-wrap gap-2 mt-1">
                                        {oldImages.map((img, i) => (
                                            <img key={i}
                                                src={`${process.env.REACT_APP_BACKEND_SERVER}/${img}`}
                                                height={60} width={60} alt={`existing-${i}`}
                                                className="rounded border object-fit-cover" />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Ebook PDF — only shown when Ebook format is selected */}
                        {data.formatPricing.Ebook.selected && (
                            <div className="col-md-6 mb-3">
                                <label>Ebook PDF <span className="text-muted small">(leave blank to keep existing)</span></label>
                                <input type="file" name="ebookFile" onChange={getInputData} accept="application/pdf"
                                    className="form-control border-3 border-primary" />

                                {/* Show newly selected file name */}
                                {data.ebookFile && typeof data.ebookFile !== "string" && (
                                    <p className="text-success small mt-1">
                                        <i className="fa fa-check-circle me-1"></i>
                                        New file: {data.ebookFile.name}
                                    </p>
                                )}

                                {/* Show existing file path from DB */}
                                {data.ebookFile && typeof data.ebookFile === "string" && (
                                    <p className="text-muted small mt-1">
                                        <i className="fa fa-file-pdf-o me-1"></i>
                                        Current: {data.ebookFile.split("/").pop()}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="row">
                        <div className="col-md-6 mb-3">
                            <label>Featured</label>
                            <select name="featured" value={data.featured ? "1" : "0"} onChange={getInputData}
                                className="form-select border-3 border-primary">
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>
                        <div className="col-md-6 mb-3">
                            <label>Active</label>
                            <select name="active" value={data.active ? "1" : "0"} onChange={getInputData}
                                className="form-select border-3 border-primary">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary w-100 text-light">Update</button>
                    </div>

                </form>
            </div>
        </div>
    )
}