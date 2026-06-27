import axios from "axios";

const API = axios.create({
  // Automatically switches to your live Render link when deployed
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1",
  withCredentials: true,
});

export default API;