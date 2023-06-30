import { Card, CardHeader, Heading, Stack, Text } from "@chakra-ui/react";
import MemUsageGraph from "./MemUsageGraph";
import CpuUsageGraph from "./CpuUsageGraph";

const ResourceUsage = (props: any) => {
  return (
    <Card
      overflow="hidden"
      variant="outline"
      m={4}
      textAlign={"center"}
      align={"center"}
      minW={"25vw"}
    >
      <Stack>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Resource Usage</Heading>
        </CardHeader>
        <MemUsageGraph serverUsageData={props.serverUsageData.memObj} />
        <CpuUsageGraph serverUsageData={props.serverUsageData.cpuObj} />
        <Text as="cite" fontSize="xs">
          * Data begins from latest recorded entry.
        </Text>
      </Stack>
    </Card>
  );
};

export default ResourceUsage;
