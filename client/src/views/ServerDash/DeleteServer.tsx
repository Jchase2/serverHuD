import { DeleteIcon } from "@chakra-ui/icons";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalFooter,
  ModalCloseButton,
  Button,
  useDisclosure,
  ModalBody,
  Container,
} from "@chakra-ui/react";
import { useDeleteServer } from "../../services/api/api";
import { Loading } from "../../components/Loading/Loading";
import { useNavigate } from "react-router-dom";
import { ErrorShow } from "../../components/Error/ErrorShow";
import { useState } from "react";

interface DeleteServerProps {
  paramStr: string,
}

export const DeleteServer = (props: DeleteServerProps) => {
  const { paramStr } = props;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const deleteServer = useDeleteServer(paramStr);
  const navigate = useNavigate();
  const [closed, setClosed] = useState(true);

  const handleDelete = (e: React.MouseEvent) => {
    deleteServer.mutate();
  }

  if (deleteServer.isPending)
  return (
    <Container centerContent>
      <Loading />
    </Container>
  );

  if(deleteServer.isSuccess) {
    navigate("/dashboard");
  }

  if(deleteServer.isError) {
    <ErrorShow message={"Error Deleting Server"} setClosed={setClosed} closed={closed} isError={deleteServer?.isError} />
  }

  return (
    <>
      <Button leftIcon={<DeleteIcon />} colorScheme="red" variant="outline" onClick={onOpen}>
        Delete
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalBody>Are you sure you want to delete this server?</ModalBody>
          <ModalCloseButton />
          <ModalFooter>
            <Button mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleDelete} colorScheme="red" variant="outline">Yes</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
