import Server from "../../components/server/Server";
import AddServer from "./AddServer";
import { useState, useEffect } from "react";
import { getServers, postServer } from "../../services/api";
import { Main, Box } from "grommet";
// import useInterval from "../../services/useInterval";

const Dashboard = (props: any) => {
  interface IServer {
    serverList: string[];
  }

  const [serverList, setServerList] = useState<IServer[]>([]);

  console.log("SERVER LIST IS: ", serverList)

  useEffect(() => {
    getServers().then((e: any) => {
      if (e.data !== undefined && e.data !== "Error") {
        let newServerList = [...serverList].concat(e.data);
        setServerList(newServerList);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addNewServer = async (newServer: any) => {
    postServer(newServer).then(() => {
      getServers().then((e) => {
        setServerList(e.data);
      });
    });
  };

  // const updateServers = async () => {
  //   getServers().then((e) => {
  //     setServerList(e.data);
  //   });
  // };

  //useInterval(updateServers, 5000)

  const displayServerList = (serverData: any) => {
    return (
      <div key={serverData.url}>
        <Server serverData={serverData} />
      </div>
    );
  };

  return (
    <Main direction="column" align="center" justify="center">
      <AddServer addNewServer={addNewServer} />
      <Box
        direction="row-responsive"
        justify="center"
        align="center"
        wrap={true}
      >
        {serverList?.length ? (
          serverList.map((e: any) => displayServerList(e))
        ) : (
          <div>You are not monitoring any servers, add one to get started!</div>
        )}
      </Box>
    </Main>
  );
};

export default Dashboard;
