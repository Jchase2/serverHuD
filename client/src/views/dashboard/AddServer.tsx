import { Box, Button, Input, Stack } from "@chakra-ui/react";
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
    <Box
      p={8}
      m={2}
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
      w="20vw"
      alignItems="center"
      justifyContent="center"
    >
      <p>New Server:</p>
      <form onSubmit={handleSubmit}>
        <Stack spacing={1}>
          <Input
            id="standard-basic"
            name="name"
            placeholder="name"
            value={serverState.name}
            onChange={handleChange}
          />
          <Input
            id="standard-password-input"
            name="url"
            placeholder="url"
            value={serverState.url}
            onChange={handleChange}
          />
          <Input
            id="standard-basic"
            name="optionalUrl"
            placeholder="optional backend url"
            value={serverState.optionalUrl}
            onChange={handleChange}
          />
          <Button type="submit">Add Server</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AddServer;
