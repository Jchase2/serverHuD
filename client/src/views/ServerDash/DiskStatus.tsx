import {
  Card,
  CardHeader,
  Heading,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import DiskGraph from "./DiskGraph";
import { IDisk, IDiskElement } from "../../types";
import { useState } from "react";

interface ResourceUsageProps {
  data: IDisk;
}

const ResourceUsage = (props: ResourceUsageProps) => {
  const [selectedDisk, setSelectedDisk] = useState<IDiskElement | undefined>(
    Array.isArray(props.data.diskData) ? props.data.diskData[0] : undefined
  );

  // TODO: Test renaming this to avoid conflict with react key
  // I think it's necessary to fix a victory graph bug like this
  // though.
  const [key, setKey] = useState(0);

  const handleSelectChange = (event: any) => {
    if(Array.isArray(props.data.diskData)){
      const foundDisk = props.data.diskData.find(disk => disk.name === event.target.value)
      setSelectedDisk(foundDisk)
      // This is to force an update each time handleSelect changes
      // due to issues with victory state not changing.
      setKey((prevKey) => prevKey + 1);
    }
  };

  return (
    <Card
      overflow="hidden"
      variant="outline"
      m={4}
      textAlign={"center"}
      align={"center"}
      minW={["100vw", "50vw", "35vw", "25vw"]}
    >
      <Stack>
        <CardHeader textAlign={"center"}>
          <Heading size="md">Live Disk Usage</Heading>
        </CardHeader>
        <Select placeholder="Select Drive" onChange={handleSelectChange} pl={2} pr={2}>
          {typeof props?.data?.diskData === "object" && props?.data?.diskData.length > 0 ? (
            props?.data?.diskData.map((elem) => (
              <option key={elem.name} value={elem.name}>Disk: {elem.name}</option>
            ))
          ) : (
            <option value="none">No Disks Found</option>
          )}
        </Select>
        {selectedDisk ? <DiskGraph data={selectedDisk} key={key} /> : null}
        <Text as="cite" fontSize="xs">
          * Data begins from latest recorded entry.
        </Text>
      </Stack>
    </Card>
  );
};

export default ResourceUsage;
