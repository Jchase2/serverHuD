import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";
import { Grommet } from "grommet";

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({ config });

ReactDOM.render(
  <React.StrictMode>
    <Grommet plain>
      <ChakraProvider theme={theme}>
        <App />
      </ChakraProvider>
    </Grommet>
  </React.StrictMode>,
  document.getElementById("root")
);
