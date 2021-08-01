import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid/Grid";
import { useHistory } from "react-router-dom";


const useStyles = makeStyles({
  root: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
    alignContent: "center",
    justifyContent: "center",
  },
  pos: {
    marginBottom: 12,
  },
});

const Server = (props: any) => {
  const history = useHistory();
  console.log("props.serverData: ", props.serverData)
  const classes = useStyles();
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      <Card className={classes.root}>
        <CardContent>
          <Typography
            className={classes.title}
            color="textSecondary"
            gutterBottom
          >
            {props.serverData.url}
          </Typography>
          <Typography variant="h5" component="h2">
            {props.serverData.name}
          </Typography>
          <Typography variant="body2" component="p">
            SSL: {props.serverData.sslStatus === "true" ? 'Active' : 'Down!'}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={() => history.push("/serverinfo")}>More Info</Button>
        </CardActions>
      </Card>
    </Grid>
  );
};

export default Server;
