import { Wrap, WrapItem, Text } from "@chakra-ui/react";
import Server from "./Server";

const WrapServers = (props: any) => {
  const { data } = props;
  return (
    <Wrap justify={"center"}>
      {data?.length ? (
        data.map((e: any) => (
          <div key={e.url}>
            <WrapItem>
                <Server serverData={e} />
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
