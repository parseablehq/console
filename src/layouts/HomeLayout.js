import React from "react";
import { Navigate } from "react-router-dom";
import Navbar from "../components/Layout/Navbar";

const HomeLayout = ({ children }) => {
  const auth = localStorage.getItem("auth");

  if (!auth) return <Navigate to="/" />;

  return (
    <>
      <Navbar />
      <div className="flex">{children}</div>
    </>
  );
};
export default HomeLayout;
