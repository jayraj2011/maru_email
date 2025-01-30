// import { axios } from "../App";
import axios from "../api/axios";
import useAuth from "./useAuth"

const useRefreshToken = () => {
    const { setAuth } = useAuth();

    const refresh = async() => {
        const response = await axios.post("/refresh", {}, {
            withCredentials: true,
        });

        setAuth(prev => {
            // // console.log("prev in useRefreshToken", JSON.stringify(prev));
            // // console.log("access token in useRefreshToken", response.data.accessToken);
            return { ...prev, accessToken: response.data.accessToken }
        })

        return response.data.access_token;
    }
    return refresh;
}

export default useRefreshToken;