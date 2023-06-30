import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  Stack,
} from "@chakra-ui/react";
import UpGraph from "./UpGraph";
import { UpStatus } from "../../components/UpStatus/UpStatus";

const ServerStatus = (props: any) => {
  let { serverData, upData } = props;

  return (
    <Card
      overflow="hidden"
      variant="outline"
      m={4}
      textAlign={"center"}
      align={"center"}
      minW={["100vw", "50vw", "35vw", "25vw"]}
    >
      <Stack>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Up Status</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Center>
            <UpStatus serverData={serverData} />
          </Center>
          <UpGraph data={upData} />
        </CardBody>
      </Stack>
    </Card>
  );
};

export default ServerStatus;
