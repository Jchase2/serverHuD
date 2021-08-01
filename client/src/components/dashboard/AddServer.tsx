import TextField from "@material-ui/core/TextField";
import { Button } from "@material-ui/core";
import { Grid } from "@material-ui/core";
import { useState } from "react";

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
    props.addNewServer(serverState)
    setServerState({
      url: "",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        direction="row"
        align-items="center"
        justifyContent="center"
      >
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
        <Button type="submit" color="inherit" variant="contained">
          Add Server
        </Button>
      </Grid>
    </form>
  );
};

export default AddServer;
