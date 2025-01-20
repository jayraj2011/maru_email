import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
const LOGIN_URL = 'login';

const Login = () => {
    const { auth, setAuth } = useAuth();
    const userRef = useRef();
    const errRef = useRef();
    const location = useLocation();
    const navigate = useNavigate();

    const from = location.state?.from?.pathname || "/";

    const [user, setUser] = useState('');
    const [pwd, setPwd] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [showPass, setShowPass] = useState("password");

    useEffect(() => {
        userRef.current.focus();
    }, [])

    useEffect(() => {
        setErrMsg('');
    }, [user, pwd])

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL,
                JSON.stringify({ user_email: user, user_password: pwd }),
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                }
            );
            // console.log("here");
            // console.log(response);
            // console.log(JSON.stringify(response?.data));
            //console.log(JSON.stringify(response));
            const accessToken = response?.data?.access_token;
            setAuth({ user, pwd, accessToken });
            console.log(useAuth)
            setUser('');
            setPwd('');
            // setSuccess(true);
            navigate("/home", {replace: true});
        } catch (err) {
            console.log(err);
            if (!err?.response) {
                setErrMsg('No Server Response');
            } else if (err.response?.status === 400) {
                setErrMsg('Missing Username or Password');
            } else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            } else {
                setErrMsg('Login Failed');
            }
            errRef.current.focus();
        }
    }

    const handleShowOnClick = (e) => {
        if (showPass == "password") {
            setShowPass("text");
        } else {
            setShowPass("password");
        }
    }

    return (
        <div className='w-screen h-screen flex items-center justify-center'>
            <section className='flex items-center justify-center flex-col gap-5'>
                <p ref={errRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
                <h1 className='text-[30px]'>Sign In</h1>
                <form onSubmit={handleSubmit} className='flex flex-col items-start justify-center gap-3'>
                    <label htmlFor="username">Username:</label>
                    <input
                        type="text"
                        id="username"
                        className='w-[350px] h-[50px] border rounded-xl border-black items-center pl-3'
                        placeholder='User Email'
                        ref={userRef}
                        autoComplete="off"
                        onChange={(e) => setUser(e.target.value)}
                        value={user}
                        required
                    />

                    <label htmlFor="password">Password:</label>
                    <div className='flex items-center justify-center w-[350px] h-[50px] border rounded-xl border-black z-10 pr-1'>
                        <input
                            type={showPass}
                            id="password"
                            placeholder='Password'
                            className='w-[300px] h-[45px] items-center pl-3 focus:outline-none'
                            onChange={(e) => setPwd(e.target.value)}
                            value={pwd}
                            required
                        />
                        <a className='cursor-pointer' onClick={handleShowOnClick}>show</a>
                    </div>
                    <button className='self-center mt-5 border border-black h-[40px] w-[100px] rounded-xl'>Submit</button>
                </form>
                {/* <p>
                    Need an Account?<br />
                    <span className="line"> */}
                        {/*put router link here*/}
                        {/* <a href="#">Sign Up</a>
                    </span>
                </p> */}
            </section>
        </div>
    )
}

export default Login