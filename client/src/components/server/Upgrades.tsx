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

  interface IUptime {
    Days: number,
    Hours: number
  }

  interface IServer {
    name: string;
    id: string;
    sslExpiry: number;
    sslStatus: string;
    status: string;
    url: string;
    uptime: IUptime;
    upgrades: string
  }
  const [serverData, setServerData] = useState<IServer>({
    name: "",
    id: "",
    sslExpiry: 0,
    sslStatus: "",
    status: "",
    url: "",
    uptime: {Days: 0, Hours: 0},
    upgrades: ''
  });

  const location = useLocation();
  var parts = location.pathname.split("/");
  var paramStr = parts[parts.length - 2];
  useEffect(() => {
    getIndServer(paramStr).then((e: any) => {
      setServerData(e.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const history = useHistory();
  return (
    <Main align="center" justify="center">
      <Card height="large" width="large" background="light-1">
        {serverData.status === "down" ? (
          <CardHeader background="status-error" pad="small">
            {serverData.name}
          </CardHeader>
        ) : serverData.status === "up" && serverData.sslStatus === "false" ? (
          <CardHeader background="status-warning" pad="small">
            {serverData.name}
          </CardHeader>
        ) : (
          <CardHeader background="dark-1" pad="small">
            {serverData.name}
          </CardHeader>
        )}
        <CardBody pad="small">
          <Box>Available Upgrades: {serverData.upgrades}</Box>
        </CardBody>
        <CardFooter
          pad="small"
          background="light-2"
          align="center"
          justify="center"
        >
          <Button plain={false} onClick={() => history.push(`/server/${serverData?.id}`)}>
            Back to Server
          </Button>
        </CardFooter>
      </Card>
    </Main>
  );
};

export default ServerInfo;
