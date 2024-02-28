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
import { ReactElement, useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Socket, io } from "socket.io-client";
import { queryClient } from "./services/socket";
import { verifyUser, userLogout } from "./services/api/api";

export const socket = io(process.env.REACT_APP_BACKEND_URL || 'localhost:3001', {
  withCredentials: true,
  transports: ["websocket"],
  autoConnect: false,
});

function App() {
  const [isAuthed, setIsAuthed] = useState(localStorage.getItem("authed") || "false");

  useEffect(() => {
    const fetchId = async () => {
      try {
        const resp = await verifyUser();
        if (resp?.userId) {
          setIsAuthed("true");
          localStorage.setItem("authed", "true");
        } else {
          setIsAuthed("false");
          localStorage.setItem("authed", "false");
        }
      } catch (err) {
        console.log("Err: ", err)
      }
    };

    fetchId();
  }, []);

  const globalLogOut = async () => {
    try {
      await userLogout();
      localStorage.setItem("authed", "false");
      setIsAuthed("false");
      if (socket.connected) {
        if (socket instanceof Socket) socket.disconnect();
      }
    } catch (err) {
      console.log("ERROR LOGGING OUT: ", err);
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
            element={localStorage.getItem("authed") === "true" ? <Dashboard /> : <HomePage />}
          />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login isAuthed={isAuthed} setIsAuthed={setIsAuthed}/>} />
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
