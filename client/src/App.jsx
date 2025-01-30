import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import Login from "./pages/Login";
import RequireAuth from "./pages/RequireAuth";
import Layout from "./pages/Layout";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />

        <Route element={<RequireAuth />}>
          <Route path="home" element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
