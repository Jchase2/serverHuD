import {
  Card,
  CardHeader,
  Container,
  Heading,
  Stack,
  Tab,
  TabList,
  Tabs,
} from "@chakra-ui/react";
import MemUsageGraph from "./MemUsageGraph";
import CpuUsageGraph from "./CpuUsageGraph";
import { Dispatch, SetStateAction, useState } from "react";
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
  const {
    paramStr,
    resourceInc,
    resourceIncCount,
    setResourceIncCount,
    setResourceInc,
  } = props;
  const [tabIndex, setTabIndex] = useState(0);

  const {
    isLoading: serverUsageLoading,
    error: serverUsageError,
    data: serverUsageData,
  } = useGetServerUsage(paramStr, resourceInc, resourceIncCount);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
    if (index === 0) {
      setResourceInc("1h");
      setResourceIncCount(12);
    } else if (index === 1) {
      setResourceInc("1d");
      setResourceIncCount(24);
    } else if (index === 2) {
      setResourceInc("1w");
      setResourceIncCount(7);
    } else if (index === 3) {
      setResourceInc("1m");
      setResourceIncCount(30);
    } else {
      setResourceInc("all");
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
      p={2}
      textAlign={"center"}
      align={"center"}
      minW={["100vw", "50vw", "35vw", "25vw"]}
    >
      <Stack>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Live Resource Usage</Heading>
        </CardHeader>
        <Tabs
          size="md"
          variant="enclosed"
          index={tabIndex}
          onChange={handleTabsChange}
        >
          <TabList>
            <Tab>1h</Tab>
            <Tab>1d</Tab>
            <Tab>1w</Tab>
            <Tab>1m</Tab>
          </TabList>
        </Tabs>
        {serverUsageData && serverUsageData.memObj ? (
          <MemUsageGraph
            memUsageData={serverUsageData.memObj}
            inc={resourceInc}
          />
        ) : null}
        {serverUsageData && serverUsageData.cpuObj ? (
          <CpuUsageGraph
            cpuUsageData={serverUsageData.cpuObj}
            inc={resourceInc}
          />
        ) : null}
      </Stack>
    </Card>
  );
};

export default ResourceUsage;
