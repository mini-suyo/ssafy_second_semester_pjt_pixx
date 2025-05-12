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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2VtYWlsIjoidHQiLCJrYWthb19pZCI6MSwidXNlcl9pZCI6MSwibmlja25hbWUiOiJ0dCIsImlhdCI6MTc0NzA3MzY3MSwiZXhwIjoxNzQ3MDc3MjcxfQ.aVoDRTyEfCxvGGJYifxLU8pxZiXK7Reovb3ZsvLrhSs`,
  },
});

export default axiosInstance;
