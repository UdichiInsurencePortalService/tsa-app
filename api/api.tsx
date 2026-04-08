import axios from "axios";

const api = axios.create({
  baseURL: "https://talent-assess.in/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
