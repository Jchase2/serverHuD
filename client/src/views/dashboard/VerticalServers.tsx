import { VStack, Text } from "@chakra-ui/react";
import ListServer from "./ListServer";
import { IData } from "../../types";

interface VerticalServersProps {
  data: IData[]
}

const VerticalServers = (props: VerticalServersProps) => {
  const { data } = props;
  return (
    <VStack justify={"center"}>
      {data?.length ? (
        data.map((e: IData) => (
          <div key={e.url}>
            <ListServer serverData={e} />
          </div>
        ))
      ) : (
        <Text align="center">
          You are not monitoring any servers, add one to get started!
        </Text>
      )}
    </VStack>
  );
};

export default VerticalServers;
