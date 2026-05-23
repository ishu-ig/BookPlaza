import {
  CREATE_BOOK_RED,
  DELETE_BOOK_RED,
  GET_BOOK_RED,
  UPDATE_BOOK_RED,
} from "../Constants";
export default function BookReducer(state = [], action) {
  switch (action.type) {
    case CREATE_BOOK_RED:
      let newState = [...state];
      newState.unshift(action.payload);
      return newState;

    case GET_BOOK_RED:
      return action.payload;

    case UPDATE_BOOK_RED:
      let index = state.findIndex((x) => x._id === action.payload._id);

      state[index].title = action.payload.title;
      state[index].author = action.payload.author;
      state[index].isbn = action.payload.isbn;
      state[index].description = action.payload.description;

      state[index].category = action.payload.category;
      state[index].subcategory = action.payload.subcategory;
      state[index].publisher = action.payload.publisher;

      state[index].language = action.payload.language;
      state[index].pages = action.payload.pages;
      state[index].format = action.payload.format;
      state[index].publishedDate = action.payload.publishedDate;

      state[index].price = action.payload.price;
      state[index].discount = action.payload.discount;
      state[index].finalPrice = action.payload.finalPrice;

      state[index].stock = action.payload.stock;

      state[index].coverImage = action.payload.coverImage;
      state[index].images = action.payload.images;

      state[index].featured = action.payload.featured;
      state[index].active = action.payload.active;

      state[index].rating = action.payload.rating;
      state[index].totalReviews = action.payload.totalReviews;
      state[index].reviews = action.payload.reviews;
      return state;

    case DELETE_BOOK_RED:
      return state.filter((x) => x._id !== action.payload._id);

    default:
      return state;
  }
}
