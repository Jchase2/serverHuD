import { useHistory } from "react-router-dom";
import {
  Main,
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "grommet";
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";

const Server = (props: any) => {

  const [currServerState, setCurrServerState] = useState(props.serverData);

  useEffect(() => {

    const socket = io("localhost:3001", {
      auth: {
        token: localStorage.getItem("accessToken")
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("Connected to " + socket.id, " sending url: ", props.serverData.url);
      socket.emit('registerUpdates', props.serverData.url)
    });

    socket.on('status-update', (statusUpdate) => {
      let internalServer = cloneDeep(currServerState);
      internalServer.status = statusUpdate;
      setCurrServerState(internalServer);
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = useHistory();

  return (
    <Main pad="medium">
      <Card background="light-1">
        {currServerState.status === "down" ? (
          <CardHeader background="status-error" pad="small">
            {currServerState.name}
          </CardHeader>
        ) : currServerState.status === "up" &&
          currServerState.sslStatus === "false" ? (
          <CardHeader background="status-warning" pad="small">
            {currServerState.name}
          </CardHeader>
        ) : (
          <CardHeader background="dark-1" pad="small">
            {currServerState.name}
          </CardHeader>
        )}
        <CardBody pad="small">
          <Box>Server URL: {currServerState.url}</Box>
          <Box>
            Server Status: {currServerState.status === "up" ? "Up" : "Down!"}
          </Box>
          <Box>
            SSL: {currServerState.sslStatus === "true" ? "Active" : "Down!"}
          </Box>
        </CardBody>
        <CardFooter
          pad="small"
          background="light-2"
          align="center"
          justify="center"
        >
          <Button
            plain={false}
            onClick={() => history.push("/server/" + currServerState.id)}
          >
            More Info
          </Button>
        </CardFooter>
      </Card>
    </Main>
  );
};

export default Server;
