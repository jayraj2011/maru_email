import axios from 'axios';
  
export default axios.create({
    baseURL: "http://192.168.29.229:4123/",
});

export const axiosPrivate = axios.create({
    baseURL: "http://192.168.29.229:4123/",
    headers: {
      "Content-Type": "application/json",
    },
    withCredentials: true
});