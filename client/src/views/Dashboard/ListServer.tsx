import {
  Card,
  CardBody,
  Text,
  Container,
  LinkBox,
  LinkOverlay,
  Flex,
  Spacer,
} from "@chakra-ui/react";
import { TriangleDownIcon, TriangleUpIcon } from "@chakra-ui/icons";
import { useEffect } from "react";
import { useGetIndServer } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { socket } from "../../App";
import { useNavigate } from "react-router-dom";
import { IData } from "../../types";


interface ListServerProps {
  serverData: IData
}

const ListServer = (props: ListServerProps) => {

  const {
    isLoading: indServerLoading,
    error: indServerError,
    data: indServerData,
  } = useGetIndServer(props.serverData.id);

  let navigate = useNavigate();

  useEffect(() => {
    if (indServerData) {
      socket.emit("upCheck", {
        id: indServerData.id,
        url: indServerData.url,
        optionalUrl: indServerData.optionalUrl,
        httpCode: indServerData.httpCode,
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
    <LinkBox>
      <LinkOverlay
        cursor={"pointer"}
        onClick={() => navigate("/server/" + indServerData.id)}
      >
        <Card
          m={2}
          display={"flex"}
          minW={["100vw", "100vw", "80vw", "80vw", "40vw"]}
        >
          <CardBody>
            <Flex direction={"row"} justify={"center"}>
              {indServerData.status === "up" ? (
                <Text p={0} m={0} wordBreak={"break-all"}>
                  <TriangleUpIcon color="green.500" /> {indServerData.url}
                </Text>
              ) : (
                <Text p={0} m={0}>
                  <TriangleDownIcon color="red.500" /> {indServerData.url}
                </Text>
              )}
              <Spacer />
              {indServerData?.sslStatus === "true" ? (
                <Text>
                  <TriangleUpIcon color="green.500" /> Expires in{" "}
                  {indServerData?.sslExpiry} Days
                </Text>
              ) : (
                <Text>
                  <TriangleDownIcon color="red.500" /> Down!
                </Text>
              )}
            </Flex>
          </CardBody>
        </Card>
      </LinkOverlay>
    </LinkBox>
  );
};

export default ListServer;
