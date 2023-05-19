import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getIndServer, deleteServer } from "../../services/api";
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
    Days: number;
    Hours: number;
  }

  interface IServer {
    name: string;
    id: string;
    sslExpiry: number;
    sslStatus: string;
    status: string;
    url: string;
    uptime: IUptime;
    upgrades: string;
    diskSpace: number;
  }
  const [serverData, setServerData] = useState<IServer>({
    name: "",
    id: "",
    sslExpiry: 0,
    sslStatus: "",
    status: "",
    url: "",
    uptime: { Days: 0, Hours: 0 },
    upgrades: "",
    diskSpace: 0
  });

  const location = useLocation();
  const parts = location.pathname.split("/");
  const paramStr = parts[parts.length - 1];
  useEffect(() => {
    getIndServer(paramStr).then((e: any) => {
      console.log("ServerInfo IS: ", e)
      setServerData(e.data);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const history = useHistory();

  return (
    <Main align="center" justify="center">
      <Card height="medium" width="large" background="light-1">
        {serverData?.status === "down" ? (
          <CardHeader background="status-error" pad="small">
            {serverData?.name}
          </CardHeader>
        ) : serverData?.status === "up" && serverData?.sslStatus === "false" ? (
          <CardHeader background="status-warning" pad="small">
            {serverData?.name}
          </CardHeader>
        ) : (
          <CardHeader background="dark-1" pad="small">
            {serverData?.name}
          </CardHeader>
        )}
        <CardBody pad="small">
          <Box>Server URL: {serverData?.url}</Box>
          <Box>
            Server Status: {serverData?.status === "up" ? "Up" : "Down!"}
          </Box>
          <Box>
            SSL: {serverData?.sslStatus === "true" ? "Active" : "Down!"}
          </Box>
          {serverData?.sslStatus === "true" ? (
            <Box> SSL Expires: {serverData?.sslExpiry} Days</Box>
          ) : null}
          {serverData?.uptime?.Hours > 0 || serverData?.uptime?.Days > 0 ? (
            <Box>
              Uptime:{" "}
              {serverData?.uptime.Days +
                " Days " +
                serverData.uptime.Hours +
                " Hours "}
            </Box>
          ) : null}
        </CardBody>
        <CardFooter
          pad="small"
          background="light-2"
          align="center"
          justify="center"
        >
          <Button plain={false} onClick={() => history.push("/dashboard")}>
            Dashboard
          </Button>
          {serverData.upgrades ? (
            <Button
              plain={false}
              onClick={() => history.push(`/server/${serverData?.id}/upgrades`)}
            >
              Upgrades
            </Button>
          ) : null}
          <Button
            plain={false}
            color={"red"}
            onClick={() => {
              deleteServer(paramStr);
              history.push("/dashboard");
            }}
          >
            Delete
          </Button>
        </CardFooter>
      </Card>
    </Main>
  );
};

export default ServerInfo;
