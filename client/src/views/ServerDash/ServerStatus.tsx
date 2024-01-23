import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Heading,
  Stack,
  Tab,
  TabList,
  Tabs,
  Wrap,
} from "@chakra-ui/react";
import UpGraph from "./UpGraph";
import { UpStatus } from "../../components/UpStatus/UpStatus";
import { IData } from "../../types";
import { Dispatch, SetStateAction, useState } from "react";
import { useGetUpData } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { ErrorComp } from "../../components/Error/ErrorComp";

interface IServerStatusProps {
  serverData: IData;
  setUpInc: Dispatch<SetStateAction<string>>;
  upInc: string;
  paramStr: string;
}

const ServerStatus = (props: IServerStatusProps) => {
  let { serverData, setUpInc, paramStr, upInc } = props;

  const [tabIndex, setTabIndex] = useState(0);
  const { data: upData, isLoading: upDataIsLoading, isError, error } = useGetUpData(paramStr, upInc);

  const handleTabsChange = (index: number) => {
    setTabIndex(index);
    if (index === 0) {
      setUpInc("1h");
    } else if (index === 1) {
      setUpInc("1d");
    } else if (index === 2) {
      setUpInc("1w");
    } else if (index === 3) {
      setUpInc("1m");
    } else {
      setUpInc("all");
    }
  };

  if (upDataIsLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

    if(isError) {
      return <ErrorComp message={error?.message}/>
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
      <Stack align={"center"}>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Live Up Status</Heading>
        </CardHeader>
        <CardBody p={0}>
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
              <Tab>all</Tab>
            </TabList>
            <Wrap justify={"center"} mt={2}>
              <Center>
                <UpStatus serverData={serverData} upData={upData} />
              </Center>
              <Container
                maxW={["80vw", "55vw", "40vw", "25vw", "20vw", "20vw"]}
              >
                <UpGraph data={upData} />
              </Container>
            </Wrap>
          </Tabs>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default ServerStatus;
