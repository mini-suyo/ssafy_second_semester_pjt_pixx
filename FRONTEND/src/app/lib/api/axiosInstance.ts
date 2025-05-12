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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJrYWthb19pZCI6MSwidXNlcl9lbWFpbCI6InR0Iiwibmlja25hbWUiOiJ0dCIsInVzZXJfaWQiOjEsImlhdCI6MTc0NzA1ODk1MiwiZXhwIjoxNzQ3MDYyNTUyfQ.Rm0qU55BNdHXqvkOu22sVanU7eBV4fmOfxO_Q-YNXtc`,
  },
});

export default axiosInstance;
