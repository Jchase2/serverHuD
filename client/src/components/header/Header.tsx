import {
  Header,
  Box,
  Button,
  ResponsiveContext,
  Nav,
  Menu,
} from "grommet";
import { useHistory } from "react-router-dom";

const ClientHeader = (props: any) => {
  const loginAndRegister = () => {
    return (
      <Box
        direction="row"
        alignContent="between"
        gap="xsmall"
      >
        <Button
          label="Register"
          onClick={() => history.push("/register")}
        />
        <Button label="Login" onClick={() => history.push("/login")} />
      </Box>
    );
  };

  const logout = () => {
    return (
        <Button
          label="Logout"
          onClick={() => {
            props.globalLogOut();
            history.push("/");
          }}
        />
    );
  };

  const history = useHistory();
  return (
    <>
      <Header>
        <Box direction="row" align="center" gap="small">
          ServerHuD
        </Box>
        <ResponsiveContext.Consumer>
          {(responsive) =>
            responsive === "small" ? (
              <Menu
                label="Click me"
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
