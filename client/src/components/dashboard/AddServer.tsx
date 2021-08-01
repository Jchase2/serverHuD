import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { useState } from "react";

const AddServer = (props: any) => {
  const [serverState, setServerState] = useState({
    url: "",
    name: "",
    status: "",
    sslStatus: "",
    sslExpiry: 0
  });

  const handleChange = (e: any) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    props.addNewServer(serverState);
    setServerState({
      url: "",
      name: "",
      status: "",
      sslStatus: "",
      sslExpiry: 0
    });
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
            name="name"
            label="Name"
            variant="standard"
            value={serverState.name}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <TextField
            id="standard-password-input"
            name="url"
            label="url"
            variant="standard"
            value={serverState.url}
            onChange={handleChange}
            fullWidth
            style={{ marginBottom: "2em" }}
          />
        </Grid>
        <Grid item>
          <Button type="submit" color="inherit" variant="contained">
            Submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default AddServer;
