import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import $ from 'jquery'
import 'datatables.net-dt/css/dataTables.dataTables.min.css'
import 'datatables.net'

import { deletePublisher, getPublisher } from "../../Redux/ActionCreartors/PublisherActionCreators"

export default function AdminPublisher() {
    const PublisherStateData = useSelector(state => state.PublisherStateData)
    const dispatch           = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete this Publisher?")) {
            dispatch(deletePublisher({ _id }))
            getAPIData()
        }
    }

    function getAPIData() {
        dispatch(getPublisher())
        const time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }

    useEffect(() => {
        const time = getAPIData()
        return () => clearTimeout(time)
    }, [PublisherStateData.length])

    return (
        <div className="container-fluid">
            <h5 className="text-center text-light bg-primary p-3">
                Publishers
                <Link to="/publisher/create"><i className="fa fa-plus text-light float-end pt-1"></i></Link>
            </h5>

            <div className="table-responsive mt-3">
                <table id="DataTable" className="table table-striped table-hover table-bordered text-center">
                    <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                        <tr>
                            <th>Id</th>
                            <th>Name</th>
                            <th>Logo</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Website</th>
                            <th>Active</th>
                            <th></th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {PublisherStateData.map(item => (
                            <tr key={item._id}>
                                <td>{item._id}</td>
                                <td>{item.name}</td>
                                <td>
                                    {item.logo
                                        ? <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.logo}`} target="_blank" rel="noreferrer">
                                            <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.logo}`} height={50} width={80} alt={item.name} />
                                          </Link>
                                        : "—"
                                    }
                                </td>
                                <td>{item.email || "—"}</td>
                                <td>{item.phone        || "—"}</td>
                                <td>
                                    {item.website
                                        ? <a href={item.website} target="_blank" rel="noreferrer">{item.website}</a>
                                        : "—"
                                    }
                                </td>
                                <td className={item.active ? 'text-success' : 'text-danger'}>
                                    {item.active ? "Yes" : "No"}
                                </td>
                                <td>
                                    <Link to={`/publisher/update/${item._id}`} className="btn btn-primary text-light">
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