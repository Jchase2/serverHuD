import "./App.css";
import "@fontsource/roboto";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Dashboard from "./components/dashboard/Dashboard";
import Register from "./components/register/Register";
import { Grid } from "@material-ui/core";
function App() {
  return (
    <Router>
      <Header />
      <Grid container justify="center" alignItems="center">
        <Switch>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/">
            <Dashboard />
          </Route>
        </Switch>
      </Grid>
    </Router>
  );
}

export default App;
