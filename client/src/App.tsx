import "./App.css";
import "@fontsource/roboto";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import Login from './components/login/Login';
import HomePage from './components/homepage/HomePage';
import Register from "./components/register/Register";
import { Grid } from "@material-ui/core";
import { useState } from 'react';

function App() {
  const [isAuthed, setIsAuthed] = useState(false);
  const setAuth = () => {
    setIsAuthed(true)
  }
  return (
    <Router>
      <Header isAuthed={isAuthed}/>
      <Grid container justifyContent="center" alignItems="center">
        <Switch>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/login">
            <Login setAuth={setAuth}/>
          </Route>
          <Route path="/dashboard">
            <Dashboard />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </Grid>
    </Router>
  );
}

export default App;
