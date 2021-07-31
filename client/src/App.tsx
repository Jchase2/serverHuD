import "./App.css";
import "@fontsource/roboto";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import Login from "./components/login/Login";
import HomePage from "./components/homepage/HomePage";
import Register from "./components/register/Register";
import { Grid } from "@material-ui/core";
import { useState } from "react";
import PrivateRoute from './components/private/PrivateRoute';

function App() {
  let initialState = 'false';
  if(localStorage.getItem('accessToken')){
    initialState = 'true';
  }
  const [isAuthed, setIsAuthed] = useState(initialState);

  const setAuth = () => {
    if(localStorage.getItem('accessToken') !== null){
      localStorage.setItem('authed', 'true');
      setIsAuthed('true');
    }
  };

  const globalLogOut = () => {
    if(localStorage.getItem('accessToken')){
      localStorage.clear();
      setIsAuthed('false');
    }
  }

  return (
    <Router>
      <Header isAuthed={isAuthed} logOut={globalLogOut}/>
      <Grid container justifyContent="center" alignItems="center">
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
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </Grid>
    </Router>
  );
}

export default App;
