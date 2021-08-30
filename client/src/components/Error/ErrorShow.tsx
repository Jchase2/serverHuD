import { Alert, AlertIcon, AlertTitle, CloseButton } from "@chakra-ui/react";

interface Props {
  message: string;
  isClosed: boolean;
  setIsError: Function;
}

export const ErrorShow: React.FC<Props> = ({
  message,
  isClosed,
  setIsError,
}) => {
  return (
    <>
      {isClosed && (
        <Alert
          status="error"
          mb="10px"
          flexDirection="column"
          minW="35vw"
          maxW="35vw"
          borderRadius="10px"
        >
          <AlertIcon />
          <AlertTitle textAlign="center">{message}</AlertTitle>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setIsError(false)}
          />
        </Alert>
      )}
    </>
  );
};
