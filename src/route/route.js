import React, { Suspense } from "react";
import HomeLayout from "../layouts/HomeLayout";

// Login route is public
const Login = React.lazy(() => import("../page/Login"));
const LoginRoute = () => (
  <Suspense>
    <Login />
  </Suspense>
);

// ForgotPassword route is public
const ForgotPassword = React.lazy(() => import("../page/ForgotPassword"));
const ForgetPasswordRoute = () => (
  <Suspense>
    <ForgotPassword />
  </Suspense>
);

// Dashboard route is private
const Dashboard = React.lazy(() => import("../page/Dashboard"));
const DashboardRoute = () => (
  <Suspense>
    <HomeLayout>
      <Dashboard />
    </HomeLayout>
  </Suspense>
);

export { LoginRoute, ForgetPasswordRoute, DashboardRoute };
