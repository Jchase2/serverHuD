import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Box, Button as GrommetButton, Grommet } from 'grommet';
import { normalizeColor } from 'grommet/utils';
import { rgba } from 'polished';


ReactDOM.render(
  <React.StrictMode>
    <Grommet>
      <App />
    </Grommet>
  </React.StrictMode>,
  document.getElementById("root")
);
