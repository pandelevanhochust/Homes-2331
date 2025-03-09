import {
    SERVICE_AUDIT_FAIL,
    SERVICE_AUDIT_REQUEST,
    SERVICE_AUDIT_SUCCESS,
} from "../constants/staffConstant";


export const auditService = (service,revenue) => async(dispatch,getState) => {
    console.log("reach here");
    console.log(service,revenue);
    try {
        dispatch({
            type: SERVICE_AUDIT_REQUEST,
        })

        const {adminLogin: {userInfo}} = getState();
        console.log(userInfo);

        const response = await fetch(`/api/staff/audit/${service.id}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${userInfo.token}`,
            },
            // body: JSON.stringify({service,revenue}),
        })

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed with status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
        dispatch({
            type: SERVICE_AUDIT_SUCCESS,
            payload: data.data,
        })

    }catch(error){
        dispatch({
            type: SERVICE_AUDIT_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })   
    }
}