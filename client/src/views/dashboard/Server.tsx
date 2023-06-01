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
import { useGetIndServer } from "../../services/api/servers";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";

const Server = (props: any) => {

  const { data, isLoading, isError } = useGetIndServer(props.serverData.id);

  useReactQuerySubscription();

  const history = useHistory();
  useEffect(() => {

    console.log("INSIDE USE EFFECT BUT NO DATA.")

    if (data) {
      console.log("EMITTING UPCHECK AND LIVE CHECK FROM FRONT END OBVIOUSLY.")
      socket.emit("upCheck", {
        id: data.id,
        url: data.url,
        status: data.status,
        sslStatus: data.sslStatus,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  if (isLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  // TODO: Replace with error component.
  if (isError) return <p>Error.</p>;

  return (
    <Card align="center" m={2} minW="20vw" display={"flex"}>
      {data.status === "down" ? (
        <CardHeader
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#e40000"
        >
          <Box>
            <Text display={"flex"}>{data.name}</Text>
          </Box>
        </CardHeader>
      ) : data.status === "up" &&
        data.sslStatus === "false" ? (
        <CardHeader
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#FF8800"
        >
          {data.name}
        </CardHeader>
      ) : (
        <CardHeader
          textColor={"#fff"}
          borderRadius="md"
          w={"100%"}
          textAlign={"center"}
          backgroundColor="#2f4858"
        >
          {data.name}
        </CardHeader>
      )}
      <CardBody m={2}>
        <UpStatus serverData={data} />
      </CardBody>
      <CardFooter>
        <Button onClick={() => history.push("/server/" + data.id)}>
          More Info
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Server;
