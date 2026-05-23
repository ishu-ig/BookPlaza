import { CREATE_CATEGORY_RED, DELETE_CATEGORY_RED, GET_CATEGORY_RED, UPDATE_CATEGORY_RED } from "../Constants"
export default function CategoryReducer(state=[], action) {
    switch (action.type) {
        case CREATE_CATEGORY_RED:
            let newState = [...state]
            newState.unshift(action.payload)
            return newState

        case GET_CATEGORY_RED:
            return action.payload

        case UPDATE_CATEGORY_RED:
            let index = state.findIndex(x => x._id === action.payload._id)
            state[index].name = action.payload.name
            state[index].pic = action.payload.pic
            state[index].active = action.payload.active
            return state

        case DELETE_CATEGORY_RED:
            return state.filter(x => x._id !== action.payload._id)

        default:
            return state
    }
}   
