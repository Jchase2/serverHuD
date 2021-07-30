import Box from "@material-ui/core/Box";
import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { useState } from "react";
import { loginFunc } from "../../services/api";

const Register = () => {
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

  const handleSubmit = (e: any) => {
    e.preventDefault();

    loginFunc({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setLoginState({
      email: "",
      password: "",
      confirmPass: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="standard-basic"
        name="email"
        label="Email"
        variant="standard"
        value={loginState.email}
        onChange={handleChange}
      />
      <TextField
        id="standard-password-input"
        name="password"
        label="Password"
        variant="standard"
        type="password"
        autoComplete="current-password"
        value={loginState.password}
        onChange={handleChange}
      />
      <TextField
        id="standard-password-input"
        name="confirmPass"
        label="Confirm Password"
        variant="standard"
        type="password"
        value={loginState.confirmPass}
        onChange={handleChange}
      />
      <Button type="submit" color="inherit" variant="contained">
        Register
      </Button>
    </form>
  );
};

export default Register;
