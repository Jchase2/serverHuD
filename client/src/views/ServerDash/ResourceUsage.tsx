import { Card, CardHeader, Container, Heading, Stack } from "@chakra-ui/react";
import MemUsageGraph from "./MemUsageGraph";
import CpuUsageGraph from "./CpuUsageGraph";
import { ILiveData } from "../../types";
import { Dispatch, SetStateAction } from "react";
import { Radio, RadioGroup } from "@chakra-ui/react";
import { useGetServerUsage } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";

interface IResourceUsageProps {
  paramStr: string;
  upData: ILiveData;
  inc: string;
  setInc: Dispatch<SetStateAction<string>>;
  incCount: number;
  setIncCount: Dispatch<SetStateAction<number>>;
}

const ResourceUsage = (props: IResourceUsageProps) => {
  const { paramStr, inc, incCount, setIncCount, setInc } = props;

  const {
    isLoading: serverUsageLoading,
    error: serverUsageError,
    data: serverUsageData,
  } = useGetServerUsage(paramStr, inc, incCount);
  
  const onChange = (value: string) => {
    setInc(value);
    if (value === "1h") {
      setIncCount(12);
    } else if (value === "1d") {
      setIncCount(24);
    } else if (value === "1w") {
      setIncCount(7);
    } else if (value === "1m") {
      setIncCount(30);
    } else {
      setIncCount(24);
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
      minW={"25vw"}
    >
      <Stack align={"center"}>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Live Resource Usage</Heading>
        </CardHeader>
        {serverUsageData && serverUsageData.memObj ? (
          <MemUsageGraph memUsageData={serverUsageData.memObj} inc={inc} />
        ) : null}
        {serverUsageData && serverUsageData.cpuObj ? (
          <CpuUsageGraph cpuUsageData={serverUsageData.cpuObj} inc={inc} />
        ) : null}
        <RadioGroup onChange={onChange} value={inc}>
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
