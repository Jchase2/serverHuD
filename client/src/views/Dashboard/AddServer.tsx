import { Box, Button, Checkbox, Input, Stack, Text } from "@chakra-ui/react";
import { UseMutationResult } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { IAddServer } from "../../types";
import { AxiosError } from "axios";
import UpdateOptionalServer from "../../components/UpdateServer/UpdateOptionalServer";

interface IAddServerProps {
  addNewServer: UseMutationResult<any, AxiosError<any>, IAddServer, unknown>;
}

const AddServer = (props: IAddServerProps) => {
  const [serverState, setServerState] = useState({
    url: "",
    optionalUrl: "",
    name: "",
    status: "",
    sslStatus: "",
    sslExpiry: 0,
    emailNotifications: false,
    interval: "1-minute",
    trackOptions: {
      trackDisk: true,
      trackResources: true,
      trackUpgrades: true,
      trackSmart: false,
    },
  });

  const [checkedItems, setCheckedItems] = useState({
    trackDisk: true,
    trackResources: true,
    trackUpgrades: true,
    trackSmart: false,
  });

  useEffect(() => {
    setServerState({ ...serverState, trackOptions: checkedItems });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkedItems]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Make sure we have http or https prepended.
    if (
      serverState.url &&
      !serverState.url.startsWith("http://") &&
      !serverState.url.startsWith("https://")
    ) {
      serverState.url = "https://" + serverState.url;
    }

    // Make sure we have http or https prepended.
    if (
      serverState.optionalUrl &&
      !serverState.optionalUrl.startsWith("http://") &&
      !serverState.optionalUrl.startsWith("https://")
    ) {
      serverState.optionalUrl = "http://" + serverState.optionalUrl;
    }

    props.addNewServer.mutate(serverState);
    setServerState({
      url: "",
      optionalUrl: "",
      name: "",
      status: "",
      sslStatus: "",
      sslExpiry: 0,
      emailNotifications: false,
      interval: "1-minute",
      trackOptions: {
        trackDisk: checkedItems.trackDisk,
        trackResources: checkedItems.trackResources,
        trackUpgrades: checkedItems.trackUpgrades,
        trackSmart: checkedItems.trackSmart,
      },
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
          <Checkbox
            pt={2}
            pb={2}
            isChecked={serverState.emailNotifications}
            onChange={(e) =>
              setServerState({
                ...serverState,
                emailNotifications: e.target.checked,
              })
            }
          >
            Recieve Email Notifications?
          </Checkbox>
          {serverState?.optionalUrl ? (
            <UpdateOptionalServer
              checkedItems={checkedItems}
              setCheckedItems={setCheckedItems}
            />
          ) : null}
          <Button type="submit">Add Server</Button>
        </Stack>
      </form>
    </Box>
  );
};

export default AddServer;
