import { Header, Box,  ResponsiveContext, Nav, Menu } from "grommet";
import { Button } from "@chakra-ui/react"
import { useHistory } from "react-router-dom";

const ClientHeader = (props: any) => {
  const loginAndRegister = () => {
    return (
      <Box direction="row" alignContent="between" gap="xsmall">
        <Button
          
          onClick={() => history.push("/register")}
        >
          Register
        </Button>
        <Button colorScheme="facebook" onClick={() => history.push("/login")}>
          Login
        </Button>
      </Box>
    );
  };

  const logout = () => {
    return (
      <Button
        colorScheme="facebook"
        onClick={() => {
          props.globalLogOut();
          history.push("/");
        }}
      >
        Logout
      </Button>
    );
  };

  const history = useHistory();
  return (
    <>
      <Header
        background="#b8c6db; background-image: linear-gradient(315deg, #b8c6db 0%, #f5f7fa 74%);"
        pad="10px"
      >
        <Box direction="row" align="center" gap="small" pad="10px">
          {<Button onClick={() => history.push("/")}>ServerHuD</Button>}
        </Box>
        <ResponsiveContext.Consumer>
          {(responsive) =>
            responsive === "small" ? (
              <Menu
                label="Click me"
                color="grey"
                items={[
                  {
                    label: "Register",
                    onClick: () => history.push("/register"),
                  },
                  { label: "Login", onClick: () => history.push("/login") },
                ]}
              />
            ) : (
              <Nav direction="row">
                {props.isAuthed === "false" ? loginAndRegister() : logout()}
              </Nav>
            )
          }
        </ResponsiveContext.Consumer>
      </Header>
    </>
  );
};

export default ClientHeader;
