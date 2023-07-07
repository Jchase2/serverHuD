import { VStack, Text } from "@chakra-ui/react";
import ListServer from "./ListServer";

const VerticalServers = (props: any) => {
  const { data } = props;
  return (
    <VStack justify={"center"}>
      {data?.length ? (
        data.map((e: any) => (
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
