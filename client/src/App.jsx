import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import Login from "./pages/Login";
import RequireAuth from "./pages/RequireAuth";
import Layout from "./pages/Layout";

export const axiosPrivate = axios.create({
  baseURL: "http://localhost:4123/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
})

const App = () => {
  axios.defaults.baseURL = "http://localhost:4123/";
  
  return (
    <Routes>
      <Route path="/" element={<Layout />} >
        <Route path="login" element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="home" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
