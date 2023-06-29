import {
  Card,
  CardBody,
  CardHeader,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

const Upgrades = (props: any) => {
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
        <CardHeader>Sever Upgrades</CardHeader>
        <CardBody>
          <Text>{upgradeString}</Text>
        </CardBody>
      </Stack>
    </Card>
  );
};

export default Upgrades;
