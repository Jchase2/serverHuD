import { useHistory } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Text,
  Box,
  Container,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { UpStatus } from "../../components/UpStatus/UpStatus";
import { useGetIndServer } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";

const Server = (props: any) => {
  const {
    isLoading: indServerLoading,
    error: indServerError,
    data: indServerData,
  } = useGetIndServer(props.serverData.id);

  console.log("DATA FROM SERVER REACT COMP: ", indServerData);

  useReactQuerySubscription();

  const history = useHistory();

  useEffect(() => {
    if (indServerData) {
      socket.emit("upCheck", {
        id: indServerData.id,
        url: indServerData.url,
        optionalUrl: indServerData.optionalUrl,
        status: indServerData.status,
        sslStatus: indServerData.sslStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [indServerData]);

  if (indServerLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  // TODO: Replace with error component.
  if (indServerError) return <p>Error.</p>;

  return (
    <Card align="center" m={2} minW="20vw" display={"flex"}>
      {indServerData.status === "down" ? (
        <CardHeader
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#e40000"
        >
          <Box>
            <Text display={"flex"}>{indServerData.name}</Text>
          </Box>
        </CardHeader>
      ) : indServerData.status === "up" &&
        indServerData.sslStatus === "false" ? (
        <CardHeader
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#FF8800"
        >
          {indServerData.name}
        </CardHeader>
      ) : (
        <CardHeader
          textColor={"#fff"}
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#2f4858"
        >
          {indServerData.name}
        </CardHeader>
      )}
      <CardBody m={2}>
        <UpStatus serverData={indServerData} />
      </CardBody>
      <CardFooter>
        <Button onClick={() => history.push("/server/" + indServerData.id)}>
          More Info
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Server;
