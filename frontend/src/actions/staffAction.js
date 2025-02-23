import {
    STAFF_CREATE_FAIL,
    STAFF_CREATE_REQUEST,
    STAFF_CREATE_SUCCESS,
    STAFF_LIST_FAIL,
    STAFF_LIST_REQUEST,
    STAFF_LIST_SUCCESS,
} from "../constants/staffConstant";


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


        if (!response.ok) {
            const errorData = await response.json(); // Parse the error response
            console.error("Server error response:", errorData);
            throw new Error(errorData.message || "Failed to create staff");
        }

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

        // const contentType = response.headers.get("content-type");
        // if (!contentType || !contentType.includes("application/json")) {
        //     throw new Error("Invalid JSON response from server");
        // }

        const data = await response.json();
        console.log(data);

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