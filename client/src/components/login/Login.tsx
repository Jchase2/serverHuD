import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { useState } from "react";
import { loginFunc } from "../../services/api";
import { useHistory } from "react-router-dom";


const Login = (props: any) => {

  const history = useHistory();

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    confirmPass: "",
  });

  const handleChange = (e: any) => {
    setLoginState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let result = await loginFunc({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setLoginState({
      email: "",
      password: "",
      confirmPass: "",
    });

    if(result?.status === 200){
      console.log("Logged in!")
      localStorage.setItem('accessToken', result.data.accessToken);
      // sets authed to true in root component.
      props.setAuth();
      history.push('/dashboard')
    } else {
      console.log("Error")
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        direction="column"
        align-items="center"
        justifyContent="center"
        style={{ marginBottom: "2em" }}
      >
        <Grid item>
          <TextField
            id="standard-basic"
            name="email"
            label="Email"
            variant="standard"
            value={loginState.email}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-password-input"
            name="password"
            label="Password"
            variant="standard"
            type="password"
            autoComplete="current-password"
            value={loginState.password}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <Button type="submit" color="inherit" variant="contained">
            Login
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default Login;
