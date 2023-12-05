import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
import SmartDisplay from "./SmartDisplay";

const ServerDash = () => {
  const location = useLocation();
  const parts = location.pathname.split("/");
  const paramStr = parts[parts.length - 1];
  const { data, isLoading, isError, error } = useGetIndServer(Number(paramStr));
  const upData = useGetUpData(paramStr);
  const navigate = useNavigate();
  const [inc, setInc] = useState('1h');
  const [incCount, setIncCount] = useState(12);

  useReactQuerySubscription();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    if (data) {
      socket.emit("upCheck", {
        id: data.id,
        url: data.url,
        status: data.status,
        sslStatus: data.sslStatus,
        enableExtensionServer: data.optionalUrl ? true : false,
        inc: inc,
        incCount: incCount
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, inc, incCount]);

  if (isLoading || upData.isLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

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
        {data?.trackOptions?.trackDisk &&
        data?.diskUsed > -1 &&
        data?.diskSize > -1 ? (
          <DiskStatus data={data} />
        ) : null}
        {data?.trackOptions?.trackResources ? (
          <ResourceUsage
            paramStr={paramStr}
            inc={inc}
            setInc = {setInc}
            incCount={incCount}
            setIncCount={setIncCount}
          />
        ) : null}
        {data?.trackOptions?.trackUpgrades &&
        data?.upgrades &&
        data?.upgrades !== "empty" ? (
          <Upgrades upgrades={data.upgrades} />
        ) : null}

        {data?.trackOptions?.trackSmart && data?.smart && data?.smart.length ? (
          <SmartDisplay serverData={data} />
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
