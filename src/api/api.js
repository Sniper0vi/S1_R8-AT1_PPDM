import axios from "axios";

const api = axios.create({
    baseURL:'https://bleach-api-8v2r.onrender.com/'
});

export default api;