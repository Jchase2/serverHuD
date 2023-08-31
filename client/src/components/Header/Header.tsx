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
import { useNavigate } from "react-router-dom";

interface IClientHeaderProps {
  globalLogOut: () => void;
  isAuthed: string;
}

const ClientHeader = (props: IClientHeaderProps) => {
  const { colorMode, toggleColorMode } = useColorMode();

  const { globalLogOut, isAuthed } = props;

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
          onClick={() => navigate("/register")}
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
          onClick={() => navigate("/login")}
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
          globalLogOut();
          navigate("/");
        }}
      >
        Logout
      </Link>
    );
  };

  const navigate = useNavigate();

  return (
    <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
      <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
        {<Button mr={2} onClick={() => navigate("/")}>ServerHuD</Button>}
        <Flex alignItems={"center"}>
          <Stack direction={"row"} spacing={5}>
            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
            <Menu>
              {isAuthed === "false" ? <LoginAndRegister /> : <Logout />}
            </Menu>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default ClientHeader;
