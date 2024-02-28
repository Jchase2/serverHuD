import { ErrorShow } from "../../components/Error/ErrorShow";
import {
  Flex,
  Box,
  FormControl,
  Heading,
  FormLabel,
  Button,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { GrView } from "react-icons/gr";
import { BiHide } from "react-icons/bi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateUser } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { IconType } from "react-icons";

const Register = () => {
  let SwitchIcon: IconType;
  let SwitchIcon2: IconType;
  let navigate = useNavigate();
  const createUser = useCreateUser();

  const [registerState, setRegisterState] = useState({
    email: "",
    password: "",
    confirmPass: "",
  });
  const [reveal, setReveal] = useState(false);
  const [secondaryReveal, setSecondaryReveal] = useState(false);
  const [closed, setClosed] = useState<boolean>(true);
  const [stateMessage, setStateMessage] = useState<string>("");

  if (reveal) {
    SwitchIcon = BiHide;
  } else SwitchIcon = GrView;

  if (secondaryReveal) {
    SwitchIcon2 = BiHide;
  } else SwitchIcon2 = GrView;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegisterState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (registerState.password !== registerState.confirmPass) {
      setClosed(false);
      setStateMessage("Passwords do not match!");
      return;
    }

    createUser.mutate({
      email: (e.target as HTMLFormElement).email.value,
      password: (e.target as HTMLFormElement).password.value,
    });

    setRegisterState({
      email: "",
      password: "",
      confirmPass: "",
    });
  };

  const handleClose = () => {
    createUser.reset();
    setClosed(true);
  }

  useEffect(() => {
    if (createUser.isError) {
      setClosed(false);
      setStateMessage("Error: " + createUser.error.response?.data);
    }

    if (createUser.isSuccess) {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createUser]);

  if (createUser.isPending) {
    return (
      <Flex align="center" justifyContent="center" mt={5}>
        <Loading />
      </Flex>
    );
  }

  return (
    <Flex
      minH="70vh"
      align="center"
      justifyContent="center"
      flexDirection="column"
    >
      <ErrorShow
        message={stateMessage}
        isError={!closed}
        setClosed={handleClose}
        closed={closed}
      />
      <Box p={8} borderWidth={1} borderRadius={8} boxShadow="lg" minW="35vw">
        <Heading textAlign="center" mb={6}>
          Register
        </Heading>
        <form onSubmit={handleSubmit}>
          <FormControl isRequired>
            <FormLabel> Email </FormLabel>
            <Input
              value={registerState.email}
              placeholder="email"
              name="email"
              onChange={handleChange}
            />
            <FormLabel mt={4}> Password </FormLabel>
            <Flex>
              <Input
                value={registerState.password}
                name="password"
                placeholder="password"
                type={reveal ? "text" : "password"}
                onChange={handleChange}
                mr={2}
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
            <FormLabel mt={4}> Confirm Password </FormLabel>
            <Flex>
              <Input
                value={registerState.confirmPass}
                name="confirmPass"
                placeholder="confirm password"
                type={secondaryReveal ? "text" : "password"}
                onChange={handleChange}
                mr={2}
              />
              <IconButton
                aria-label="see"
                icon={<SwitchIcon2 />}
                onClick={() => {
                  if (secondaryReveal) setSecondaryReveal(false);
                  else setSecondaryReveal(true);
                }}
                color="gray"
              />
            </Flex>
          </FormControl>
          <Button mt={5} colorScheme="facebook" type="submit" onClick={handleClose}>
            Register
          </Button>
        </form>
      </Box>
    </Flex>
  );
};

export default Register;
