import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Container,
  Heading,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import UpGraph from "./UpGraph";
import { UpStatus } from "../../components/UpStatus/UpStatus";
import { IData } from "../../types";
import { Dispatch, SetStateAction } from "react";
import { useGetUpData } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";

interface IServerStatusProps {
  serverData: IData;
  upInc: string;
  setUpInc: Dispatch<SetStateAction<string>>;
  upIncCount: number;
  setUpIncCount: Dispatch<SetStateAction<number>>;
  paramStr: string;
}

const ServerStatus = (props: IServerStatusProps) => {
  let { serverData, setUpInc, setUpIncCount, upInc, paramStr } =
    props;

  const { data: upData, isLoading: upDataIsLoading, } = useGetUpData(paramStr);

  const onChange = (value: string) => {
    setUpInc(value);
    if (value === "1h") {
      setUpIncCount(12);
    } else if (value === "1d") {
      setUpIncCount(24);
    } else if (value === "1w") {
      setUpIncCount(7);
    } else if (value === "1m") {
      setUpIncCount(30);
    } else {
      setUpIncCount(24);
    }
  };

  if (upDataIsLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

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
          <Heading size="md">Live Up Status</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Center>
            <UpStatus serverData={serverData} upData={upData}/>
          </Center>
          <UpGraph data={upData} />
        </CardBody>
        <RadioGroup pb={4} onChange={onChange} value={upInc}>
            <Stack spacing={5} direction={"row"}>
              <Radio value="1h">1h</Radio>
              <Radio value="1d">1d</Radio>
              <Radio value="1w">1w</Radio>
              <Radio value="1m">1m</Radio>
              <Radio value="all">all</Radio>
            </Stack>
          </RadioGroup>
      </Stack>
    </Card>
  );
};

export default ServerStatus;
