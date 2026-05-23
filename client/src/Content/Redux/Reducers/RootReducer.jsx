import { combineReducers } from "@reduxjs/toolkit"
import CategoryReducer from "./CategoryReducer"
import SubcategoryReducer from "./SubcategoryReducer"
import PublisherReducer from "./PublisherReducer"
import TestimonialReducer from "./TestimonialReducer"
import BookReducer from "./BookReducer"
import CartReducer from "./CartReducer"
import WishlistReducer from "./WishlistReducer"
import CheckoutReducer from "./CheckoutReducer"
import NewsletterReducer from "./NewsletterReducer"
import ContactUsReducer from "./ContactUsReducer"
import BannerReducer from "./BannerReducer"

export default combineReducers({
    CategoryStateData: CategoryReducer,
    SubcategoryStateData: SubcategoryReducer,
    PublisherStateData: PublisherReducer,
    TestimonialStateData: TestimonialReducer,
    BookStateData: BookReducer,
    BannerStateData: BannerReducer,
    CartStateData: CartReducer,
    WishlistStateData: WishlistReducer,
    CheckoutStateData: CheckoutReducer,
    NewsletterStateData: NewsletterReducer,
    ContactUsStateData: ContactUsReducer,
})