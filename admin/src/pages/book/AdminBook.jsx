import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import $ from 'jquery'
import 'datatables.net-dt/css/dataTables.dataTables.min.css'
import 'datatables.net'

import { deleteBook, getBook } from "../../Redux/ActionCreartors/BookActionCreators"

const FORMAT_COLORS = {
    Paperback: { bg: "#0d6efd", label: "Paperback" },
    Hardcover: { bg: "#6f42c1", label: "Hardcover" },
    Ebook:     { bg: "#198754", label: "Ebook"     },
}

export default function AdminBook() {
    const BookStateData = useSelector(state => state.BookStateData)
    const dispatch      = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete this Book?")) {
            dispatch(deleteBook({ _id }))
            getAPIData()
        }
    }

    function getAPIData() {
        dispatch(getBook())
        const time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }

    useEffect(() => {
        const time = getAPIData()
        return () => clearTimeout(time)
    }, [BookStateData.length])

    return (
        <div>
            <h5 className="bg-primary text-light text-center p-3">
                Books
                <Link to="/book/create"><i className="fa fa-plus text-light float-end pt-1"></i></Link>
            </h5>

            <div className="table-responsive mt-3">
                <table id="DataTable" className="table table-striped table-hover table-bordered text-center">
                    <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                        <tr>
                            <th>Id</th>
                            <th>Cover</th>
                            <th>Title</th>
                            <th>Author</th>
                            <th>ISBN</th>
                            <th>Category</th>
                            <th>Subcategory</th>
                            <th>Publisher</th>
                            <th>Format / Pricing</th>
                            <th>Language</th>
                            <th>Pages</th>
                            <th>Stock</th>
                            <th>Rating</th>
                            <th>Featured</th>
                            <th>Active</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {BookStateData.map(item => (
                            <tr key={item._id}>
                                <td>{item._id}</td>
                                <td>
                                    <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`} target="_blank" rel="noreferrer">
                                        <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`}
                                            height={60} width={45} alt={item.title} />
                                    </Link>
                                </td>
                                <td>{item.title}</td>
                                <td>{item.author}</td>
                                <td>{item.isbn}</td>
                                <td>{item.category?.name}</td>
                                <td>{item.subcategory?.name}</td>
                                <td>{item.publisher?.name}</td>

                                {/* Per-format pricing cell */}
                                <td style={{ minWidth: "180px" }}>
                                    {Array.isArray(item.formatPricing) && item.formatPricing.length > 0
                                        ? item.formatPricing.map(fp => {
                                            const color = FORMAT_COLORS[fp.format]?.bg || "#6c757d"
                                            return (
                                                <div key={fp.format} className="d-flex align-items-center justify-content-between mb-1 px-1 rounded"
                                                    style={{ backgroundColor: color + "12", border: `1px solid ${color}40` }}>
                                                    <span className="badge me-1" style={{ backgroundColor: color, fontSize: "0.7rem" }}>
                                                        {fp.format}
                                                    </span>
                                                    <span className="small">
                                                        {fp.discount > 0 && (
                                                            <span className="text-muted text-decoration-line-through me-1" style={{ fontSize: "0.7rem" }}>
                                                                ₹{fp.price}
                                                            </span>
                                                        )}
                                                        <span className="fw-semibold" style={{ color }}>₹{fp.finalPrice}</span>
                                                        {fp.discount > 0 && (
                                                            <span className="badge bg-warning text-dark ms-1" style={{ fontSize: "0.65rem" }}>
                                                                -{fp.discount}%
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            )
                                        })
                                        : <span className="text-muted small">—</span>
                                    }
                                </td>

                                <td>{item.language}</td>
                                <td>{item.pages}</td>
                                <td>{item.stock}</td>
                                <td>{item.rating} &#9733; ({item.totalReviews})</td>
                                <td className={item.featured ? 'text-success' : 'text-secondary'}>
                                    {item.featured ? "Yes" : "No"}
                                </td>
                                <td className={item.active ? 'text-success' : 'text-danger'}>
                                    {item.active ? "Yes" : "No"}
                                </td>
                                <td>
                                    <Link to={`/book/update/${item._id}`} className="btn btn-primary text-light">
                                        <i className="fa fa-edit fs-4"></i>
                                    </Link>
                                </td>
                                <td>
                                    <button className="btn btn-danger" onClick={() => deleteRecord(item._id)}>
                                        <i className="fa fa-trash fs-4"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}