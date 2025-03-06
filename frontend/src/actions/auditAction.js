

// export const updateService = (staff) => async (dispatch,getState) => {
//     try{
//         console.log(staff);
//         dispatch({
//             type:EQUIPMENT_ADD_REQUEST,
//         });
        
//         const {adminLogin: {userInfo}}= getState();
 
//         const response = await fetch(`/api/staff/equipment/${service.id}`,{
//             method: "PUT",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${userInfo.token}`,
//             },
//             body: JSON.stringify(service),
//         })

//         const data = await response.json();
//         dispatch({
//             type: EQUIPMENT_ADD_SUCCESS,
//             payload: data,
//         })

//     }catch(error){
//         dispatch({
//             type: EQUIPMENT_ADD_FAIL,
//             payload: error.response && error.response.data.message
//             ? error.response.data.message
//             : error.message || "Failed",
//         })
//     }
// }