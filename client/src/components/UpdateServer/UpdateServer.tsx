import { EditIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  IconButton,
  Input,
} from "@chakra-ui/react";
import { useState } from "react";
import { Loading } from "../Loading/Loading";
import { useUpdateServer } from "../../services/api/api";
import { UpdateServerError } from "./UpdateServerError";
import { IData } from "../../types";
import UpdateOptionalServer from "./UpdateOptionalServer";

interface IUpdateServerProps {
  data: IData;
}

export const UpdateServer = (props: IUpdateServerProps) => {

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = props;
  const updateServer = useUpdateServer(data.id);
  const { mutate, reset, isLoading, isError, isSuccess } = updateServer;

  const [checkedItems, setCheckedItems] = useState({
    trackDisk: data?.trackOptions?.trackDisk,
    trackResources: data?.trackOptions?.trackResources,
    trackUpgrades: data?.trackOptions?.trackUpgrades,
    trackSmart: data?.trackOptions?.trackSmart,
  });

  const [serverState, setServerState] = useState({
    url: "",
    optionalUrl: "",
    name: "",
    trackOptions: {
      trackDisk: true,
      trackResources: true,
      trackUpgrades: true,
      trackSmart: true,
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    // Make sure we have http or https prepended.
    if (
      serverState.url &&
      !serverState.url.startsWith("http://") &&
      !serverState.url.startsWith("https://")
    ) {
      serverState.url = "https://" + serverState.url;
    }

    if (
      serverState.optionalUrl &&
      !serverState.optionalUrl.startsWith("http://") &&
      !serverState.optionalUrl.startsWith("https://")
    ) {
      serverState.optionalUrl = "http://" + serverState.optionalUrl;
    }

    mutate({
      url: serverState.url ? serverState.url : data.url,
      optionalUrl: serverState.optionalUrl
        ? serverState.optionalUrl
        : data.optionalUrl,
      name: serverState.name ? serverState.name : data.name,
      trackOptions: {
        trackDisk: checkedItems.trackDisk,
        trackResources: checkedItems.trackResources,
        trackUpgrades: checkedItems.trackUpgrades,
        trackSmart: checkedItems.trackSmart,
      },
    });

    setServerState({
      url: "",
      optionalUrl: "",
      name: "",
      trackOptions: {
        trackDisk: checkedItems.trackDisk,
        trackResources: checkedItems.trackResources,
        trackUpgrades: checkedItems.trackUpgrades,
        trackSmart: checkedItems.trackSmart,
      },
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return (
      <UpdateServerError
        updateServer={updateServer}
        isOpen={isOpen}
        onOpen={onOpen}
        onClose={onClose}
      />
    );
  }

  if (isSuccess) {
    reset();
    onClose();
  }

  return (
    <>
      <IconButton
        aria-label="Edit Server"
        icon={<EditIcon />}
        onClick={onOpen}
        ml={2}
        mr={2}
        colorScheme="black"
        variant="outline"
        size="sm"
      />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Server: {data.name}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            New Name:{" "}
            <Input
              mb={2}
              placeholder={data.name}
              id="standard-basic"
              name="name"
              value={serverState.name}
              onChange={handleChange}
            />
            New Url:{" "}
            <Input
              mb={2}
              placeholder={data.url}
              id="standard-basic"
              name="url"
              value={serverState.url}
              onChange={handleChange}
            />
            New Optional Url:{" "}
            <Input
              placeholder={data?.optionalUrl}
              id="standard-basic"
              name="optionalUrl"
              value={serverState.optionalUrl}
              onChange={handleChange}
            />
            {data?.optionalUrl ? <UpdateOptionalServer checkedItems={checkedItems} setCheckedItems={setCheckedItems}  /> : null}
          </ModalBody>
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Close
            </Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
