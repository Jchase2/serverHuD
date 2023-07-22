import { HStack, Icon, Stack, Text } from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { CiServer } from "react-icons/ci";
import { IData } from "../../types";

interface IUpStatusProps {
  serverData: IData
}

export const UpStatus = (props: IUpStatusProps) => {
  const { serverData } = props;
  return (
    <Stack>
      <HStack>
        <Icon as={CiServer} mt={.5} />
        <Text m={0}>Host: {serverData?.url}</Text>
      </HStack>
      {serverData?.status === "up" ? (
        <Text>
          <TriangleUpIcon color="green.500" /> Server Status: Up
        </Text>
      ) : (
        <Text>
          <TriangleDownIcon color="red.500" /> Server Status: Down!
        </Text>
      )}
      {serverData?.sslStatus === "true" ? (
        <Text>
          <TriangleUpIcon color="green.500" /> SSL Status: Active
        </Text>
      ) : (
        <Text>
          <TriangleDownIcon color="red.500" /> SSL Status: Down!
        </Text>
      )}
      {serverData?.sslStatus === "true" ? (
        <Text>
          <InfoOutlineIcon /> SSL Expires: {serverData?.sslExpiry} Days
        </Text>
      ) : null}
    </Stack>
  );
};
