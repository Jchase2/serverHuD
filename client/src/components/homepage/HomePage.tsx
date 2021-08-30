
import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Icon,
  useColorModeValue,
  createIcon,
} from "@chakra-ui/react";
import "animate.css"
import { useHistory } from "react-router-dom";

// const useStyles = makeStyles({
//   root: {
//     height: "70vh",
//   },
//animate__fadeInUp
// });

const HomePage = () => {
  const history = useHistory();
  return (
    <>
      <Container maxW={"3xl"} className="animate__animated animate__fadeInUp" paddingTop="100px">
        <Stack
          as={Box}
          textAlign={"center"}
          spacing={{ base: 8, md: 14 }}
          py={{ base: 20, md: 36 }}
        >
          <Heading
            fontWeight={600}
            fontSize={{ base: "2xl", sm: "4xl", md: "6xl" }}
            lineHeight={"110%"}
          >
            Monitor your servers with <br />
            <Text as={"span"} color={"blue.600"}>
              serverHuD
            </Text>
          </Heading>
          <Text color={"gray.500"}>
            serverHuD is a convenient way to avoid surprise outages and monitor
            the status of your SSL certs, upgrades, and more!
          </Text>
          <Stack
            direction={"column"}
            spacing={3}
            align={"center"}
            alignSelf={"center"}
            position={"relative"}
          >
            <Button
              colorScheme={"green"}
              bg={"blue.400"}
              rounded={"full"}
              px={6}
              _hover={{
                bg: "blue.600",
              }}
            >
              Sign Up
            </Button>
            <Box></Box>
          </Stack>
        </Stack>
      </Container>
    </>
  );
};
// <Grid container className={classes.root} direction="column" justifyContent="center" alignItems="center">
//   <Grid item>
//     <h1>Keep an eye on your servers with serverHuD.</h1>
//   </Grid>
//   <Grid item>
//     <Button plain={false} onClick={() => history.push("/register")}>
//       Sign Up
//     </Button>
//   </Grid>
// </Grid>

export default HomePage;
