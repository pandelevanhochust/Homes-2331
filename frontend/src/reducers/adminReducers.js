import {
    ADMIN_LOGIN_FAIL,
    ADMIN_LOGIN_REQUEST,
    ADMIN_LOGIN_SUCCESS
} from "../constants/adminConstants";

export const adminLoginReducer = (state={}, action) => {
    switch(action.type) {
        case ADMIN_LOGIN_REQUEST:
            return{
                loading: true,
            };
        case ADMIN_LOGIN_SUCCESS:
            return{
                loading: false,
                success: true,
                userInfo: action.payload
            };
        case ADMIN_LOGIN_FAIL:
            return{
                loading: false,
                error: action.payload
            };
        default:
            return state;
    }
}