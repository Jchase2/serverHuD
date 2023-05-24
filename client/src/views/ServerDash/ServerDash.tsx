import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { deleteServer } from "../../services/api/api";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
} from "@chakra-ui/react";

import { useHistory } from "react-router-dom";
import ServerStatus from "./ServerStatus";
import { useGetIndServer, useGetUpData } from "../../services/api/servers";
import { Loading } from "../../components/Loading/Loading";
import { socket } from "../../services/socket";

const ServerDash = (props: any) => {
  const location = useLocation();
  const parts = location.pathname.split("/");
  const paramStr = parts[parts.length - 1];
  const { data, isLoading, isError } = useGetIndServer(paramStr);
  const upData = useGetUpData(paramStr);

  useEffect(() => {
    if (data) {
      socket.emit("upCheck", {
        id: data.id,
        url: data.url,
        status: data.status,
        sslStatus: data.sslStatus,
      });
      socket.emit("liveUpCheck", {
        id: data.id,
        url: data.url,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const history = useHistory();

  if (isLoading || upData.isLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  // TODO: Replace with error component.
  if (isError) return <p>Error.</p>;

  return (
    <Container centerContent width={'100%'} maxWidth={'100%'}>
      <Heading size="md">Server: {data.url}</Heading>
      <ServerStatus serverData={data} upData={upData.data} />
      <Center>
        <Box p={8} m={2}>
          <Button
            m={2}
            colorScheme="facebook"
            variant="outline"
            onClick={() => history.push("/dashboard")}
          >
            Dashboard
          </Button>
          <Button
            colorScheme="red"
            variant="outline"
            m={2}
            onClick={() => {
              deleteServer(paramStr);
              history.push("/dashboard");
            }}
          >
            Delete
          </Button>
        </Box>
      </Center>
    </Container>
  );
};

export default ServerDash;
