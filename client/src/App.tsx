import "./App.css";
import "@fontsource/roboto";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header/Header";
import Dashboard from "./views/Dashboard/Dashboard";
import Login from "./views/Login/Login";
import HomePage from "./views/Homepage/HomePage";
import Register from "./views/Register/Register";
import ServerDash from "./views/ServerDash/ServerDash";
import { ReactElement, useState } from "react";
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
  autoConnect: false,
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

  interface ReqProps {
    children: ReactElement;
    redirectTo: string;
  }

  function RequireAuth({ children, redirectTo }: ReqProps) {
    return isAuthed === "true" ? children : <Navigate to={redirectTo} />;
  }

  return (
    <Router>
      <Header isAuthed={isAuthed} globalLogOut={globalLogOut} />
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route
            path="/"
            element={isAuthed === "true" ? <Dashboard /> : <HomePage />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setAuth={setAuth} />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth redirectTo="/login">
                <Dashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/server/:id"
            element={
              <RequireAuth redirectTo="/login">
                <ServerDash />
              </RequireAuth>
            }
          />
          <Route element={<ReactQueryDevtools initialIsOpen={true} />} />
        </Routes>
      </QueryClientProvider>
    </Router>
  );
}

export default App;
