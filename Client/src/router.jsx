import { createBrowserRouter } from "react-router-dom";

import Home from "./home";
import Login from "./login";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login/oauth",
    element: <Login />,
  },
]);

export default router;
