import { applyMiddleware, combineReducers, createStore } from 'redux';
import logger from 'redux-logger';
import { thunk } from 'redux-thunk';
import { adminLoginReducer } from './reducers/adminReducers';

import {
    getServiceAuditReducer,
    serviceAuditReducer,
    serviceCreateReducer,
    serviceDeleteReducer,
    serviceUpdateReducer,
    staffCreateReducer,
    staffDeleteReducer,
    staffDetailReducer,
    staffListReducer,
    staffUpdateReducer
} from './reducers/staffReducers';

const root = combineReducers({
    staffCreate: staffCreateReducer,
    staffDelete: staffDeleteReducer,
    staffUpdate: staffUpdateReducer,
    staffList: staffListReducer,
    adminLogin: adminLoginReducer,
    serviceCreate: serviceCreateReducer,
    serviceDelete: serviceDeleteReducer,
    serviceUpdate: serviceUpdateReducer,
    staffDetail: staffDetailReducer,
    serviceAudit: serviceAuditReducer,
    getServiceAudit: getServiceAuditReducer,
});

console.log(localStorage.getItem("userInfo"));
const userInfoFromStorage = localStorage.getItem("userInfo")
    ? JSON.parse(localStorage.getItem("userInfo")) : null;

// const staffListFromStorage = localStorage.getItem("userInfo")
// ? JSON.parse(localStorage.getItem("userInfo")) : null;

const initialState = {
    adminLogin: {userInfo: userInfoFromStorage},
    // staffList: {staff: staffListFromStorage},
};

export const store = createStore(
    root,
    initialState,
    applyMiddleware(logger,thunk),
);
