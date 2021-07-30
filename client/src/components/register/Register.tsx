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

    // Call service to log in with un and pw.
    console.log("e: ", e)
    console.log('e.target.email: ', e.target.email.value)
    console.log('e.target.password: ', e.target.password.value)

    loginFunc({
      'email': e.target.email.value,
      'password': e.target.password.value
    })

    // clear form
    setLoginState({
      email: "",
      password: "",
      confirmPass: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField id="standard-basic" name="email" label="Email" variant="standard" value={loginState.email} onChange={handleChange}/>
      <TextField id="standard-basic" name="password" label="Password" variant="standard" value={loginState.password} onChange={handleChange}/>
      <TextField
        id="standard-basic"
        name="confirmPass"
        label="Confirm Password"
        variant="standard"
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
