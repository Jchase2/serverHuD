import { useNavigate } from "react-router-dom";
import {
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Button,
  Container,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { UpStatus } from "../../components/UpStatus/UpStatus";
import { useGetIndServer } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { socket } from "../../App";
import { UpdateServer } from "../../components/UpdateServer/UpdateServer";
import { IData } from "../../types";

interface ServerListProps {
  serverData: IData
}

const Server = (props: ServerListProps) => {
  const { serverData } = props;
  const {
    isLoading: indServerLoading,
    error: indServerError,
    data: indServerData,
  } = useGetIndServer(serverData.id);

  const navigate = useNavigate();

  useEffect(() => {
    if (indServerData) {
      socket.emit("upCheck", {
        id: indServerData.id,
        url: indServerData.url,
        httpCode: indServerData.httpCode,
        optionalUrl: indServerData.optionalUrl,
        status: indServerData.status,
        sslStatus: indServerData.sslStatus,
        incCount: 12,
        inc: '1h',
        upInc: '1h',
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
          {indServerData.name}
          <UpdateServer data={indServerData} />
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
          <UpdateServer data={indServerData} />
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
          <UpdateServer data={indServerData} />
        </CardHeader>
      )}
      <CardBody m={2}>
        <UpStatus serverData={indServerData} />
      </CardBody>
      <CardFooter>
        <Button onClick={() => navigate("/server/" + indServerData.id)}>
          More Info
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Server;
