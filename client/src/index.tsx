import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { Grommet, grommet } from "grommet";
import { ChakraProvider } from "@chakra-ui/react"
// 1. import `extendTheme` function
import { extendTheme } from "@chakra-ui/react"
// 2. Add your color mode config
const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
}
// 3. extend the theme
const theme = extendTheme({ config })

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Grommet theme={grommet}>
        <App />
      </Grommet>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
