import { Text, HStack } from "@chakra-ui/react";
import VerticalServers from "./VerticalServers";
import WrapServers from "./WrapServers";
import { IData } from "../../types";

interface DisplayServerListProps {
  isListView: string | null,
  data: IData[]
}

const DisplayServerList = (props: DisplayServerListProps) => {
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
        <VerticalServers data={data} />
      ) : (
        <WrapServers data={data} />
      )}
    </>
  );
};

export default DisplayServerList;
