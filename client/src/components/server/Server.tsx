import { useHistory } from "react-router-dom";
import {
  Main,
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "grommet";

const Server = (props: any) => {
  const history = useHistory();
  return (
    <Main pad="medium">
      <Card height="small" width="medium" background="light-1">
        <CardHeader background="dark-1" pad="small">{props.serverData.name}</CardHeader>
        <CardBody pad="small">
            <Box>Server URL: {props.serverData.url}</Box>
            <Box>
              Server Status: {props.serverData.status === "up" ? "Up" : "Down!"}
            </Box>
            <Box>
              SSL: {props.serverData.sslStatus === "true" ? "Active" : "Down!"}
            </Box>
        </CardBody>
        <CardFooter pad="small" background="light-2" align="center" justify="center">
          <Button
            plain={false}
            onClick={() => history.push("/server/" + props.serverData.id)}
          >
            More Info
          </Button>
        </CardFooter>
      </Card>
    </Main>
  );
};

export default Server;
