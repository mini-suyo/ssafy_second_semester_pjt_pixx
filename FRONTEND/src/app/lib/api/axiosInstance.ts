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
  withCredentials: true,
  headers: {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJuaWNrbmFtZSI6InR0IiwidXNlcl9lbWFpbCI6InR0Iiwia2FrYW9faWQiOjEsInVzZXJfaWQiOjEsImlhdCI6MTc0NjY3OTczMCwiZXhwIjoxNzQ2NjgzMzMwfQ.9DCXfi6FhLJF6WwLTH6KclO14GL6Dua5wt36U7Cv_6s`,
  },
});

export default axiosInstance;
