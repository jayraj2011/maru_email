import axios from "axios";

const apiUrl = "http://192.168.0.103:4123/";

export default axios.create({
  baseURL: apiUrl,
});

export const axiosPrivate = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
