import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDeleteServer, useGetServerUsage } from "../../services/api/api";

import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Wrap,
} from "@chakra-ui/react";

import { useHistory } from "react-router-dom";
import ServerStatus from "./ServerStatus";
import { useGetIndServer, useGetUpData } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";
import ResourceUsage from "./ResourceUsage";

const ServerDash = (props: any) => {
  const history = useHistory();
  const location = useLocation();
  const parts = location.pathname.split("/");
  const paramStr = parts[parts.length - 1];
  const deleteServer = useDeleteServer(paramStr);
  const { data, isLoading, isError, error } = useGetIndServer(paramStr);
  const upData = useGetUpData(paramStr);

  const {
    isLoading: serverUsageLoading,
    error: serverUsageError,
    data: serverUsageData,
  } = useGetServerUsage(paramStr);

  useReactQuerySubscription();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    if (data) {
      console.log("EMITTING UPCHECK");
      socket.emit("upCheck", {
        id: data.id,
        url: data.url,
        status: data.status,
        sslStatus: data.sslStatus,
        enableHud: data.optionalUrl ? true : false
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    console.log("SERVER USAGE DATA CHANGED: ", serverUsageData)
  }, [serverUsageData])

  if (isLoading || upData.isLoading || serverUsageLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  if (serverUsageError) {
    console.log("SERVER USAGE ERROR!");
  }

  // TODO: Replace with error component.
  if (isError) {
    // If not logged in or token expired,
    // push to login screen.
    if (error.response.status === 401) {
      history.push("/login");
    }
    // TODO: Replace with error component.
    return <p>ERROR</p>;
  }

  return (
    <Container centerContent width={"100%"} maxWidth={"100%"}>
      <Heading size="md">Server: {data.url}</Heading>
      <Wrap minW={"80vw"} justify={"center"} mt={2}>
        <ServerStatus serverData={data} upData={upData.data} />
        {serverUsageData?.memObj?.length > 1 ||
        serverUsageData?.cpuObj?.length > 1 ? (
          <ResourceUsage
            serverData={data}
            upData={upData.data}
            serverUsageData={serverUsageData}
          />
        ) : null}
      </Wrap>
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
              deleteServer.mutate();
              // TODO: Invalidate data in server.
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
