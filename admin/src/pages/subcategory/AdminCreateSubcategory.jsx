import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import formValidator from "../../FormValidators/formValidator"
import imageValidator from "../../FormValidators/imageValidator"
import { createSubcategory, getSubcategory } from '../../Redux/ActionCreartors/SubcategoryActionCreators'
import { getCategory } from "../../Redux/ActionCreartors/CategoryActionCreators"

export default function AdminCreateSubcategory() {
    let [data, setData] = useState({
        name: "",
        pic: "",
        category: "",
        active: true
    })
    let [error, setError] = useState({
        name: "Name Field is Mendatory",
        pic: "Pic Field is Mendatory"
    })
    let [show, setShow] = useState(false)
    let navigate = useNavigate()


    let SubcategoryStateData = useSelector(state => state.SubcategoryStateData)
    let CategoryStateData = useSelector(state => state.CategoryStateData)
    let dispatch = useDispatch()

    function getInputData(e) {
        let name = e.target.name
        let value = e.target.files ? e.target.files[0] : e.target.value  //in case of real backend
        // let value = e.target.files ? "Food_subcategory/" + e.target.files[0].name : e.target.value

        if (name !== "active") {
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
            let item = SubcategoryStateData.find(x => x.name.toLocaleLowerCase() === data.name.toLocaleLowerCase() && x.category === data.category)
            console.log(item)
            if (item) {
                setShow(true)
                setError((old) => {
                    return {
                        ...old,
                        "name": "Subcategory With This Category Already Exist"
                    }
                })
            }
            else {
                // dispatch(createSubcategory({ 
                //     ...data ,
                //     'category': data.category ? data.category : CategoryStateData[0].name,
                // }))

                //in case of real backend and form has a file field
                let formData = new FormData()
                formData.append("name",data.name)
                formData.append("category", data.category ? data.category : CategoryStateData[0]._id)
                formData.append("pic",data.pic)
                formData.append("active",data.active)
                dispatch(createSubcategory(formData))

                navigate("/subcategory")
            }
        }
    }

    useEffect(() => {
        (() => {
            dispatch(getCategory())
        })()
    }, [CategoryStateData.length])
    useEffect(() => {
        (() => {
            dispatch(getSubcategory())
        })()
    }, [SubcategoryStateData.length])
    return (
        <>
            <div className="container">
                <h5 className="text-center text-light bg-primary p-2">Create Subcategory <Link to="/subcategory"><i className="fa fa-arrow-left text-light float-end pt-1"></i></Link></h5>
                {/* Form */}
                <div className="card mt-3 shadow-sm p-4">
                    <form onSubmit={postSubmit}>
                        {/* Name Field */}
                        <div className="mb-3">
                            <label className="fw-bold">Name*</label>
                            <input
                                type="text"
                                name="name"
                                onChange={getInputData}
                                placeholder="Enter Subcategory Name"
                                className={`form-control ${show && error.name ? 'border-danger' : 'border-primary'}`}
                            />
                            {show && error.name && <p className="text-danger mt-1">{error.name}</p>}
                        </div>
                        <div className='mb-3'>
                            <label className="fw-bold">category*</label>
                            <select name="category" onChange={getInputData} className='form-select border-primary'>
                                {CategoryStateData && CategoryStateData.filter((x) => x.active).map((item) => {
                                    // return <option key={item.id}>{item.name}</option>
                                    return <option key={item._id} value={item._id}>{item.name}</option>
                                })}
                            </select>
                        </div>

                        {/* File Upload & Active Status */}
                        <div className="row">
                            {/* File Upload */}
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold">Upload Picture*</label>
                                <input
                                    type="file"
                                    name="pic"
                                    onChange={getInputData}
                                    className={`form-control ${show && error.pic ? 'border-danger' : 'border-primary'}`}
                                />
                                {show && error.pic && <p className="text-danger mt-1">{error.pic}</p>}
                            </div>

                            {/* Active Status */}
                            <div className="col-md-6 mb-3">
                                <label className="fw-bold">Active</label>
                                <select
                                    name="active"
                                    onChange={getInputData}
                                    className="form-select border-primary"
                                >
                                    <option value="1">Yes</option>
                                    <option value="0">No</option>
                                </select>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="mb-3">
                            <button type="submit" className="btn btn-primary w-100 text-light">
                                <i className="fa fa-save"></i> Create Category
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    )
}
