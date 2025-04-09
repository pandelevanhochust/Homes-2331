import {
  GET_AUDIT_FAIL,
  GET_AUDIT_REQUEST,
  GET_AUDIT_SUCCESS,
  SERVICE_AUDIT_FAIL,
  SERVICE_AUDIT_REQUEST,
  SERVICE_AUDIT_SUCCESS,
} from "../constants/staffConstant";


export const auditService = (service,revenue,percentage) => async(dispatch,getState) => {
    console.log("reach here");
    console.log(service,revenue,percentage);
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
            body: JSON.stringify({service,revenue,percentage}),  
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

// GET /api/staff/audit/:id?offset=0
export const getAuditService = (id, offset = 0) => async (dispatch, getState) => {
    // console.log("In getAuditService",service,"offset:",offset);
    try {
      dispatch({ type: GET_AUDIT_REQUEST });
  
      const {
        adminLogin: { userInfo },
      } = getState();
  
      const response = await fetch(`/api/staff/audit/${id}?offset=${offset}`, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed with status: ${response.status}`);
      }
  
      const data = await response.json();

      console.log("Data recieved",data);
      dispatch({ type: GET_AUDIT_SUCCESS, payload:data});
    } catch (error) {
      dispatch({
        type: GET_AUDIT_FAIL,
        payload: error.message || 'Failed to get audit data',
      });
    }
  };