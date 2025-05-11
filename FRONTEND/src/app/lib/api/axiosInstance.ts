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
    Authorization: `Bearer eyJhbGciOiJIUzI1NiJ9.eyJrYWthb19pZCI6MSwidXNlcl9lbWFpbCI6InR0Iiwibmlja25hbWUiOiJ0dCIsInVzZXJfaWQiOjEsImlhdCI6MTc0Njk2OTQyMSwiZXhwIjoxNzQ2OTczMDIxfQ.wPTBx9ZNonZcPT8C7-GhriUR4GagjwaSjypbdU6JZ4E`,
  },
});

export default axiosInstance;
