import { Box, Button, TextInput, Main, Form } from "grommet";
import { useState } from "react";

const AddServer = (props: any) => {
  const [serverState, setServerState] = useState({
    url: "",
    optionalUrl: "",
    name: "",
    status: "",
    sslStatus: "",
    sslExpiry: 0,
  });

  const handleChange = (e: any) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    props.addNewServer(serverState);
    setServerState({
      url: "",
      optionalUrl: "",
      name: "",
      status: "",
      sslStatus: "",
      sslExpiry: 0,
    });
  };

  return (
    <Main align="center" justify="center" pad="large">
      <p>New Server:</p>
      <Form onSubmit={handleSubmit}>
        <Box pad="xsmall">
          <TextInput
            id="standard-basic"
            name="name"
            placeholder="name"
            value={serverState.name}
            onChange={handleChange}
          />
          <TextInput
            id="standard-password-input"
            name="url"
            placeholder="url"
            value={serverState.url}
            onChange={handleChange}
          />
          <TextInput
            id="standard-basic"
            name="optionalUrl"
            placeholder="optional backend url"
            value={serverState.optionalUrl}
            onChange={handleChange}
          />
        </Box>
        <Box align="center">
          <Button type="submit" plain={false}>
            Add Server
          </Button>
        </Box>
      </Form>
    </Main>
  );
};

export default AddServer;
