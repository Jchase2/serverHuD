import { VStack, Text } from "@chakra-ui/react";
import ListServer from "./ListServer";
import Server from "./Server";

const VerticalServers = (props: any) => {
  const { data, isListView } = props;

  return (
    <VStack justify={"center"}>
      {data?.length ? (
        data.map((e: any) => (
          <div key={e.url}>
            {isListView === "true" ? (
              <ListServer serverData={e} />
            ) : (
              <Server serverData={e} />
            )}
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
