import {
    Card,
    CardHeader,
    Heading,
    Stack,
    Text
  } from "@chakra-ui/react";
import DiskGraph from "./DiskGraph";

  const ResourceUsage = (props: any) => {
    return (
      <Card
        overflow="hidden"
        variant="outline"
        m={4}
        textAlign={'center'}
        align={'center'}
        minW={['100vw', '50vw', '35vw', '25vw']}
      >
        <Stack>
          <CardHeader textAlign={'center'}>
            <Heading size="md">Disk Usage</Heading>
          </CardHeader>
            <DiskGraph data={props.data}/>
            <Text as='cite' fontSize='xs'>
                * Data begins from latest recorded entry.
            </Text>
        </Stack>
      </Card>
    );
  };

  export default ResourceUsage;
