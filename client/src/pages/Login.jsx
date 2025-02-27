import { useRef, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import axios, { axiosPrivate } from "../api/axios";

const LOGIN_URL = "login";

const Login = () => {
  const { auth, setAuth } = useAuth();
  const userRef = useRef();
  const errRef = useRef();
  const location = useLocation();
  const navigate = useNavigate();

  const from = location.state?.from?.pathname || "/";

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showPass, setShowPass] = useState("password");

  useEffect(() => {
    userRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axiosPrivate.post(
        LOGIN_URL,
        JSON.stringify({ user_email: user, user_password: pwd }),
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      // console.log(response);
      const accessToken = response?.data?.accessToken;
      setAuth({ user, pwd, accessToken });
      setUser("");
      setPwd("");
      navigate("/home", { replace: true });
    } catch (err) {
      console.log(err);
      if (!err?.response) {
        setErrMsg("No Server Response");
      } else if (err.status === 401) {
        setErrMsg("Missing Username or Password");
      } else if (err.status === 400) {
        setErrMsg("Unauthorized");
      } else {
        setErrMsg("Login Failed");
      }
      errRef.current.focus();
    }
  };

  const handleShowOnClick = (e) => {
    if (showPass == "password") {
      setShowPass("text");
    } else {
      setShowPass("password");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <section className="flex items-center justify-center flex-col gap-5">
        <p
          ref={errRef}
          className={errMsg ? "errmsg" : "offscreen"}
          aria-live="assertive"
        >
          {errMsg}
        </p>
        <h1 className="text-[30px]">Sign In</h1>
        <form
          method="POST"
          onSubmit={handleSubmit}
          className="flex flex-col items-start justify-center gap-3"
        >
          <label htmlFor="email">Username:</label>
          <input
            type="text"
            id="email"
            name="email"
            className="w-[350px] h-[50px] border rounded-xl border-black items-center pl-3"
            placeholder="Enter Email"
            ref={userRef}
            autoComplete="username"
            onChange={(e) => setUser(e.target.value)}
            value={user}
            required
          />

          <label htmlFor="password">Password:</label>
          <div className="flex items-center justify-center w-[350px] h-[50px] border rounded-xl border-black z-10 pr-1">
            <input
              type={showPass}
              id="password"
              name="password"
              placeholder="Enter Password"
              className="w-[300px] h-[45px] items-center pl-3 focus:outline-none"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
              autoComplete="current-password"
            />
            <a className="cursor-pointer" onClick={handleShowOnClick}>
              show
            </a>
          </div>
          <button
            type="submit"
            className="self-center mt-5 border border-black h-[40px] w-[100px] rounded-xl"
          >
            Submit
          </button>
        </form>
      </section>
    </div>
  );
};

export default Login;
