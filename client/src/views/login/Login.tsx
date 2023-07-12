import { ErrorShow } from "../../components/Error/ErrorShow";
import { useEffect, useState } from "react";
import {
  Flex,
  Box,
  FormControl,
  Heading,
  Button,
  IconButton,
  Input,
  Stack,
} from "@chakra-ui/react";
import { GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";
import { useNavigate } from "react-router-dom";
import { useLogin } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";

const Login = (props: any) => {

  let SwitchIcon: any;
  let navigate = useNavigate();

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
  });

  const [reveal, setReveal] = useState(false);
  const [closed, setClosed] = useState<boolean>(true);
  const [stateMessage, setStateMessage] = useState<string>("");
  const login = useLogin();

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

    await login.mutate({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setLoginState({
      email: "",
      password: "",
    });
  };

  if (login.isSuccess) {
    console.log("Logged in!");
    localStorage.setItem("userId", login.data.userId);
    // sets authed to true in root component.
    props.setIsAuthed("true");
    navigate("/dashboard");
  }

  useEffect(() => {
    if (login.isError) {
      setClosed(false);
      setStateMessage("Email or Password is incorrect");
      console.log("Error");
    }
  }, [login]);

  if (login.isLoading) {
    return (
      <Flex align="center" justifyContent="center">
        <Loading />
      </Flex>
    );
  }

  return (
    <Flex
      minH="80vh"
      align="center"
      justifyContent="center"
      flexDirection="column"
    >
      <ErrorShow
        message={stateMessage}
        closed={closed}
        setClosed={setClosed}
        isError={!closed}
      />
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" minW="35vw">
        <Heading textAlign="center" mb={6}>
          Login
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <Stack spacing={3}>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={loginState.email}
                onChange={handleChange}
                isRequired
              />
              <Flex>
                <Input
                  name="password"
                  type={reveal ? "text" : "password"}
                  placeholder="Password"
                  value={loginState.password}
                  onChange={handleChange}
                  isRequired
                />
                <IconButton
                  aria-label="reveal"
                  icon={<SwitchIcon />}
                  onClick={() => {
                    if (reveal) setReveal(false);
                    else setReveal(true);
                  }}
                />
              </Flex>
            </Stack>
          </FormControl>
          <Button mt={4} colorScheme="facebook" type="submit">
            Login
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Login;
