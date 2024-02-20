import { TriangleDownIcon } from "@chakra-ui/icons";
import { Card, CardBody, CardHeader, Stack, Text } from "@chakra-ui/react";

interface IExtensionServerDownProps {}

const ExtensionServerDown = (props: IExtensionServerDownProps) => {
  return (
    <Card
      direction={{ base: "column", sm: "row" }}
      overflow="hidden"
      variant="outline"
      m={4}
      maxW={["100vw", "75vw", "65vw", "60vw", "53vw"]}
      textAlign={"center"}
    >
      <Stack>
        <CardHeader>
          <TriangleDownIcon color="red.500" /> Extension Server Down!
        </CardHeader>
        <CardBody>
          <Text>There appears to be an issue with the extension server.</Text>
          <Text>Check to make sure it's up or contact your administrator.</Text>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default ExtensionServerDown;
