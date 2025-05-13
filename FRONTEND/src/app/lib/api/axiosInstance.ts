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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJuaWNrbmFtZSI6InR0IiwidXNlcl9pZCI6MSwia2FrYW9faWQiOjEsInVzZXJfZW1haWwiOiJ0dCIsImlhdCI6MTc0NzExNzkwOSwiZXhwIjoxNzQ3MTIxNTA5fQ.pALtPf6ZD3jZaRRc-dg3FVImOYiLiVotBquhPmShCmo`,
  },
});

export default axiosInstance;
