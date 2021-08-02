import Button from "@material-ui/core/Button";
import {
  Header,
  Box,
  Button as GrommetButton,
  ResponsiveContext,
  Anchor,
  Grommet,
  Nav,
  Menu,
} from "grommet";
import { useHistory } from "react-router-dom";

const ClientHeader = (props: any) => {
  const loginAndRegister = () => {
    return (
      <>
        <GrommetButton
          label="Register"
          onClick={() => history.push("/register")}
        />
        <GrommetButton label="Login" onClick={() => history.push("/login")} />
      </>
    );
  };

  const logout = () => {
    return (
        <GrommetButton
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
