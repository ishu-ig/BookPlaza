import { all } from "redux-saga/effects"

import categorySagas from "./CategorySagas"
import subcategorySagas from "./SubcategorySagas"
import publisherSagas from "./PublisherSagas"
import testimonialSagas from "./TestimonialSagas"
import bookSagas from "./BookSagas"
import cartSagas from "./CartSagas"
import wishlistSagas from "./WishlistSagas"
import checkoutSagas from "./CheckoutSagas"
import newsletterSagas from "./NewsletterSagas"
import contactUsSagas from "./ContactUsSagas"
import bannerSagas from "./BannerSagas"
export default function* RootSaga() {
    yield all([
        categorySagas(),
        subcategorySagas(),
        publisherSagas(),
        testimonialSagas(),
        bookSagas(),
        cartSagas(),
        wishlistSagas(),
        checkoutSagas(),
        newsletterSagas(),
        contactUsSagas(),
        bannerSagas()
    ])
}