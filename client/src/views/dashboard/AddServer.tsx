import { Box, Button, Input, Stack, Text } from "@chakra-ui/react";
import { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { IAddServer } from "../../types";
import { AxiosError } from "axios";

interface IAddServerProps {
  addNewServer: UseMutationResult<any, AxiosError<any>, IAddServer, unknown>
}

const AddServer = (props: IAddServerProps) => {
  const [serverState, setServerState] = useState({
    url: "",
    optionalUrl: "",
    name: "",
    status: "",
    sslStatus: "",
    sslExpiry: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Make sure we have http or https prepended.
    if (!serverState.url.startsWith("http://") && !serverState.url.startsWith("https://")) {
      serverState.url = "https://" + serverState.url;
    }

    props.addNewServer.mutate(serverState);
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
      minW="20vw"
      textAlign={"center"}
    >
      <Text m={2}>New Server:</Text>
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
