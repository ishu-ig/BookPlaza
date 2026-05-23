import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import formValidator from '../../FormValidators/formValidator'
import imageValidator from '../../FormValidators/imageValidator'

import { getPublisher, updatePublisher } from "../../Redux/ActionCreartors/PublisherActionCreators"

export default function AdminUpdatePublisher() {
    const { _id }  = useParams()
    const navigate = useNavigate()

    const [data, setData] = useState({
        name:         "",
        address:      "",
        email: "",
        phone:        "",
        website:      "",
        logo:         "",
        active:       true,
    })
    const [error, setError] = useState({
        name: "",
        logo:  "",
    })
    const [show, setShow] = useState(false)

    const PublisherStateData = useSelector(state => state.PublisherStateData)
    const dispatch           = useDispatch()

    function getInputData(e) {
        const { name } = e.target
        const value    = e.target.files ? e.target.files[0] : e.target.value

        if (name !== "active") {
            setError(old => ({
                ...old,
                [name]: e.target.files ? imageValidator(e) : formValidator(e),
            }))
        }
        setData(old => ({
            ...old,
            [name]: name === "active" ? (value === "1" ? true : false) : value,
        }))
    }

    function postSubmit(e) {
        e.preventDefault()
        const errorItem = Object.values(error).find(x => x !== "")
        if (errorItem) {
            setShow(true)
        } else {
            const duplicate = PublisherStateData.find(
                x => x._id !== _id && x.name.toLowerCase() === data.name.toLowerCase()
            )
            if (duplicate) {
                setShow(true)
                setError(old => ({ ...old, name: "Publisher Already Exists" }))
            } else {
                const formData = new FormData()
                formData.append("_id",          data._id)
                formData.append("name",         data.name)
                formData.append("address",      data.address)
                formData.append("email", data.email)
                formData.append("phone",        data.phone)
                formData.append("website",      data.website)
                formData.append("logo",         data.logo)
                formData.append("active",       data.active)
                dispatch(updatePublisher(formData))
                navigate("/publisher")
            }
        }
    }

    useEffect(() => {
        dispatch(getPublisher())
        if (PublisherStateData.length) {
            const item = PublisherStateData.find(x => x._id === _id)
            if (item) setData({ ...item })
        }
    }, [PublisherStateData.length])

    return (
        <div className="container">
            <h5 className="text-center text-light bg-primary p-2">
                Update Publisher
                <Link to="/publisher"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link>
            </h5>

            <div className="card mt-3 shadow-sm p-4">
                <form onSubmit={postSubmit}>

                    {/* Name */}
                    <div className="mb-3">
                        <label>Name</label>
                        <input
                            type="text" name="name" value={data.name} onChange={getInputData}
                            placeholder="Publisher Name"
                            className={`form-control border-3 ${show && error.name ? 'border-danger' : 'border-primary'}`}
                        />
                        {show && error.name && <p className="text-danger text-capitalize">{error.name}</p>}
                    </div>

                    {/* Address */}
                    <div className="mb-3">
                        <label>Address</label>
                        <input
                            type="text" name="address" value={data.address} onChange={getInputData}
                            placeholder="Address"
                            className="form-control border-3 border-primary"
                        />
                    </div>

                    <div className="row">
                        {/* Contact Email */}
                        <div className="col-md-6 mb-3">
                            <label>Contact Email</label>
                            <input
                                type="email" name="email" value={data.email} onChange={getInputData}
                                placeholder="contact@publisher.com"
                                className="form-control border-3 border-primary"
                            />
                        </div>

                        {/* Phone */}
                        <div className="col-md-6 mb-3">
                            <label>Phone</label>
                            <input
                                type="text" name="phone" value={data.phone} onChange={getInputData}
                                placeholder="Phone Number"
                                className="form-control border-3 border-primary"
                            />
                        </div>
                    </div>

                    <div className="row">
                        {/* Website */}
                        <div className="col-md-6 mb-3">
                            <label>Website</label>
                            <input
                                type="text" name="website" value={data.website} onChange={getInputData}
                                placeholder="https://publisher.com"
                                className="form-control border-3 border-primary"
                            />
                        </div>

                        {/* Active */}
                        <div className="col-md-6 mb-3">
                            <label>Active</label>
                            <select name="active" value={data.active ? "1" : "0"} onChange={getInputData} className="form-select border-3 border-primary">
                                <option value="1">Yes</option>
                                <option value="0">No</option>
                            </select>
                        </div>
                    </div>

                    {/* Logo — no value; file inputs are uncontrolled */}
                    <div className="mb-3">
                        <label>Logo <span className="text-muted small">(leave blank to keep existing)</span></label>
                        <input
                            type="file" name="logo" onChange={getInputData}
                            className={`form-control border-3 ${show && error.logo ? 'border-danger' : 'border-primary'}`}
                        />
                        {show && error.logo && <p className="text-danger text-capitalize">{error.logo}</p>}
                        {data.logo && typeof data.logo === "string" &&
                            <img
                                src={`${process.env.REACT_APP_BACKEND_SERVER}/${data.logo}`}
                                height={60} alt="Current logo" className="mt-2 rounded"
                            />
                        }
                    </div>

                    <div className="mb-3">
                        <button type="submit" className="btn btn-primary w-100 text-light">Update</button>
                    </div>

                </form>
            </div>
        </div>
    )
}