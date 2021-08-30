import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Grommet, grommet } from "grommet";
import { ChakraProvider } from "@chakra-ui/react"

// const customTheme = {
//   global: {
//     colors: {
//       custom: "#cc6633",
//     },
//   },
// };

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <Grommet theme={grommet}>
        <App />
      </Grommet>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
