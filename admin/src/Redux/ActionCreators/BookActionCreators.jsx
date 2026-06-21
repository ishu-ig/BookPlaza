import { CREATE_BOOK, DELETE_BOOK, GET_BOOK, UPDATE_BOOK } from "../Constants"

export function createBook(data) {
    return {
        type: CREATE_BOOK,
        payload: data
    }
}

export function getBook() {
    return {
        type: GET_BOOK
    }
}

export function updateBook(data) {
    return {
        type: UPDATE_BOOK,
        payload: data
    }
}

export function deleteBook(data) {
    return {
        type: DELETE_BOOK,
        payload: data
    }
}