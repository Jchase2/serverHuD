import {
  Card,
  CardBody,
  CardHeader,
  Center,
  Heading,
  Stack,
  VStack,
  Text,
} from "@chakra-ui/react";
import { IData } from "../../types";

interface ISmartDisplayProps {
  serverData: IData;
}

const SmartDisplay = (props: ISmartDisplayProps) => {
  let { serverData } = props;

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
          <Heading size="md">S.M.A.R.T Disk Status</Heading>
        </CardHeader>
        <CardBody p={0}>
          <Center>
            <VStack>
              {serverData.smart.map((elem: string, index) => (
                <div key={index}>
                  <Text>{elem}</Text>
                </div>
              ))}
            </VStack>
          </Center>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default SmartDisplay;
