import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getIndServer } from "../../services/api";
import {
  Main,
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
} from "grommet";
import { useHistory } from "react-router-dom";


const ServerInfo = (props: any) => {
  interface IServer {
    name: string;
    sslExpiry: number;
    sslStatus: string;
    status: string;
    url: string;
  }
  const [serverData, setServerData] = useState<IServer>({
    name: "",
    sslExpiry: 0,
    sslStatus: "",
    status: "",
    url: "",
  });

  const location = useLocation();
  var parts = location.pathname.split("/");
  var paramStr = parts[parts.length - 1];
  useEffect(() => {
    getIndServer(paramStr).then((e: any) => {
      setServerData(e.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const history = useHistory();
  return (
    <Main align="center" justify="center">
      <Card height="medium" width="medium" background="light-1">
        <CardHeader background="dark-1" pad="small">
          {serverData.name}
        </CardHeader>
        <CardBody pad="small">
          <Box>Server URL: {serverData.url}</Box>
          <Box>
            Server Status: {serverData.status === "up" ? "Up" : "Down!"}
          </Box>
          <Box>SSL: {serverData.sslStatus === "true" ? "Active" : "Down!"}</Box>
          <Box> SSL Expires: {serverData.sslExpiry} Days</Box>
        </CardBody>
        <CardFooter
          pad="small"
          background="light-2"
          align="center"
          justify="center"
        >
          <Button
            plain={false}
            onClick={() => history.push("/server")}
          >
            Dashboard
          </Button>
        </CardFooter>
      </Card>
    </Main>
  );
};

export default ServerInfo;
