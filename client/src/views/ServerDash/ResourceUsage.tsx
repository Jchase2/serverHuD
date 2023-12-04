import { Card, CardHeader, Heading, Stack, Text } from "@chakra-ui/react";
import MemUsageGraph from "./MemUsageGraph";
import CpuUsageGraph from "./CpuUsageGraph";
import { ILiveData, IResourceData } from "../../types";

interface IResourceUsageProps {
  serverUsageData: IResourceData,
  upData: ILiveData,
}

const ResourceUsage = (props: IResourceUsageProps) => {

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
          <Heading size="md">Live Resource Usage</Heading>
        </CardHeader>
        <MemUsageGraph memUsageData={props.serverUsageData.memObj} />
        <CpuUsageGraph cpuUsageData={props.serverUsageData.cpuObj} />
      </Stack>
    </Card>
  );
};

export default ResourceUsage;
