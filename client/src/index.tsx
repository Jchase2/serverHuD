import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Grommet, grommet } from "grommet";

// const customTheme = {
//   global: {
//     colors: {
//       custom: "#cc6633",
//     },
//   },
// };

ReactDOM.render(
  <React.StrictMode>
    <Grommet theme={grommet}>
      <App />
    </Grommet>
  </React.StrictMode>,
  document.getElementById("root")
);
