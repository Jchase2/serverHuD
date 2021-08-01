import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { useState } from "react";
import { registerFunc } from "../../services/api";
import { useHistory } from "react-router-dom";


const Register = () => {

  const history = useHistory();


  const [registerState, setRegisterState] = useState({
    email: "",
    password: "",
    confirmPass: "",
  });

  const handleChange = (e: any) => {
    setRegisterState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let res = await registerFunc({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setRegisterState({
      email: "",
      password: "",
      confirmPass: "",
    });

    if(res === 201){
      history.push('/login');
    } else {
      alert("Registration failed! Please try again.")
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
            value={registerState.email}
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
            value={registerState.password}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-password-input"
            name="confirmPass"
            label="Confirm Password"
            variant="standard"
            type="password"
            value={registerState.confirmPass}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <Button type="submit" color="inherit" variant="contained">
            Register
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default Register;
