"use client"
import React, { useEffect } from 'react'
import Fact from '../Components/Fact'
import About from '../Components/About'
import Features from '../Components/Features'
import Book from '../Components/Book'
import BookSlider from '../Components/BookSlider'
import Testimonial from '../Components/Testimonial'
import CategorySlider from '../Components/CategorySlider'

import { getCategory } from "../Redux/ActionCreartors/CategoryActionCreators"
import { getSubcategory } from "../Redux/ActionCreartors/SubcategoryActionCreators"
import { getPublisher } from "../Redux/ActionCreartors/PublisherActionCreators"
import { getBook } from "../Redux/ActionCreartors/BookActionCreators"
import { useDispatch, useSelector } from 'react-redux'
import Link from 'next/link'
import { getBanner } from '../Redux/ActionCreartors/BannerActionCreators'

export default function Home() {
    let BookStateData = useSelector((state) => state.BookStateData)
    let CategoryStateData = useSelector((state) => state.CategoryStateData)
    let SubcategoryStateData = useSelector((state) => state.SubcategoryStateData)
    let PublisherStateData = useSelector((state) => state.PublisherStateData)
    let BannerStateData = useSelector((state) => state.BannerStateData)

    let dispatch = useDispatch()

    useEffect(() => {
        dispatch(getCategory())
    }, [])

    useEffect(() => {
        dispatch(getSubcategory())
    }, [])

    useEffect(() => {
        dispatch(getPublisher())
    }, [])

    useEffect(() => {
        dispatch(getBook())
    }, [])

    // FIX 1: Was `dispatch(getBanner)` — missing () so it never ran.
    // FIX 2: Missing dependency array caused an infinite re-render loop.
    useEffect(() => {
        dispatch(getBanner())
    }, [])

    console.log(BookStateData)

    return (
        <>
            {/* Carousel Start */}
            <div className="container-fluid px-0">
                <div id="carouselId" className="carousel slide" data-bs-ride="carousel">
                    <ol className="carousel-indicators">
                        {BannerStateData.map((_, index) => (
                            // FIX 3: was data-bs-slide-href, correct attribute is data-bs-slide-to
                            <li
                                key={index}
                                data-bs-target="#carouselId"
                                data-bs-slide-to={index}
                                className={index === 0 ? "active" : ""}
                                aria-current={index === 0 ? "true" : undefined}
                                aria-label={`Slide ${index + 1}`}
                            ></li>
                        ))}
                    </ol>
                    <div className="carousel-inner" role="listbox">
                        {BannerStateData.map((item, index) => (
                            // FIX 4: Only the first item should have "active" class
                            <div key={index} className={`carousel-item ${index === 0 ? "active" : ""}`}>
                                <img
                                    src={`${process.env.NEXT_PUBLIC_SERVER}/${item.pic}`}
                    alt={item.name}
                    loading="lazy"
                                    style={{ height: 580 }}
                                    className="w-100"
                                    // alt={item.title || `Banner ${index + 1}`}
                                />
                                <div className="carousel-caption">
                                    <div className="container carousel-content">
                                        <h6 className="text-secondary h4 animated fadeInUp">Best Ecommerce Shopping Platform</h6>
                                        <h1 className="text-white display-5 mb-4 animated fadeInRight text-capitalize">{item.title}</h1>
                                        <Link href="/shop?mc=Male" className="ms-2">
                                            <button type="button" className="px-4 py-sm-3 px-sm-5 btn btn-primary rounded-pill carousel-content-btn2 animated fadeInRight">
                                                Shop Now
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselId" data-bs-slide="prev">
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                    </button>
                    <button className="carousel-control-next" type="button" data-bs-target="#carouselId" data-bs-slide="next">
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                    </button>
                </div>
            </div>
            {/* Carousel End */}

            <Fact />
            <CategorySlider title="Category" data={CategoryStateData.filter(x => x.active)} />
            <About title="Home" />
            <CategorySlider title="Subcategory" data={SubcategoryStateData.filter(x => x.active)} />
            <Features />
            {CategoryStateData.filter(x => x.active).map((item) => {
  const books = BookStateData.filter(x => {
    if (!x.active) return false;

    const cat = x.Category || x.category; // ✅ handle lowercase

    if (!cat) return false;

    // ✅ handle both populated object AND raw ID string
    if (typeof cat === "object") return cat.name === item.name || cat._id === item._id;
    if (typeof cat === "string") return cat === item._id?.toString();

    return false;
  }).slice(0, 6);

  return (
    <Book
      key={item._id || item.name}
      title={item.name}
      data={books}
    />
  );
})}
            <BookSlider data={BookStateData.filter(x => x.active)} />
            <CategorySlider title="Publisher" data={PublisherStateData.filter(x => x.active)} />
            <Testimonial />
        </>
    )
}