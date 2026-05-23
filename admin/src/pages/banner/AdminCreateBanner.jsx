import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { createBanner, getBanner } from "../../Redux/ActionCreartors/BannerActionCreators"

export default function AdminCreateBanner() {
    let [data, setData] = useState({
        title: "",
        pic: "",
        link: "",
        active: true
    })
    let [error, setError] = useState({
        title: "Title Field is Mendatory",
        pic: "Image Field is Mendatory"
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
            let item = BannerStateData.find(x => x.title.toLocaleLowerCase() === data.title.toLocaleLowerCase())
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
                formData.append("title", data.title)
                formData.append("pic", data.pic)
                formData.append("link", data.link)
                formData.append("active", data.active)
                dispatch(createBanner(formData))

                navigate("/banner")
            }
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getBanner())
        })()
    }, [BannerStateData.length])

    return (
        <>
            <div className="container">
                <h5 className="text-center text-light bg-primary p-2">
                    Create Banner
                    <Link to="/banner">
                        <i className="fa fa-arrow-left text-light float-end pt-1"></i>
                    </Link>
                </h5>
                {/* Form */}
                <div className="card mt-3 shadow-sm p-4">
                    <form onSubmit={postSubmit}>
                        <div className="mb-3">
                            <label>Title*</label>
                            <input
                                type="text"
                                name="title"
                                onChange={getInputData}
                                placeholder='Banner Title'
                                className={`form-control border-3 ${show && error.title ? 'border-danger' : 'border-primary'}`}
                            />
                            {show && error.title ? <p className='text-danger text-capitalize'>{error.title}</p> : null}
                        </div>

                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label>Image*</label>
                                <input
                                    type="file"
                                    name="pic"
                                    onChange={getInputData}
                                    className={`form-control border-3 ${show && error.image ? 'border-danger' : 'border-primary'}`}
                                />
                                {show && error.image ? <p className='text-danger text-capitalize'>{error.image}</p> : null}
                            </div>

                            <div className="col-md-6 mb-3">
                                <label>Active*</label>
                                <select name="active" onChange={getInputData} className='form-select border-3 border-primary'>
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
                                onChange={getInputData}
                                placeholder='https://example.com'
                                className='form-control border-3 border-primary'
                            />
                        </div>

                        <div className="mb-3">
                            <button type="submit" className='btn btn-primary w-100 text-light'>Create</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}