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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJuaWNrbmFtZSI6InR0IiwidXNlcl9pZCI6MSwia2FrYW9faWQiOjEsInVzZXJfZW1haWwiOiJ0dCIsImlhdCI6MTc0NjUzODg3MiwiZXhwIjoxNzQ2NTQyNDcyfQ.ta8R1na9LlCbYsmW6L9iqhFPYo5lGVAdsQPdKwkFCCg`,
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
