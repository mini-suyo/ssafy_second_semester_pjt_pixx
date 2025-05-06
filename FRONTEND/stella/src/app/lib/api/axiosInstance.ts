import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// const instance = axios.create({
//   baseURL: API_BASE_URL,
//   withCredentials: true,
// });

// export default instance;

// 임시 api테스트용

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2VtYWlsIjoidHQiLCJuaWNrbmFtZSI6InR0IiwidXNlcl9pZCI6MSwia2FrYW9faWQiOjEsImlhdCI6MTc0NjU2MDI3NiwiZXhwIjoxNzQ2NTYzODc2fQ.0mBe8DB8326MU5073n50J8HuPg6P88gGSIuvK7Lc8HA`,
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
