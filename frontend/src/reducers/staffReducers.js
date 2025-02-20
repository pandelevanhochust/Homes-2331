import {
    STAFF_CREATE_FAIL,
    STAFF_CREATE_REQUEST,
    STAFF_CREATE_SUCCESS,
    STAFF_DELETE_FAIL,
    STAFF_DELETE_REQUEST,
    STAFF_DELETE_SUCCESS,
    STAFF_LIST_FAIL,
    STAFF_LIST_REQUEST,
    STAFF_LIST_SUCCESS,
    STAFF_UPDATE_FAIL,
    STAFF_UPDATE_REQUEST,
    STAFF_UPDATE_SUCCESS
} from "../constants/staffConstant";

export const staffCreateReducer = (state={},action) => {
    switch (action.type){
        case STAFF_CREATE_REQUEST:
            return {
                loading: true,
            };
        case STAFF_CREATE_SUCCESS:
            return{
                loading: false,
                success: true,
                data: action.payload,
            };
        case STAFF_CREATE_FAIL:
            return { 
                loading: false,
                error: action.payload,
            };
        default:
            return state;
    }
};

export const staffUpdateReducer = (state={}, action) => {
    switch(action.type){
        case STAFF_UPDATE_REQUEST:
            return {
                loading: true,
            };
        case STAFF_UPDATE_SUCCESS:
            return {
                loading:false,
                success: true,
                data: action.payload
            };
        case STAFF_UPDATE_FAIL:
            return {
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
}

export const staffListReducer = (state= { staff: [] }, action) => {
    switch(action.type){
        case STAFF_LIST_REQUEST:
            return {
                loading: true,
            };
        case STAFF_LIST_SUCCESS:
            return {
                loading:false,
                success: true,
                staff: action.payload
            };
        case STAFF_LIST_FAIL:
            return {
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
}

export const staffDeleteReducer = (state = {}, action) => {
    switch(action.type){
        case STAFF_DELETE_REQUEST:
            return {
                loading: true,
                error: false,
            };
        case STAFF_DELETE_SUCCESS:
            return {
                loading:false,
                error: false,
                success: true,
            };
        case STAFF_DELETE_FAIL:
            return {
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
}