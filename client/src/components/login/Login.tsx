import { ErrorShow } from "../Error/ErrorShow";
import { useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  Heading,
  FormLabel,
  Button,
  IconButton,
  Input,
  useColorMode,
} from "@chakra-ui/react";
import { GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";

import { loginFunc } from "../../services/api";
import { useHistory } from "react-router-dom";

const Login = (props: any) => {
  let SwitchIcon: any;
  const history = useHistory();

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const [reveal, setReveal] = useState(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [stateMessage, setStateMessage] = useState<string>("");

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
      setIsError(true);
      setStateMessage("Email or Password is incorrect");
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
      <ErrorShow
        message={stateMessage}
        isClosed={isError}
        setIsError={setIsError}
      />
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" minW="35vw">
        <Heading textAlign="center" mb={6}>
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel> Email </FormLabel>
            <Input
              name="email"
              type="email"
              placeholder="Email"
              value={loginState.email}
              onChange={handleChange}
            />
            <FormLabel isRequired mt={4}>
              {" "}
              Password{" "}
            </FormLabel>
            <Flex>
              <Input
                name="password"
                type={reveal ? "text" : "password"}
                placeholder="Password"
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
          </FormControl>
          <Button mt={4} colorScheme="facebook" type="submit" plain={false}>
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
