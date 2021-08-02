import { Grid, makeStyles } from "@material-ui/core";
import { Button } from 'grommet';
import { useHistory } from "react-router-dom";


const useStyles = makeStyles({
  root: {
    height: "70vh",
  },
});

const HomePage = () => {
  const history = useHistory();
  const classes = useStyles();
  return (
    <Grid container className={classes.root} direction="column" justifyContent="center" alignItems="center">
      <Grid item>
        <h1>Keep an eye on your servers with serverHuD.</h1>
      </Grid>
      <Grid item>
        <Button plain={false} onClick={() => history.push("/register")}>
          Sign Up
        </Button>
      </Grid>
    </Grid>
  );
};

export default HomePage;
