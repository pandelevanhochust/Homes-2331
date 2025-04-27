import {
    AUDIT_FAIL,
    AUDIT_REQUEST,
    AUDIT_RESET,
    AUDIT_SUCCESS,
    GET_AUDIT_FAIL,
    GET_AUDIT_REQUEST,
    GET_AUDIT_RESET,
    GET_AUDIT_SUCCESS,
    SERVICE_AUDIT_FAIL,
    SERVICE_AUDIT_REQUEST,
    SERVICE_AUDIT_RESET,
    SERVICE_AUDIT_SUCCESS,
    SERVICE_CREATE_FAIL,
    SERVICE_CREATE_REQUEST,
    SERVICE_CREATE_RESET,
    SERVICE_CREATE_SUCCESS,
    SERVICE_DELETE_FAIL,
    SERVICE_DELETE_REQUEST,
    SERVICE_DELETE_RESET,
    SERVICE_DELETE_SUCCESS,
    SERVICE_UPDATE_FAIL,
    SERVICE_UPDATE_REQUEST,
    SERVICE_UPDATE_RESET,
    SERVICE_UPDATE_SUCCESS,
    STAFF_CREATE_FAIL,
    STAFF_CREATE_REQUEST,
    STAFF_CREATE_SUCCESS,
    STAFF_DELETE_FAIL,
    STAFF_DELETE_REQUEST,
    STAFF_DELETE_SUCCESS,
    STAFF_DETAIL_FAIL,
    STAFF_DETAIL_REQUEST,
    STAFF_DETAIL_RESET,
    STAFF_DETAIL_SUCCESS,
    STAFF_LIST_FAIL,
    STAFF_LIST_REQUEST,
    STAFF_LIST_SUCCESS,
    STAFF_UPDATE_FAIL,
    STAFF_UPDATE_REQUEST,
    STAFF_UPDATE_SUCCESS,
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

export const serviceUpdateReducer = (state = {}, action) => {
    switch (action.type) {
      case SERVICE_UPDATE_REQUEST:
        return { loading: true };
      case SERVICE_UPDATE_SUCCESS:
        return { loading: false, success: true, data: action.payload };
      case SERVICE_UPDATE_FAIL:
        return { loading: false, error: action.payload };
      case SERVICE_UPDATE_RESET:
        return {}; // ✅ Reset state
      default:
        return state;
    }
  };
  

export const serviceCreateReducer = (state = {}, action) => {
    switch (action.type) {
      case SERVICE_CREATE_REQUEST:
        return { loading: true };
      case SERVICE_CREATE_SUCCESS:
        return { loading: false, success: true, data: action.payload };
      case SERVICE_CREATE_FAIL:
        return { loading: false, error: action.payload };
      case SERVICE_CREATE_RESET:
        return {}; // ✅ Reset state
      default:
        return state;
    }
  };


  export const serviceDeleteReducer = (state = {}, action) => {
    switch (action.type) {
      case SERVICE_DELETE_REQUEST:
        return { loading: true };
      case SERVICE_DELETE_SUCCESS:
        return { loading: false, success: true };
      case SERVICE_DELETE_FAIL:
        return { loading: false, error: action.payload };
      case SERVICE_DELETE_RESET:
        return {}; // ✅ Reset state
      default:
        return state;
    }
  };

export const staffDetailReducer = (state={},action) => {
    switch(action.type){
        case STAFF_DETAIL_REQUEST:
            return {
                loading: true,
                error: false,
            };
        case STAFF_DETAIL_SUCCESS:
            return {
                loading:false,
                error: false,
                success: true,
                staff_detail: action.payload,
            };
        case STAFF_DETAIL_FAIL:
            return {
                loading: false,
                error: action.payload,
            };
        case STAFF_DETAIL_RESET:
            return {}; // ✅ Reset state
        default:
            return state;
    }
}

export const serviceAuditReducer = (state={},action) => {
    switch(action.type){
        case SERVICE_AUDIT_REQUEST:
            return {
                loading: true,
                error: false,
            };
        case SERVICE_AUDIT_SUCCESS:
            return {
                loading:false,
                error: false,
                success: true,
                staff_detail: action.payload,
            };
        case SERVICE_AUDIT_FAIL:
            return {
                loading: false,
                error: action.payload,
            };
        case SERVICE_AUDIT_RESET:
            return{};
        default:
            return state;
    }
}

export const getServiceAuditReducer = (state={},action) => {
    switch(action.type){
        case GET_AUDIT_REQUEST:
            return { loading: true };
          case GET_AUDIT_SUCCESS:
            return { loading: false, auditData: action.payload};
          case GET_AUDIT_FAIL:
            return { loading: false, error: action.payload };
            case GET_AUDIT_RESET:
                return{};
        default:
            return state;
    }
}

export const getAuditReducer = (state={},action) => {
    switch(action.type){
        case AUDIT_REQUEST:
            return { loading: true };
          case AUDIT_SUCCESS:
            return { loading: false, audit: action.payload};
          case AUDIT_FAIL:
            return { loading: false, error: action.payload };
            case AUDIT_RESET:
                return{};
        default:
            return state;
    }
}