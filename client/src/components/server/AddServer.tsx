import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { useState } from "react";
import { postServer } from "../../services/api";


const AddServer = (props: any) => {

  const [serverState, setServerState] = useState({
    url: "",
  });

  const handleChange = (e: any) => {
    setServerState({
      url: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    postServer(serverState);
    setServerState({
      url: ""
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
            name="server"
            label="Server URL"
            variant="standard"
            value={serverState.url}
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

export default AddServer;
