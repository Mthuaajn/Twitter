import { useEffect, useState } from "react";
import useQueryParams from "./useQueryParams";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function VerifyForgotPasswordToken() {
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { token } = useQueryParams();
  useEffect(() => {
    const controller = new AbortController(); // tao doi tuong huy goi api
    if (token) {
      axios
        .post(
          "/users/verify-forgot-password",
          { forgot_password_token: token },
          {
            baseURL: import.meta.env.VITE_API_URL,
            signal: controller.signal,
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then(() => {
          // Bên cái trang ResetPassword của chúng ta nó cần cái forgot_password_token để gửi lên API
          // Ở đây chúng ta có 2 cách để cái trang ResetPassword nó nhận cái forgot_password_token này
          // Cách 1: Tại đây chúng ta lưu cái forgot_password_token này vào localStorage
          // Và bên trang ResetPassword này chỉ cần get ra mà dùng là được

          // Cách 2: Chúng ta dùng state của React Router để truyền cái forgot_password_token này qua trang ResetPassword
          navigate("/reset-password", { state: { forgot_password_token: token } });
        })
        .catch((error) => {
          setMessage(error.message);
        });
    }
    return () => {
      controller.abort();
    };
  }, [token, navigate]);
  return <div>{message}</div>;
}
