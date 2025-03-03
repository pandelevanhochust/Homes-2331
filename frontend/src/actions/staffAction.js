import {
    SERVICE_CREATE_FAIL,
    SERVICE_CREATE_REQUEST,
    SERVICE_CREATE_SUCCESS,
    SERVICE_DELETE_FAIL,
    SERVICE_DELETE_REQUEST,
    SERVICE_DELETE_SUCCESS,
    SERVICE_UPDATE_FAIL,
    SERVICE_UPDATE_REQUEST,
    SERVICE_UPDATE_SUCCESS,
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
} from "../constants/staffConstant.js";


export const createStaff = (staff) => async(dispatch,getState) => {
    try {
        dispatch({
            type: STAFF_CREATE_REQUEST,
        });

        const {adminLogin: {userInfo},} = getState();
        console.log(userInfo.token);
        console.log("Authorization Header:", `Bearer ${userInfo.token}`);


        const response = await fetch("/api/staff",{
            method : "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(staff),
        });


        // if (!response.ok) {
        //     const errorData = await response.json(); // Parse the error response
        //     console.error("Server error response:", errorData);
        //     throw new Error(errorData.message || "Failed to create staff");
        // }

        const data = await response.json();
        console.log(data);

        dispatch({
            type: STAFF_CREATE_SUCCESS,
            payload: data,
        })
    } catch (error) {
        dispatch({
            type: STAFF_CREATE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
};

export const listStaff = () => async (dispatch) => {
    try{
        dispatch ({
            type: STAFF_LIST_REQUEST
        })

        const response  = await fetch("/api/staff",{
            method : "GET",
        }
        );

        const data = await response.json();
        console.log(data);

        dispatch ({
            type: STAFF_LIST_SUCCESS,
            payload: data,
        })

        localStorage.setItem("staffList",JSON.stringify(data))

    } catch(error) {
        dispatch({
            type: STAFF_LIST_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

export const updateStaff = (staff) => async (dispatch,getState) =>{
    try{
        dispatch({
            type: STAFF_UPDATE_REQUEST,
        });
        
        const {adminLogin: {userInfo},} = getState();

        const respone = await fetch("/api/staff/update",{
            method: "PUT",
            headers: {  
                "Content-Type": "application/json",
                Authorization : `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(staff),
        });

        const data = await respone.json();
        console.log(data);
        
        dispatch({
            type: STAFF_UPDATE_SUCCESS,
            payload: data.updatedRow,
        })
        
    }catch(error){
        dispatch({
            type: STAFF_UPDATE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

export const deleteStaff = (staff) => async (dispatch,getState) =>{
    try {
        dispatch({
            type: STAFF_DELETE_REQUEST,
        })

        const {adminLogin: {userInfo}} = getState();

        const response = await fetch(`/api/delete/${staff._id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${userInfo.token}`,
            },
        });

        const data = response.json();

        dispatch({
            type: STAFF_DELETE_SUCCESS,
            payload: data,
        })

    }catch(error){
        dispatch({
            type: STAFF_DELETE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

export const updateService = (service) => async (dispatch,getState) => {
    try{
        dispatch({
            type:SERVICE_UPDATE_REQUEST,
        });
        
        const {adminLogin: {userInfo}}= getState();
 
        const response = await fetch("/api/staff/service",{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(service),
        })

        const data = response.json();
        // console.log(data);

        dispatch({
            type: SERVICE_UPDATE_SUCCESS,
            payload: data,
        })

    }catch(error){
        dispatch({
            type: SERVICE_UPDATE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

export const deleteService = (service) => async (dispatch,getState) => {
    try{
        dispatch({
            type:SERVICE_DELETE_REQUEST,
        });
        
        const {adminLogin: {userInfo}}= getState();
 
        const response = await fetch("/api/staff/service",{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(service),
        })

        const data = response.json();
        dispatch({
            type: SERVICE_DELETE_SUCCESS,
            payload: data.deleteRow,
        })

    }catch(error){
        dispatch({
            type: SERVICE_DELETE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

export const createService = (service) => async (dispatch,getState) => {
    try{
        dispatch({
            type:SERVICE_CREATE_REQUEST,
        });
        
        const {adminLogin: {userInfo}}= getState();
 
        const response = await fetch("/api/staff/service",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(service),
        })

        const data = response.json();
        dispatch({
            type: SERVICE_CREATE_SUCCESS,
            payload: data.createdService,
        })

    }catch(error){
        dispatch({
            type: SERVICE_CREATE_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}
