import axios from "axios";

// Creamos una instancia "oficial" para conectarnos a nuestra API
const api = axios.create({
  baseURL: "http://localhost:3000",
});

export default api;
