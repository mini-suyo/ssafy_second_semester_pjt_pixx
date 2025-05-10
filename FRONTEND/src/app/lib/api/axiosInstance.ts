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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJrYWthb19pZCI6MSwidXNlcl9lbWFpbCI6InR0Iiwibmlja25hbWUiOiJ0dCIsInVzZXJfaWQiOjEsImlhdCI6MTc0Njg5ODI5MSwiZXhwIjoxNzQ2OTAxODkxfQ.52tPCgVZymhBXZn1hsEMfKhbYwWfn0NIiR4A5fovUBM`,
  },
});

export default axiosInstance;
