import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import axios from "axios";

const App = () => {
  axios.defaults.baseURL = "http://localhost:4123/";
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
};

export default App;
