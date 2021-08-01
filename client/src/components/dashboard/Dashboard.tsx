import Server from "../server/Server";
import AddServer from "./AddServer";
import { Grid } from "@material-ui/core";

const Dashboard = (props: any) => {

  const displayServerList = (servUrl: any) => {
    if (servUrl) {
      return (
        <div key={servUrl}>
          <Server serverUrl={servUrl}/>
        </div>
      );
    } else {
      return (
        <div>You are not monitoring any servers, add one to get started!</div>
      );
    }
  };

  return (
    <>
      <AddServer addNewServer={props.addNewServer}/>
      <Grid container justifyContent="center">
        {props.serverList.map((e: any) => displayServerList(e?.url))}
      </Grid>
    </>
  );
};

export default Dashboard;
