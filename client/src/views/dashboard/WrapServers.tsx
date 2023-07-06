import { Wrap, WrapItem, Text } from "@chakra-ui/react";
import ListServer from "./ListServer";
import Server from "./Server";

const WrapServers = (props: any) => {
  const { data, isListView } = props;

  return (
    <Wrap justify={"center"}>
      {data?.length ? (
        data.map((e: any) => (
          <div key={e.url}>
            <WrapItem>
              {isListView === "true" ? (
                <ListServer serverData={e} />
              ) : (
                <Server serverData={e} />
              )}
            </WrapItem>
          </div>
        ))
      ) : (
        <Text align="center">
          You are not monitoring any servers, add one to get started!
        </Text>
      )}
    </Wrap>
  );
};

export default WrapServers;
