import React, { useState } from "react";
import PropTypes from 'prop-types';

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

Layout.propTypes = {
  children: PropTypes.node,
  labels: PropTypes.string,
};

Layout.defaultProps = {
  children: null,
  labels: null,
};
