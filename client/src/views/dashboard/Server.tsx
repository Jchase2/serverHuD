import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import { Card, CardBody, CardHeader, CardFooter, Box, Button } from '@chakra-ui/react';
import { useEffect, useState } from "react";
import { cloneDeep } from "lodash";
import { UpStatus } from "../../components/UpStatus/UpStatus";


const Server = (props: any) => {
  const [currServerState, setCurrServerState] = useState(props.serverData);

  useEffect(() => {
    const socket = io("localhost:3001", {
      auth: {
        token: localStorage.getItem("accessToken"),
      },
      transports: ["websocket"],
    });

    function connectEvent() {
      console.log(
        "Connected to " + socket.id,
        " sending url: ",
        props.serverData.url,
        " sending ssl status: ", props.serverData.sslStatus
      );
      socket.emit("upCheck", {
        id: props.serverData.id,
        url: props.serverData.url,
        status: props.serverData.status,
        sslStatus: props.serverData.sslStatus,
      });
    }

    function statUpdate(statusUpdate: any, callback: any) {
      console.log("Status Update: ", statusUpdate);
      let internalServer = cloneDeep(currServerState);
      for (const [key, value] of Object.entries(statusUpdate)) {
        if (internalServer[key] !== value) {
          internalServer[key] = value;
        }
      }
      setCurrServerState(internalServer);
      callback({
        status: internalServer.status,
        sslStatus: internalServer.sslStatus,
      });
    }

    socket.on("connect", connectEvent);
    socket.on("serverUpdate", statUpdate);

    return () => {
      socket.disconnect();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = useHistory();

  return (
      <Card align="center" m={2} w="20vw">
        {currServerState.status === "down" ? (
          <CardHeader borderRadius='md' w={'100%'} textAlign={'center'} backgroundColor="#e40000">
            {currServerState.name}
          </CardHeader>
        ) : currServerState.status === "up" &&
          currServerState.sslStatus === "false" ? (
          <CardHeader borderRadius='md' w={'100%'} textAlign={'center'} backgroundColor="#FF8800">
            {currServerState.name}
          </CardHeader>
        ) : (
          <CardHeader textColor={'#fff'} borderRadius='md' w={'100%'} textAlign={'center'} backgroundColor="#2f4858">
            {currServerState.name}
          </CardHeader>
        )}
        <CardBody m={2}>
          <UpStatus serverData={currServerState}/>
        </CardBody>
        <CardFooter>
          <Button
            onClick={() => history.push("/server/" + currServerState.id)}
          >
            More Info
          </Button>
        </CardFooter>
      </Card>
  );
};

export default Server;
