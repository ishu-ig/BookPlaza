import { put, takeEvery } from "redux-saga/effects";
import { CREATE_CATEGORY, CREATE_CATEGORY_RED, DELETE_CATEGORY, DELETE_CATEGORY_RED, GET_CATEGORY, GET_CATEGORY_RED, UPDATE_CATEGORY, UPDATE_CATEGORY_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("category", action.payload)
    let response = yield createMultipartRecord("category", action.payload)
    yield put({ type: CREATE_CATEGORY_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("category")
    yield put({ type: GET_CATEGORY_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("category", action.payload)
    // yield put({ type: UPDATE_CATEGORY_RED, payload: action.payload })
    let response = yield updateMultipartRecord("category", action.payload)
    yield put({ type: UPDATE_CATEGORY_RED, payload: response.data })
}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("category", action.payload)
    yield put({ type: DELETE_CATEGORY_RED, payload: action.payload })
}


export default function* categorySagas() {      
    yield takeEvery(CREATE_CATEGORY, createSaga)    //watcher saga
    yield takeEvery(GET_CATEGORY, getSaga)          //watcher saga
    yield takeEvery(UPDATE_CATEGORY, updateSaga)    //watcher saga
    yield takeEvery(DELETE_CATEGORY, deleteSaga)    //watcher saga
}