import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";
import Login from "./pages/Login";
import RequireAuth from "./pages/RequireAuth";
import Layout from "./pages/Layout";
import PersistLogin from "./components/PersistLogin";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Login />} />

        <Route element={<PersistLogin />} >
          <Route element={<RequireAuth />}>
            <Route path="home" element={<Home />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};

export default App;
