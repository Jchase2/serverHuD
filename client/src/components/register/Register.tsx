import { ErrorShow } from "../Error/ErrorShow";
import {
  Flex,
  Box,
  FormControl,
  Heading,
  FormLabel,
  Button,
  IconButton,
  useColorMode,
  Input,
} from "@chakra-ui/react";
import { GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";
import { Main, Form } from "grommet";
import { useState } from "react";
import { registerFunc } from "../../services/api";
import { useHistory } from "react-router-dom";

const Register = () => {
  let SwitchIcon: any;
  let SwitchIcon2: any;
  const history = useHistory();

  const [registerState, setRegisterState] = useState({
    email: "",
    password: "",
    confirmPass: "",
    grommet: "",
  });
  const [reveal, setReveal] = useState(false);
  const [secondaryReveal, setSecondaryReveal] = useState(false);
   const [isError, setIsError] = useState<boolean>(false);
   const [stateMessage, setStateMessage] = useState<string>("");

  if (reveal) {
    SwitchIcon = BiHide;
  } else SwitchIcon = GrView;

  if (secondaryReveal) {
    SwitchIcon2 = BiHide;
  } else SwitchIcon2 = GrView;

  const handleChange = (e: any) => {
    setRegisterState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    let res = await registerFunc({
      email: e.target.email.value,
      password: e.target.password.value,
    });

    setRegisterState({
      email: "",
      password: "",
      confirmPass: "",
      grommet: "",
    });

    if (res === 201) {
      history.push("/login");
    } else {
        setIsError(true);
        setStateMessage("Passwaords do not match");
    }
  };

  return (
    <Flex
      minH="70vh"
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
          Register
        </Heading>
        <Form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel> Email </FormLabel>
            <Input
              value={registerState.email}
              placeholder="email"
              name="email"
              onChange={handleChange}
            />
            <FormLabel isRequired mt={4}>
              {" "}
              Password{" "}
            </FormLabel>
            <Flex>
              <Input
                value={registerState.password}
                name="password"
                placeholder="password"
                type={reveal ? "text" : "password"}
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
            <FormLabel isRequired mt={4}>
              {" "}
              Confirm Password{" "}
            </FormLabel>
            <Flex>
              <Input
                value={registerState.confirmPass}
                name="confirmPass"
                placeholder="confirm password"
                type={secondaryReveal ? "text" : "password"}
                onChange={handleChange}
              />
              <IconButton
                aria-label="see"
                icon={<SwitchIcon2 />}
                onClick={() => {
                  if (secondaryReveal) setSecondaryReveal(false);
                  else setSecondaryReveal(true);
                }}
                plain={false}
                color="gray"
              />
            </Flex>
          </FormControl>
          <Button
            mt={5}
            plain={false}
            colorScheme="facebook"
            type="submit"
            active
          >
            Register
          </Button>
        </Form>
      </Box>
    </Flex>
  );
};

export default Register;
