import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

export default axios.create({
  baseURL: apiUrl,
});

export const axiosPrivate = axios.create({
  baseURL: "http://192.168.29.229:4123/",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});
