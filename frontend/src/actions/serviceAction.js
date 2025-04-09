import dotenv from 'dotenv';
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
} from "../constants/staffConstant.js";


dotenv.config();

const API_BASE = process.env.VITE_API_URL;


export const updateService = (service) => async (dispatch,getState) => {
    try{
        console.log(service);
        dispatch({
            type:SERVICE_UPDATE_REQUEST,
        });
        
        const {adminLogin: {userInfo}}= getState();
 
        const response = await fetch(`${API_BASE}/api/staff/service/${service.id}`,{
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(service),
        })

        const data = await response.json();
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
 
        const response = await fetch(`${API_BASE}/api/staff/service/${service.id}`,{
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

export const createService = (id,service) => async (dispatch,getState) => {
    console.log("Service creating:",id, service);
    try{
        dispatch({
            type:SERVICE_CREATE_REQUEST,
        });
        
        const {adminLogin: {userInfo}}= getState();
 
        const response = await fetch(`${API_BASE}/api/staff/service/${id}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            body: JSON.stringify(service),
        })

        const data = await response.json();
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