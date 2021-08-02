import { Box, Grommet, Image, Text, TextInput, Button, Main } from "grommet";
import { Hide, View } from "grommet-icons";
import { useState } from "react";
import { loginFunc } from "../../services/api";
import { useHistory } from "react-router-dom";

const Login = (props: any) => {
  const history = useHistory();

  const [loginState, setLoginState] = useState({
    email: "",
    password: "",
    confirmPass: "",
  });
  const [reveal, setReveal] = useState(false);

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
      confirmPass: "",
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
    <Main align="center" pad="large">
      <form onSubmit={handleSubmit}>
        <TextInput
          name="email"
          type="email"
          placeholder="email"
          value={loginState.email}
          onChange={handleChange}
        />
        <Box direction="row">
          <TextInput
            name="password"
            type={reveal ? "text" : "password"}
            placeholder="password"
            value={loginState.password}
            onChange={handleChange}
          />
          <Button
            icon={reveal ? <View size="medium" /> : <Hide size="medium" />}
            onClick={() => setReveal(!reveal)}
            plain={false}
            color="gray"
            secondary
          />
        </Box>
        <Button type="submit" plain={false}>
          Login
        </Button>
      </form>
    </Main>
  );
};

export default Login;
