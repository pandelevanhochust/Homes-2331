import {
    ADMIN_LOGIN_FAIL,
    ADMIN_LOGIN_REQUEST,
    ADMIN_LOGIN_SUCCESS,
    ADMIN_LOGOUT,
} from "../constants/adminConstants";


export const loginAdmin = (username,password) => async(dispatch) => {
    try {
        dispatch({
            type: ADMIN_LOGIN_REQUEST,
        });

        const response = await fetch("/api/admin/login",{
            method : "POST",
            headers : {
                "Content-Type": "application/json"
            },
            // body: JSON.stringify({username,password}), 
            body: JSON.stringify({username,password}), 
        })

        if (!response.ok) {
            const errorData = await response.json(); 
            console.error("Server error response:", errorData);
            throw new Error(errorData.message || "Failed to login");
        }

        const data = await response.json();
        console.log(data);

        dispatch({
            type: ADMIN_LOGIN_SUCCESS,
            payload: data,
        })
        localStorage.setItem("userInfo",JSON.stringify(data));

    } catch (error) {
        dispatch({
            type: ADMIN_LOGIN_FAIL,
            payload: error.response && error.response.data.message
            ? error.response.data.message
            : error.message || "Failed",
        })
    }
};

export const logoutAdmin = () => (dispatch) => {
    localStorage.removeItem("userInfo");
    dispatch({type: ADMIN_LOGOUT});
}
 


