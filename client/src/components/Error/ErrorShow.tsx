import { Alert, AlertIcon, AlertTitle, CloseButton } from "@chakra-ui/react";

interface Props {
  message: string;
  setClosed: Function;
  closed: boolean;
  isError: boolean;
  maxW?: string | Array<string>;
}

export const ErrorShow: React.FC<Props> = ({
  message,
  closed,
  setClosed,
  isError,
  maxW
}) => {
  return (
    <>
      {isError && !closed && (
        <Alert
          status="error"
          mb="10px"
          flexDirection="column"
          borderRadius="10px"
          maxW={maxW}
        >
          <AlertIcon />
          <AlertTitle textAlign="center">{message}</AlertTitle>
          <CloseButton
            position="absolute"
            right="8px"
            top="8px"
            onClick={() => setClosed(true)}
          />
        </Alert>
      )}
    </>
  );
};
