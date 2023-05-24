import { Card, CardBody, Heading, Stack, Text } from "@chakra-ui/react";
import UpGraph from "./UpGraph";
import {
  TriangleDownIcon,
  TriangleUpIcon,
  InfoOutlineIcon,
} from "@chakra-ui/icons";

const ServerStatus = (props: any) => {
  let { serverData, upData } = props;

  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      m={4}
    >
      <Stack>
        <CardBody>
          {serverData?.status === "up" ? (
            <Text>
              <TriangleUpIcon color="green.500" /> Server Status: Up
            </Text>
          ) : (
            <Text>
              <TriangleDownIcon color="red.500" /> Server Status: Down!
            </Text>
          )}
          {serverData?.sslStatus === "true" ? (
            <Text>
              <TriangleUpIcon color="green.500" /> SSL Status: Active
            </Text>
          ) : (
            <Text>
              <TriangleDownIcon color="red.500" /> SSL Status: Down!
            </Text>
          )}
          {serverData?.sslStatus === "true" ? (
            <Text>
              <InfoOutlineIcon /> SSL Expires: {serverData?.sslExpiry} Days
            </Text>
          ) : null}
          {serverData?.uptime?.Hours > 0 || serverData?.uptime?.Days > 0 ? (
            <>
              Uptime:{" "}
              {serverData?.uptime.Days +
                " Days " +
                serverData.uptime.Hours +
                " Hours "}
            </>
          ) : null}
        </CardBody>
      </Stack>
      <CardBody textAlign={"center"} w={"50%"}>
        <Heading size="md">Tracked Uptime</Heading>
        <UpGraph data={upData} />
      </CardBody>
    </Card>
  );
};

export default ServerStatus;
