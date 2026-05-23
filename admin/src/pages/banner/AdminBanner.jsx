import React, { useEffect, useState } from 'react'

import { Link } from 'react-router-dom'

import { useDispatch, useSelector } from 'react-redux';

import $ from 'jquery';                                         // Import jQuery
import 'datatables.net-dt/css/dataTables.dataTables.min.css';   // Import DataTables styles
import 'datatables.net';

import { deleteBanner, getBanner } from "../../Redux/ActionCreartors/BannerActionCreators"

export default function AdminBanner() {
    let BannerStateData = useSelector(state => state.BannerStateData)
    let dispatch = useDispatch()

    function deleteRecord(_id) {
        if (window.confirm("Are You Sure to Delete that Item : ")) {
            dispatch(deleteBanner({ _id: _id }))
            getAPIData()
        }
    }

    function getAPIData() {
        dispatch(getBanner())
        let time = setTimeout(() => {
            $('#DataTable').DataTable()
        }, 500)
        return time
    }

    useEffect(() => {
        let time = getAPIData()
        return () => clearTimeout(time)
    }, [BannerStateData.length])

    return (
        <>
            <div className="container-fluid">
                {/* Header */}
                <h5 className="text-center text-light bg-primary p-3">
                    Banner
                    <Link to="/banner/create">
                        <i className="fa fa-plus text-light float-end pt-1"></i>
                    </Link>
                </h5>
                {/* Table */}
                <div className="table-responsive mt-3">
                    <table id='DataTable' className="table table-striped table-hover table-bordered text-center">
                        <thead className="text-light" style={{ backgroundColor: "#1F2A40" }}>
                            <tr>
                                <th>Id</th>
                                <th>Title</th>
                                <th>Image</th>
                                <th>Link</th>
                                <th>Active</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                BannerStateData.map((item) => {
                                    return <tr key={item._id}>
                                        <td>{item._id}</td>
                                        <td>{item.title}</td>
                                        <td>
                                            <Link to={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`} target='_blank' rel='noreferrer'>
                                                <img src={`${process.env.REACT_APP_BACKEND_SERVER}/${item.pic}`} height={50} width={80} alt="" />
                                            </Link>
                                        </td>
                                        <td>
                                            {item.link
                                                ? <a href={item.link} target='_blank' rel='noreferrer'>{item.link}</a>
                                                : <span className="text-muted">N/A</span>
                                            }
                                        </td>
                                        <td className={`${item.active ? 'text-success' : 'text-danger'}`}>
                                            {item.active ? "Yes" : "No"}
                                        </td>
                                        <td>
                                            <Link to={`/banner/update/${item._id}`} className='btn btn-primary text-light'>
                                                <i className='fa fa-edit fs-4'></i>
                                            </Link>
                                        </td>
                                        <td>
                                            <button className='btn btn-danger' onClick={() => deleteRecord(item._id)}>
                                                <i className='fa fa-trash fs-4'></i>
                                            </button>
                                        </td>
                                    </tr>
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}