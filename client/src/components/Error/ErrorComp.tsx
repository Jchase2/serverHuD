import {
  Card,
  CardHeader,
  CardBody,
  Text,
  Button,
  CardFooter,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

interface Props {
  message: string;
}

export const ErrorComp: React.FC<Props> = ({ message }) => {
  const navigate = useNavigate();

  return (
    <Card textAlign={"center"} alignItems={"center"}>
      <CardHeader>
        <Text>Error</Text>
      </CardHeader>
      <CardBody>
        <Text>Error: {message}</Text>
      </CardBody>
      <CardFooter textAlign={"center"}>
        <Button mr={2} onClick={() => navigate("/")}>
          Home
        </Button>
      </CardFooter>
    </Card>
  );
};
