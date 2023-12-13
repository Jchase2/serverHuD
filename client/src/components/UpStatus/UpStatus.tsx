import { HStack, Icon, Stack, Text } from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { CiServer } from "react-icons/ci";
import { IData } from "../../types";

interface IUpStatusProps {
  serverData: IData;
  upData?: IData;
}

export const UpStatus = (props: IUpStatusProps) => {
  const { serverData, upData } = props;

  return (
    <Stack align={"center"}>
      <HStack>
        <Icon as={CiServer} mt={0.5} />
        <Text fontSize={"sm"} m={0}>Host: {serverData?.url}</Text>
      </HStack>
      {serverData?.status === "up" ? (
        <Text fontSize={"sm"}>
          <TriangleUpIcon color="green.500" /> Server Status: Up
        </Text>
      ) : (
        <Text fontSize={"sm"}>
          <TriangleDownIcon color="red.500" /> Server Status: Down!
        </Text>
      )}
      {serverData?.sslStatus === "true" ? (
        <Text fontSize={"sm"}>
          <TriangleUpIcon color="green.500" /> SSL Status: Active
        </Text>
      ) : (
        <Text fontSize={"sm"}>
          <TriangleDownIcon color="red.500" /> SSL Status: Down!
        </Text>
      )}
      {serverData?.sslStatus === "true" ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> SSL Expires: {serverData?.sslExpiry} Days
        </Text>
      ) : null}
      {serverData?.uptime ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> Server Uptime: {serverData?.uptime} Days
        </Text>
      ) : null}
      {upData?.uptime ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> Recorded Uptime: {upData?.uptime}
        </Text>
      ) : null}
            {upData?.downtime ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> Recorded Downtime: {upData?.downtime}
        </Text>
      ) : null}
    </Stack>
  );
};
