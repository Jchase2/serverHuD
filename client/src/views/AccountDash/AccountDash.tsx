import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Center,
  Flex,
  Heading,
  Stack,
  StackDivider,
  Text,
} from "@chakra-ui/react";
import { useGetUserInfo } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";

const AccountDash = () => {
  const { data, isPending } = useGetUserInfo();

  if (isPending) {
    return (
      <Flex align="center" justify="center" mt={'20vh'}>
        <Loading />
      </Flex>
    );
  }

  return (
    <Center>
      <Card minWidth={"25vw"} mt={"20vh"}>
        <CardHeader>
          <Heading size="md">User Info</Heading>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Email
              </Heading>
              <Text pt="2" fontSize="sm">
                {data?.userEmail}
              </Text>
            </Box>
            <Box>
              <Heading size="xs" textTransform="uppercase">
                Role
              </Heading>
              <Text pt="2" fontSize="sm">
                {data?.role}
              </Text>
            </Box>
          </Stack>
        </CardBody>
      </Card>
    </Center>
  );
};

export default AccountDash;
