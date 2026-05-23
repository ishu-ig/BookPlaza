import { put, takeEvery } from "redux-saga/effects";
import { CREATE_BOOK, CREATE_BOOK_RED, DELETE_BOOK, DELETE_BOOK_RED, GET_BOOK, GET_BOOK_RED, UPDATE_BOOK, UPDATE_BOOK_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("book", action.payload)
    let response = yield createMultipartRecord("book", action.payload)
    yield put({ type: CREATE_BOOK_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("book")
    yield put({ type: GET_BOOK_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("book", action.payload)
    // yield put({ type: UPDATE_BOOK_RED, payload: action.payload })
    let response = yield updateMultipartRecord("book", action.payload)
    yield put({ type: UPDATE_BOOK_RED, payload: response.data })

}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("book", action.payload)
    yield put({ type: DELETE_BOOK_RED, payload: action.payload })
}


export default function* bookSagas() {
    yield takeEvery(CREATE_BOOK, createSaga)    //watcher saga
    yield takeEvery(GET_BOOK, getSaga)          //watcher saga
    yield takeEvery(UPDATE_BOOK, updateSaga)    //watcher saga
    yield takeEvery(DELETE_BOOK, deleteSaga)    //watcher saga
}