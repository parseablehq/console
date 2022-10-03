import React from "react";
import { Navigate } from "react-router-dom";

const PublicLayout = ({ children }) => {
  const auth = localStorage.getItem("auth");

  if (!auth) return <Navigate to="/" />;

  return (
    <div>
      <div>{children}</div>
    </div>
  );
};

export default PublicLayout;
