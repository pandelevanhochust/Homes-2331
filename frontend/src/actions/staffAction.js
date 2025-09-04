import {
    STAFF_CREATE_FAIL,
    STAFF_CREATE_REQUEST,
    STAFF_CREATE_SUCCESS,
    STAFF_DELETE_FAIL,
    STAFF_DELETE_REQUEST,
    STAFF_DELETE_SUCCESS,
    STAFF_DETAIL_FAIL,
    STAFF_DETAIL_REQUEST,
    STAFF_DETAIL_SUCCESS,
    STAFF_LIST_FAIL,
    STAFF_LIST_REQUEST,
    STAFF_LIST_SUCCESS,
    STAFF_UPDATE_FAIL,
    STAFF_UPDATE_REQUEST,
    STAFF_UPDATE_SUCCESS
} from "../constants/staffConstant.js";


const API_BASE = import.meta.env.VITE_API_URL;

export const createStaff = (staff) => async(dispatch,getState) => {
    try {
        dispatch({
            type: STAFF_CREATE_REQUEST,
        });

        const {adminLogin: {userInfo}} = getState();
        console.log(userInfo.token);
        console.log("Authorization Header:", `Bearer ${userInfo.token}`);


        const response = await fetch(`${API_BASE}/api/staff?admin_id=${admin_id}`,{
            method : "POST",
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization : `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(staff),
        });

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

export const listStaff = () => async (dispatch,getState) => {
    try{
        dispatch ({
            type: STAFF_LIST_REQUEST
        })

        const {adminLogin: {userInfo}} = getState();
        console.log("admin login",userInfo);
        const response  = await fetch(`${API_BASE}/api/staff?admin_id=${userInfo.admin_id}`,{
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
    console.log("recieved body: ",staff);
    
    try{
        dispatch({
            type: STAFF_UPDATE_REQUEST,
        });
        
        const {adminLogin: {userInfo},} = getState();

        const respone = await fetch(`${API_BASE}/api/staff/${staff.id}?admin_id=${userInfo.admin_id}`,{
            method: "PUT",
            headers: {  
                "Content-Type": "multipart/form-data",
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

        const response = await fetch(`${API_BASE}/api/delete/${staff._id}`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization : `Bearer ${userInfo.token}`,
            },
        });

        const data = await response.json();

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

export const getStaffDetail = (id) => async(dispatch,getState) =>{
    try{
        dispatch({
            type: STAFF_DETAIL_REQUEST,
        })
        const {adminLogin: {userInfo}} = getState();

        const response = await fetch(`${API_BASE}/api/staff/${id}?admin_id=${userInfo.admin_id}`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed with status: ${response.status}`);
        };

        const data = await response.json();
        dispatch({
            type: STAFF_DETAIL_SUCCESS,
            payload: data,
        })

    }catch(error){
        dispatch({
            type: STAFF_DETAIL_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}

