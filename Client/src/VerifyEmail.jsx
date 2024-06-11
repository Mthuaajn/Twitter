import { useEffect, useState } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";

export default function VerifyEmail() {
  let [message, setMessage] = useState(); // [1
  const { token } = useQueryParams();
  useEffect(() => {
    const controller = new AbortController(); // tao doi tuong huy goi api
    if (token) {
      axios
        .post(
          "/users/verify-email",
          { email_verify_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((res) => {
          setMessage(res.data.message);
          alert("Email verified successfully");
          if (res.data.result) {
            const { refresh_token, access_token } = res.data.result;
            localStorage.setItem("access_token", access_token);
            localStorage.setItem("refresh_token", refresh_token);
          }
        })
        .catch((error) => {
          setMessage(error.message);
          console.error("There was an error!", error);
          alert("Failed to verify email");
        });
    }
    return () => {
      controller.abort();
    };
  }, [token]);
  return <div>{message}</div>;
}
