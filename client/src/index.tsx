import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Box, Button as GrommetButton, Grommet, grommet } from "grommet";
import { normalizeColor } from "grommet/utils";
import { rgba } from "polished";

const customTheme = {
  global: {
    colors: {
      custom: "#cc6633",
    },
  },
};

ReactDOM.render(
  <React.StrictMode>
    <Grommet theme={grommet}>
      <App />
    </Grommet>
  </React.StrictMode>,
  document.getElementById("root")
);
