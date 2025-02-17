import { applyMiddleware, combineReducers, createStore } from 'redux';
import logger from 'redux-logger';
import { thunk } from 'redux-thunk';
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
    staffList: staffListReducer
});

export const store = createStore(
    root,
    applyMiddleware(logger,thunk)
);
