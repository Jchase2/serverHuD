import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: true,
};

const theme = extendTheme({ config });

const root = createRoot(document.getElementById("root") as HTMLElement); // createRoot(container!) if you use TypeScript

root.render(
  <ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>
);
