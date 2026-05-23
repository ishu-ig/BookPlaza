// src/Content/pages/AboutPage.jsx
import React from 'react'
import About from '../Components/About'
import Fact from '../Components/Fact'
import Testimonial from '../Components/Testimonial'
// import HeroSection from '../Components/HeroSection'

export default function AboutPage() {
  return (
    <>
      {/* <HeroSection title="About Us" /> */}
      <About title={null} />
      <Fact />
      <Testimonial />
    </>
  )
}