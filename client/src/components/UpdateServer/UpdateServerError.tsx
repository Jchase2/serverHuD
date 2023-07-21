import { EditIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  Button,
  IconButton,
} from "@chakra-ui/react";
import { ErrorShow } from "../Error/ErrorShow";

export const UpdateServerError = (props: any) => {
  const { updateServer, isOpen, onOpen, onClose } = props;

  const handleClose = () => {
    updateServer.reset();
    onClose();
  };

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
          <ModalHeader>Error with request.</ModalHeader>
          <ModalBody>
            <ErrorShow
              message={"Error: " + updateServer?.error?.response?.data}
              setClosed={handleClose}
              closed={false}
              isError={updateServer.isError}
            />
          </ModalBody>{" "}
          <ModalFooter>
            <Button mr={3} onClick={handleClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
