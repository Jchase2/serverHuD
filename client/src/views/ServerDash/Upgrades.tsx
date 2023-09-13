import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

interface IUpgradesProps {
  upgrades: string;
}

const Upgrades = (props: IUpgradesProps) => {
  const { upgrades } = props;

  const [upgradeString, setUpgradeString] = useState(upgrades);
  useEffect(() => {
    if (upgrades.includes("Listing...")) {
      const result = upgrades.replace(/.*?Listing\.\.\./s, "");
      setUpgradeString(result);
    }
  }, [upgrades]);

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
        <CardHeader textAlign={"center"}>
          <Heading size="md">Server Upgrades</Heading>
        </CardHeader>
        <CardBody>
          <Text>{upgradeString}</Text>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default Upgrades;
