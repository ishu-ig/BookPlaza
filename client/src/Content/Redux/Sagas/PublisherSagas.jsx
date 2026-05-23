import { put, takeEvery } from "redux-saga/effects";
import { CREATE_PUBLISHER, CREATE_PUBLISHER_RED, DELETE_PUBLISHER, DELETE_PUBLISHER_RED, GET_PUBLISHER, GET_PUBLISHER_RED, UPDATE_PUBLISHER, UPDATE_PUBLISHER_RED } from "../Constants"
// import { createRecord, deleteRecord, getRecord, updateRecord } from "./Service/ApiCallingService"
import { createMultipartRecord, deleteRecord, getRecord, updateMultipartRecord } from "./Service/ApiCallingService"


function* createSaga(action) {                          //worker saga or executer saga
    // let response = yield createRecord("publisher", action.payload)
    let response = yield createMultipartRecord("publisher", action.payload)
    yield put({ type: CREATE_PUBLISHER_RED, payload: response.data })
}

function* getSaga(action) {                             //worker saga or executer saga
    let response = yield getRecord("publisher")
    yield put({ type: GET_PUBLISHER_RED, payload: response.data })
}

function* updateSaga(action) {                          //worker saga or executer saga
    // yield updateRecord("publisher", action.payload)
    // yield put({ type: UPDATE_PUBLISHER_RED, payload: action.payload })
    let response = yield updateMultipartRecord("publisher", action.payload)
    yield put({ type: UPDATE_PUBLISHER_RED, payload: response.data })
}

function* deleteSaga(action) {                          //worker saga or executer saga
    yield deleteRecord("publisher", action.payload)
    yield put({ type: DELETE_PUBLISHER_RED, payload: action.payload })
}


export default function* publisherSagas() {
    yield takeEvery(CREATE_PUBLISHER, createSaga)    //watcher saga
    yield takeEvery(GET_PUBLISHER, getSaga)          //watcher saga
    yield takeEvery(UPDATE_PUBLISHER, updateSaga)    //watcher saga
    yield takeEvery(DELETE_PUBLISHER, deleteSaga)    //watcher saga
}