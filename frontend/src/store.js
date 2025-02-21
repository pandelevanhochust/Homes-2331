import { applyMiddleware, combineReducers, createStore } from 'redux';
import logger from 'redux-logger';
import { thunk } from 'redux-thunk';
import { adminLoginReducer } from './reducers/adminReducers';

import {
    staffCreateReducer,
    staffDeleteReducer,
    staffListReducer,
    staffUpdateReducer
} from './reducers/staffReducers';

const root = combineReducers({
    staffCreate: staffCreateReducer,
    staffDelete: staffDeleteReducer,
    staffUpdate: staffUpdateReducer,
    staffList: staffListReducer,
    adminLogin: adminLoginReducer,
});

console.log(localStorage.getItem("userInfo"));
const userInfoFromStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")) : null;

const initialState = {
    adminLogin: {userInfo: userInfoFromStorage},
};

export const store = createStore(
    root,
    initialState,
    applyMiddleware(logger,thunk),
);
