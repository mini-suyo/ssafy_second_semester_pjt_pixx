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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJrYWthb19pZCI6MSwidXNlcl9pZCI6MSwibmlja25hbWUiOiJ0dCIsInVzZXJfZW1haWwiOiJ0dCIsImlhdCI6MTc0Njk3NjEyNiwiZXhwIjoxNzQ2OTc5NzI2fQ.sd7Bu-UNtcui1JUN_PyWMmrF1VqXAyiUEIyjcJVM80M`,
  },
});

export default axiosInstance;
