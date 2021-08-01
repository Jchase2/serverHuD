import Server from "../server/Server";
import AddServer from "./AddServer";
import { Grid } from "@material-ui/core";
import { useState, useEffect } from "react";
import { getServers, postServer } from "../../services/api";

const Dashboard = (props: any) => {
  interface IServer {
    serverList: string[]
  }

  const [serverList, setServerList] = useState<IServer[]>([]);

  useEffect(() => {
    getServers().then((e: any) => {
      if(e !== undefined){
        let newServerList = [...serverList].concat(e);
        setServerList(newServerList);
      }
    });
  }, []);

  const addNewServer = (newServer: any) => {
    postServer(newServer);
    setServerList([...serverList].concat(newServer));
  };

  const displayServerList = (servUrl: any) => {
    console.log(serverList);
    return (
      <div key={servUrl}>
        <Server serverUrl={servUrl} />
      </div>
    );
  };

  return (
    <>
      <AddServer addNewServer={addNewServer} />
      <Grid container justifyContent="center">
        {serverList.length ? (
          serverList.map((e: any) => displayServerList(e?.url))
        ) : (
          <div>You are not monitoring any servers, add one to get started!</div>
        )}
      </Grid>
    </>
  );
};

export default Dashboard;
