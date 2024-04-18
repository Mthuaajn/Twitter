// eslint-disable-next-line
import { useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
export default function login() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [params] = useSearchParams();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");
    const newUser = params.get("new_user");
    const verify = params.get("verify");
    console.log(newUser, verify);
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);
    navigate("/");
  }, [params, navigate]);
  return <div>login</div>;
}
