import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth"

const RequireAuth = () => {
    const { auth } = useAuth();
    const location = useLocation();

    // console.log(auth.user);

    return (
        auth?.accessToken
            ? <Outlet />
            : <Navigate to={"/"} state={{ from: location }} replace />
    );
}

export default RequireAuth;