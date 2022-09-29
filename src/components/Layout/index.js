import React, { useState } from "react";

import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function Layout({ children, labels }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Navbar setSidebarOpen={setSidebarOpen} />
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        labels={labels}
      />
      <div className="flex">
        {children}
      </div>
    </>
  );
}
