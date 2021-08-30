import { TextInput } from "grommet";
import { Hide, View } from "grommet-icons";
import { useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  Heading,
  Input,
  Button,
  IconButton,
  Image,
  useColorMode,
  useColorModeValue,
  Select,
  useMediaQuery,
} from "@chakra-ui/react";
import { GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";
import { loginFunc } from "../../services/api";
import { useHistory } from "react-router-dom";

const Login = (props: any) => {
  const { toggleColorMode } = useColorMode();
  let SwitchIcon: any;
  const history = useHistory();

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });
  const [reveal, setReveal] = useState(false);
  if (reveal) {
    SwitchIcon = BiHide;
  } else SwitchIcon = GrView;

  const handleChange = (e: any) => {
    setLoginState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let result = await loginFunc({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setLoginState({
      email: "",
      password: "",
    });

    if (result?.status === 200) {
      console.log("Logged in!");
      localStorage.setItem("accessToken", result.data.accessToken);
      // sets authed to true in root component.
      props.setAuth();
      history.push("/dashboard");
    } else {
      console.log("Error");
    }
  };

  return (
    <Flex
      minH="80vh"
      align="center"
      justifyContent="center"
      flexDirection="column"
    >
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" minW="35vw">
        <Heading textAlign="center" mb={6}>Login</Heading>
        <form onSubmit={handleSubmit}>
          <FormControl></FormControl>
          <TextInput
            name="email"
            type="email"
            placeholder="email"
            value={loginState.email}
            onChange={handleChange}
          />
          <Flex>
            <TextInput
              name="password"
              type={reveal ? "text" : "password"}
              placeholder="password"
              value={loginState.password}
              onChange={handleChange}
            />
            <IconButton
              aria-label="reveal"
              icon={<SwitchIcon />}
              onClick={() => {
                if (reveal) setReveal(false);
                else setReveal(true);
              }}
              plain={false}
              color="gray"
            />
          </Flex>
          <Button colorScheme="facebook" type="submit" plain={false}>
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
