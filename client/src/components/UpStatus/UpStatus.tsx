import { HStack, Icon, Stack, Text } from "@chakra-ui/react";
import {
  InfoOutlineIcon,
  TriangleDownIcon,
  TriangleUpIcon,
} from "@chakra-ui/icons";
import { CiServer } from "react-icons/ci";
import { IData } from "../../types";

interface IUpStatusProps {
  serverData: IData | undefined;
  upData?: IData | undefined;
}

export const UpStatus = (props: IUpStatusProps) => {
  const { serverData, upData } = props;

  return (
    <Stack align={"center"}>
      <HStack>
        <Icon as={CiServer} mt={0.5} />
        <Text fontSize={"sm"} m={0}>
          Host: {serverData?.url}
        </Text>
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
      {serverData?.serverOptions?.checkHttp ? (
        serverData?.httpCode === -1 ? (
          <Text fontSize={"sm"}>
            <TriangleDownIcon color="red.500" /> Http Code: Not Available
          </Text>
        ) : serverData?.httpCode && serverData?.httpCode < 400 ? (
          <Text fontSize={"sm"}>
            <TriangleUpIcon color="green.500" /> HTTP Code:{" "}
            {serverData?.httpCode}
          </Text>
        ) : (
          <Text fontSize={"sm"}>
            <TriangleDownIcon color="red.500" /> Http Code:{" "}
            {serverData?.httpCode}
          </Text>
        )
      ) : null}
      {serverData?.sslStatus === "true" ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> SSL Expires: {serverData?.sslExpiry} Days
        </Text>
      ) : null}
      {serverData?.extServerUptime &&
      Object.keys(serverData?.extServerUptime).length > 0 &&
      serverData?.extensionServerStatus === "up" ? (
        <Text fontSize={"sm"}>
          <InfoOutlineIcon /> OS Uptime: {serverData?.extServerUptime?.Days}{" "}
          Days, {serverData?.extServerUptime?.Hours} Hours
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
