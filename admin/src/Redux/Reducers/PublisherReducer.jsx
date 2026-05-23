import {
  CREATE_PUBLISHER_RED,
  DELETE_PUBLISHER_RED,
  GET_PUBLISHER_RED,
  UPDATE_PUBLISHER_RED
} from "../Constants";

export default function PublisherReducer(state = [], action) {
  switch (action.type) {
    case CREATE_PUBLISHER_RED:
      let newState = [...state];
      newState.unshift(action.payload);
      return newState;

    case GET_PUBLISHER_RED:
      return action.payload;

    case UPDATE_PUBLISHER_RED:
      let index = state.findIndex(x => x._id === action.payload._id);

      state[index].name = action.payload.name;
      state[index].email = action.payload.email;
      state[index].address = action.payload.address;
      state[index].phone = action.payload.phone;
      state[index].website = action.payload.website;
      state[index].logo = action.payload.logo;
      state[index].active = action.payload.active;

      return [...state];

    case DELETE_PUBLISHER_RED:
      return state.filter(x => x._id !== action.payload._id);

    default:
      return state;
  }
}