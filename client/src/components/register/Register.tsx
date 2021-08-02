import { Hide, View } from "grommet-icons";
import { Box, Button, TextInput, Main, Form } from "grommet";
import { useState } from "react";
import { registerFunc } from "../../services/api";
import { useHistory } from "react-router-dom";

const Register = () => {
  const history = useHistory();

  const [registerState, setRegisterState] = useState({
    email: "",
    password: "",
    confirmPass: "",
    grommet: "",
  });
  const [reveal, setReveal] = useState(false);

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
      alert("Registration failed! Please try again.");
    }
  };

  return (
    <Main align="center"  pad="large">
      <Form onSubmit={handleSubmit}>
        <TextInput
          value={registerState.email}
          placeholder="email"
          name="email"
          onChange={handleChange}
        />
        <Box direction="row">
          <TextInput
            value={registerState.password}
            name="password"
            placeholder="password"
            type={reveal ? "text" : "password"}
            onChange={handleChange}
          />
          <Button
            icon={reveal ? <View size="medium" /> : <Hide size="medium" />}
            onClick={() => setReveal(!reveal)}
          />
        </Box>
        <Box direction="row">
          <TextInput
            value={registerState.confirmPass}
            name="confirmPass"
            placeholder="confirm password"
            type={reveal ? "text" : "password"}
            onChange={handleChange}
          />
          <Button
            icon={reveal ? <View size="medium" /> : <Hide size="medium" />}
            onClick={() => setReveal(!reveal)}
          />
        </Box>
        <Button label="Register" type="submit" active>Register</Button>
      </Form>
    </Main>
  );
};

export default Register;
