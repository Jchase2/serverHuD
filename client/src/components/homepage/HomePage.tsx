import { Grid, makeStyles } from "@material-ui/core";

const useStyles = makeStyles({
  root: {
    height: "70vh",
  },
});

const HomePage = () => {
  const classes = useStyles();
  return (
    <Grid container className={classes.root} direction="row" justifyContent="center" alignItems="center">
      <Grid item>
        <h1>Welcome to serverHuD!</h1>
      </Grid>
    </Grid>
  );
};

export default HomePage;
