import { createBrowserRouter } from "react-router-dom";

import Home from "./home";
import Login from "./login";
import ForgotPassword from "./VerifyForgotPasswordToken";
import VerifyEmail from "./VerifyEmail";
import ResetPassword from "./ResetPassword";
import Chat from "./chat";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login/oauth",
    element: <Login />,
  },
  {
    path: "verify-email",
    element: <VerifyEmail />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/chat",
    element: <Chat />,
  },
]);

export default router;
