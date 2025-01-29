import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import Login from "./pages/Login";
import RequireAuth from "./pages/RequireAuth";
import Layout from "./pages/Layout";

export const axiosPrivate = axios.create({
  baseURL: "http://192.168.29.229:4123/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
})

const App = () => {
  axios.defaults.baseURL = "http://192.168.29.229:4123/";
  
  return (
    <Routes>
      <Route path="/" element={<Layout />} >
        <Route index element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="home" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
