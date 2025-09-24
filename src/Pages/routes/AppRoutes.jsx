import { Routes, Route } from "react-router-dom";
import { SignIn } from "../SignIn.jsx";
import { SignUp } from "../SignUp.jsx";
import { NotFound } from "../NotFound.jsx";
import { UserPage } from "../UserPage.jsx";
import { PrivateRoute } from "../PrivateRoute.jsx";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/signup" element={<SignUp />} />

      <Route
        path="/user"
        element={
          <PrivateRoute>
            <UserPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
