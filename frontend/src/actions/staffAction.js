import {
    STAFF_LIST_FAIL,
    STAFF_LIST_REQUEST,
    STAFF_LIST_SUCCESS
} from "../constants/staffConstant";


// export const createStaff = (staff) => async(dispatch,getState) => {
//     try {
//         dispatch({
//             type: STAFF_CREATE_REQUEST,
//         });

        
//     } catch (error) {
        
//     }
// };

export const listStaff = () => async (dispatch) => {
    try{
        dispatch ({
            type: STAFF_LIST_REQUEST
        })

        const { data } = await fetch("/api/staff",{
            method : "GET",
        }
        );

        dispatch ({
            type: STAFF_LIST_SUCCESS,
            payload: data,
        })
    } catch(error) {
        dispatch({
            type: STAFF_LIST_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
}