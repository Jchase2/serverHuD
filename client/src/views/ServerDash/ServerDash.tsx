import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetServerUsage } from "../../services/api/api";

import {
  Box,
  Button,
  Center,
  Container,
  HStack,
  Heading,
  Wrap,
} from "@chakra-ui/react";

import ServerStatus from "./ServerStatus";
import { useGetIndServer, useGetUpData } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";
import ResourceUsage from "./ResourceUsage";
import Upgrades from "./Upgrades";
import DiskStatus from "./DiskStatus";
import { UpdateServer } from "../../components/UpdateServer/UpdateServer";
import { DeleteServer } from "./DeleteServer";

const ServerDash = () => {
  const location = useLocation();
  const parts = location.pathname.split("/");
  const paramStr = parts[parts.length - 1];
  const { data, isLoading, isError, error } = useGetIndServer(Number(paramStr));
  const upData = useGetUpData(paramStr);
  const navigate = useNavigate();

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
        enableHud: data.optionalUrl ? true : false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

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
    if (error.response?.status === 401) {
      navigate("/login");
    }
    // TODO: Replace with error component.
    return <p>ERROR</p>;
  }

  return (
    <Container centerContent width={"100%"} maxWidth={"100%"}>
      <HStack m={3}>
        <UpdateServer data={data} />
        <Heading size="md">Server: {data.name}</Heading>
      </HStack>
      <Wrap minW={"80vw"} justify={"center"} mt={2}>
        <ServerStatus serverData={data} upData={upData.data} />
        {data?.diskUsed > -1 && data?.diskSize > -1 ? (
          <DiskStatus data={data} />
        ) : null}
        {(serverUsageData && serverUsageData.memObj.length > 1) ||
        (serverUsageData && serverUsageData.cpuObj.length > 1) ? (
          <ResourceUsage
            serverUsageData={serverUsageData}
            upData={upData.data}
          />
        ) : null}
        {data?.upgrades && data?.upgrades !== "empty" ? (
          <Upgrades upgrades={data.upgrades} />
        ) : null}
      </Wrap>
      <Center>
        <Box p={8} m={2}>
          <Button
            m={2}
            colorScheme="facebook"
            variant="outline"
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
          <DeleteServer paramStr={paramStr} />
        </Box>
      </Center>
    </Container>
  );
};

export default ServerDash;
