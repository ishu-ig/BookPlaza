import { CREATE_PUBLISHER, DELETE_PUBLISHER, GET_PUBLISHER, UPDATE_PUBLISHER } from "../Constants"

export function createPublisher(data) {
    return {
        type: CREATE_PUBLISHER,
        payload: data
    }
}

export function getPublisher() {
    return {
        type: GET_PUBLISHER
    }
}

export function updatePublisher(data) {
    return {
        type: UPDATE_PUBLISHER,
        payload: data
    }
}

export function deletePublisher(data) {
    return {
        type: DELETE_PUBLISHER,
        payload: data
    }
}