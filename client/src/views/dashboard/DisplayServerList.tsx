import { Text, HStack } from "@chakra-ui/react";
import VerticalServers from "./VerticalServers";
import WrapServers from "./WrapServers";

const DisplayServerList = (props: any) => {
  const { isListView, data } = props;

  return (
    <>
      {isListView === "true" ? (
        <HStack
          justify={"center"}
          minW={"80vw"}
          display={"flex"}
          spacing={["40vw", "35vw", "35vw", "60vw", "27vw", "28vw"]}
        >
          <Text>Host / Status</Text>
          <Text>SSL Status</Text>
        </HStack>
      ) : null}
      {isListView === "true" ? (
        <VerticalServers data={data} isListView={isListView} />
      ) : (
        <WrapServers data={data} isListView={isListView} />
      )}
    </>
  );
};

export default DisplayServerList;
