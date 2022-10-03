import React from "react";
import "./App.css";
import { Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { DashboardRoute, ForgetPasswordRoute, LoginRoute } from "./route/route";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<LoginRoute />} />
        <Route path="/forgot-password" element={<ForgetPasswordRoute />} />
        <Route path="/index.html" element={<DashboardRoute />} />
      </Routes>
      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default App;
