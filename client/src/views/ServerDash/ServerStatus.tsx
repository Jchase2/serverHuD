import { Card, CardBody, Heading, Stack } from "@chakra-ui/react";
import UpGraph from "./UpGraph";
import { UpStatus } from "../../components/UpStatus/UpStatus";

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
          <UpStatus serverData={serverData} />
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
