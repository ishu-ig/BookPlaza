import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate, useParams } from 'react-router-dom'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { getBanner, updateBanner } from "../../Redux/ActionCreartors/BannerActionCreators"

export default function AdminUpdateBanner() {
    let { _id } = useParams()
    let [data, setData] = useState({
        title: "",
        image: "",
        link: "",
        active: true
    })
    let [error, setError] = useState({
        title: "",
        image: ""
    })
    let [show, setShow] = useState(false)
    let navigate = useNavigate()

    let BannerStateData = useSelector(state => state.BannerStateData)
    let dispatch = useDispatch()

    function getInputData(e) {
        let name = e.target.name
        let value = e.target.files ? e.target.files[0] : e.target.value

        if (name !== "active" && name !== "link") {
            setError((old) => {
                return {
                    ...old,
                    [name]: e.target.files ? imageValidator(e) : formValidator(e)
                }
            })
        }
        setData((old) => {
            return {
                ...old,
                [name]: name === "active" ? (value === "1" ? true : false) : value
            }
        })
    }

    function postSubmit(e) {
        e.preventDefault()
        let errorItem = Object.values(error).find(x => x !== "")
        if (errorItem)
            setShow(true)
        else {
            let item = BannerStateData.find(x => x._id !== _id && x.title.toLocaleLowerCase() === data.title.toLocaleLowerCase())
            if (item) {
                setShow(true)
                setError((old) => {
                    return {
                        ...old,
                        "title": "Banner Already Exist"
                    }
                })
            }
            else {
                // in case of real backend and form has a file field
                let formData = new FormData()
                formData.append("_id", data._id)  // use _id for MongoDB
                formData.append("title", data.title)
                formData.append("image", data.image)
                formData.append("link", data.link || "")
                formData.append("active", data.active)
                dispatch(updateBanner(formData))
                navigate("/banner")
            }
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getBanner())
            if (BannerStateData.length) {
                let item = BannerStateData.find(x => x._id === _id)
                if (item)
                    setData({ ...item })
            }
        })()
    }, [BannerStateData.length])

    return (
        <>
            <div className="container">
                <h5 className="text-center text-light bg-primary p-2">
                    Update Banner
                    <Link to="/banner">
                        <i className="fa fa-arrow-left text-light float-end pt-1"></i>
                    </Link>
                </h5>
                {/* Form */}
                <div className="card mt-3 shadow-sm p-4">
                    <form onSubmit={postSubmit}>
                        <div className="mb-3">
                            <label>Title</label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={getInputData}
                                placeholder='Banner Title'
                                className={`form-control border-3 ${show && error.title ? 'border-danger' : 'border-primary'}`}
                            />
                            {show && error.title ? <p className='text-danger text-capitalize'>{error.title}</p> : null}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Image</label>
                                <input
                                    type="file"
                                    name="image"
                                    onChange={getInputData}
                                    className={`form-control border-3 ${show && error.image ? 'border-danger' : 'border-primary'}`}
                                />
                                {show && error.image ? <p className='text-danger text-capitalize'>{error.image}</p> : null}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Active</label>
                                <select
                                    name="active"
                                    value={data.active ? "1" : "0"}
                                    onChange={getInputData}
                                    className='form-select border-3 border-primary'
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        <div className="mb-3">
                            <label>Link <span className="text-muted">(Optional)</span></label>
                            <input
                                type="text"
                                name="link"
                                value={data.link || ""}
                                onChange={getInputData}
                                placeholder='https://example.com'
                                className='form-control border-3 border-primary'
                            />
                        </div>

                        <div className="mb-3">
                            <button type="submit" className='btn btn-primary w-100 text-light'>Update</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}