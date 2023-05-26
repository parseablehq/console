import AppRouter from "@/routes";
import { Fragment } from "react";
import ScrollToTop from "./ScrollToTop";

const App = () => {
  return (
    <Fragment>
      <AppRouter />
      <ScrollToTop />
    </Fragment>
  );
};

export default App;
