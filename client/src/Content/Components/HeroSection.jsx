import Link from 'next/link'
import React from 'react'


export default function HeroSection({title}) {
  return (
    <>
        {/* Page Header Start */}
        <div className="container-fluid page-header py-5">
            <div className="container text-center py-5">
                <h1 className="display-2 text-white mb-4 animated slideInDown">{title}</h1>
                <nav aria-label="breadcrumb animated slideInDown">
                    <ol className="breadcrumb justify-content-center mb-0">
                        <li className="breadcrumb-item"><Link href="/">Home</Link></li>
                        <li className="breadcrumb-item" aria-current="page">{title}</li>
                    </ol>
                </nav>
            </div>
        </div>
        {/* Page Header End */}
    </>
  )
}
