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

interface IUpdateServerProps {
  data: IData;
}

export const UpdateServer = (props: IUpdateServerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data } = props;
  const updateServer = useUpdateServer(data.id);
  const { mutate, reset, isLoading, isError, isSuccess } = updateServer;
  const [serverState, setServerState] = useState({
    url: "",
    optionalUrl: "",
    name: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerState((currentEvent) => ({
      ...currentEvent,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    mutate({
      url: serverState.url ? serverState.url : data.url,
      optionalUrl: serverState.optionalUrl
        ? serverState.optionalUrl
        : data.optionalUrl,
      name: serverState.name ? serverState.name : data.name,
    });

    setServerState({
      url: "",
      optionalUrl: "",
      name: "",
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
