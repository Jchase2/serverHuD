import Server from "./Server";
import AddServer from "./AddServer";
import { ErrorShow } from "../../components/Error/ErrorShow";
import { useEffect, useState } from "react";
import { useAddServer, useGetServers } from "../../services/api/servers";
import {
  Container,
  Flex,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";
import { useHistory } from "react-router";

const Dashboard = (props: any) => {

  const [stateMessage, setStateMessage] = useState<string>("");
  const [closed, setClosed] = useState(true);
  const { data, isLoading, isError, error } = useGetServers();
  const addNewServer = useAddServer();
  const history = useHistory();

  useEffect(() => {
    if(!socket.connected) {
      socket.connect();
    }
  }, [])

  useReactQuerySubscription();

  const displayServerList = (serverData: any) => {
    return (
      <div key={serverData.url}>
        <WrapItem>
          <Server serverData={serverData} />
        </WrapItem>
      </div>
    );
  };

  if (isLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

      // TODO: Replace with error component.
  if (isError) {
    // If not logged in or token expired,
    // push to login screen.
    if(error.response.status === 401) {
      history.push("/login");
    } else {
      setStateMessage(error.response.data)
    }
    // TODO: Replace with error component.
    return <p>ERROR</p>
  }

  return (
    <Flex direction={'column'} align={'center'} justify={'center'}>
      <AddServer addNewServer={addNewServer} />
      <ErrorShow
        message={stateMessage}
        closed={closed}
        setClosed={setClosed}
        isError={isError}
      />
      <Wrap minW={"80vw"} justify={'center'}>
        {data?.length ? (
          data.map((e: any) => displayServerList(e))
        ) : (
          <Text align="center">
            You are not monitoring any servers, add one to get started!
          </Text>
        )}
      </Wrap>
    </Flex>
  );
};

export default Dashboard;
