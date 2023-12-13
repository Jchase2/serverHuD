import { Card, CardHeader, Container, Heading, Stack } from "@chakra-ui/react";
import MemUsageGraph from "./MemUsageGraph";
import CpuUsageGraph from "./CpuUsageGraph";
import { Dispatch, SetStateAction } from "react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { useGetServerUsage } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";

interface IResourceUsageProps {
  paramStr: string;
  resourceInc: string;
  setResourceInc: Dispatch<SetStateAction<string>>;
  resourceIncCount: number;
  setResourceIncCount: Dispatch<SetStateAction<number>>;
}

const ResourceUsage = (props: IResourceUsageProps) => {
  const { paramStr, resourceInc, resourceIncCount, setResourceIncCount, setResourceInc } = props;

  const {
    isLoading: serverUsageLoading,
    error: serverUsageError,
    data: serverUsageData,
  } = useGetServerUsage(paramStr, resourceInc, resourceIncCount);

  const onChange = (value: string) => {
    setResourceInc(value);
    if (value === "1h") {
      setResourceIncCount(12);
    } else if (value === "1d") {
      setResourceIncCount(24);
    } else if (value === "1w") {
      setResourceIncCount(7);
    } else if (value === "1m") {
      setResourceIncCount(30);
    } else {
      setResourceIncCount(24);
    }
  };

  if (serverUsageLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  if (serverUsageError) {
    console.log("SERVER USAGE ERROR!");
  }

  return (
    <Card
      overflow="hidden"
      variant="outline"
      m={4}
      textAlign={"center"}
      align={"center"}
      minW={["100vw", "50vw", "35vw", "25vw"]}
    >
      <Stack align={"center"}>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Live Resource Usage</Heading>
        </CardHeader>
        {serverUsageData && serverUsageData.memObj ? (
          <MemUsageGraph memUsageData={serverUsageData.memObj} inc={resourceInc} />
        ) : null}
        {serverUsageData && serverUsageData.cpuObj ? (
          <CpuUsageGraph cpuUsageData={serverUsageData.cpuObj} inc={resourceInc} />
        ) : null}
        <RadioGroup onChange={onChange} value={resourceInc}>
          <Stack spacing={5} direction={"row"}>
            <Radio value="1h">1h</Radio>
            <Radio value="1d">1d</Radio>
            <Radio value="1w">1w</Radio>
            <Radio value="1m">1m</Radio>
          </Stack>
        </RadioGroup>
      </Stack>
    </Card>
  );
};

export default ResourceUsage;
