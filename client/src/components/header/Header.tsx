import {
  Box,
  Flex,
  Button,
  Menu,
  useColorModeValue,
  Stack,
  useColorMode,
  HStack,
  Link,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { useHistory } from "react-router-dom";

const ClientHeader = (props: any) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const LoginAndRegister = () => {
    return (
      <HStack>
        <Link
          px={2}
          py={1}
          rounded={"md"}
          _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
          }}
          onClick={() => history.push("/register")}
        >
          Register
        </Link>
        <Link
          px={2}
          py={1}
          rounded={"md"}
          _hover={{
            textDecoration: "none",
            bg: useColorModeValue("gray.200", "gray.700"),
          }}
          onClick={() => history.push("/login")}
        >
          Login
        </Link>
      </HStack>
    );
  };

  const Logout = () => {
    return (
      <Link
        px={2}
        py={1}
        rounded={"md"}
        _hover={{
          textDecoration: "none",
          bg: useColorModeValue("gray.200", "gray.700"),
        }}
        onClick={() => {
          props.globalLogOut();
          history.push("/");
        }}
      >
        Logout
      </Link>
    );
  };

  const history = useHistory();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {<Button mr={2} onClick={() => history.push("/")}>ServerHuD</Button>}
        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={5}>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
            <Menu>
              {props.isAuthed === "false" ? <LoginAndRegister /> : <Logout />}
            </Menu>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ClientHeader;
