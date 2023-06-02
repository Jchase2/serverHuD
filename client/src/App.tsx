import "./App.css";
import "@fontsource/roboto";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Dashboard from "./views/Dashboard/Dashboard";
import Login from "./views/Login/Login";
import HomePage from "./views/Homepage/HomePage";
import Register from "./views/Register/Register";
import ServerDash from "./views/ServerDash/ServerDash";
import Upgrades from "./views/ServerDash/Upgrades";
import { useState } from "react";
import PrivateRoute from "./components/Private/PrivateRoute";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Socket, io } from "socket.io-client";
import { queryClient } from "./services/socket";

// TODO: Replace localhost with .env backend url.
export const socket = io("localhost:3001", {
  auth: {
    token: localStorage.getItem("accessToken"),
  },
  transports: ["websocket"],
  autoConnect: false
});

function App() {
  let initialState = "false";
  if (localStorage.getItem("accessToken")) {
    initialState = "true";
  }

  const [isAuthed, setIsAuthed] = useState(initialState);

  const setAuth = () => {
    if (localStorage.getItem("accessToken") !== null) {
      localStorage.setItem("authed", "true");
      setIsAuthed("true");
    }
  };

  const globalLogOut = () => {
    if (localStorage.getItem("accessToken")) {
      localStorage.clear();
      setIsAuthed("false");
      if (socket.connected) {
        if (socket instanceof Socket) socket.disconnect();
      }
    }
  };

  return (
    <Router>
      <Header isAuthed={isAuthed} globalLogOut={globalLogOut} />
      <QueryClientProvider client={queryClient}>
        <Switch>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login setAuth={setAuth} />
          </Route>
          <PrivateRoute isAuthed={isAuthed} path="/dashboard">
            <Dashboard />
          </PrivateRoute>
          <PrivateRoute isAuthed={isAuthed} path="/server/:id/upgrades">
            <Upgrades />
          </PrivateRoute>
          <PrivateRoute isAuthed={isAuthed} path="/server/:id">
            <ServerDash />
          </PrivateRoute>
          <Route path="/">
            {isAuthed === "true" ? <Redirect to="/dashboard" /> : <HomePage />}
          </Route>
          <ReactQueryDevtools initialIsOpen={true} />
        </Switch>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
