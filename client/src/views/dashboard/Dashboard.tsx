import Server from "../../components/server/Server";
import AddServer from "./AddServer";
import { ErrorShow } from "../../components/Error/ErrorShow";
import { useState, useEffect } from "react";
import { getServers, postServer } from "../../services/api";
import { Main, Box } from "grommet";
// import useInterval from "../../services/useInterval";

const Dashboard = (props: any) => {
  interface IServer {
    serverList: string[];
  }

  const [serverList, setServerList] = useState<IServer[]>([]);
  const [isError, setIsError] = useState<boolean>(false);
  const [stateMessage, setStateMessage] = useState<string>("");

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
    postServer(newServer).then((e) => {
      if (e.status !== 201) {
        setStateMessage(
          "Soemthing went wrong! Please check your input and try again."
        );
        setIsError(true);
      }
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
      <ErrorShow
        message={stateMessage}
        isClosed={isError}
        setIsError={setIsError}
      />
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
