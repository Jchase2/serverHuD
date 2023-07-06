import AddServer from "./AddServer";
import { ErrorShow } from "../../components/Error/ErrorShow";
import { useEffect, useState } from "react";
import { useAddServer, useGetServers } from "../../services/api/api";
import { Box, Container, Flex, Divider, Button } from "@chakra-ui/react";
import { CiViewList } from "react-icons/ci";
import { IoGridOutline } from "react-icons/io5";
import { Loading } from "../../components/Loading/Loading";
import { useReactQuerySubscription } from "../../services/socket";
import { socket } from "../../App";
import { useNavigate } from "react-router-dom";
import DisplayServerList from "./DisplayServerList";

const Dashboard = () => {
  const [isListView, setIsListView] = useState(
    localStorage.getItem("isListView")
      ? localStorage.getItem("isListView")
      : "false"
  );
  const [stateMessage, setStateMessage] = useState<string>("");
  const [closed, setClosed] = useState(true);
  const { data, isLoading, isError, error } = useGetServers();
  const addNewServer = useAddServer();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isListView", isListView ? isListView : "false");
  }, [isListView]);

  useReactQuerySubscription();

  const setViewMode = () => {
    setIsListView(isListView === "false" ? "true" : "false");
  };

  if (isLoading)
    return (
      <Container centerContent>
        <Loading />
      </Container>
    );

  // TODO: Replace with error component.
  if (isError) {
    // If not logged in or token expired,
    // push to login screen.
    if (error.response.status === 401) {
      navigate("/login");
    } else {
      setStateMessage(error.response.data);
    }
    // TODO: Replace with error component.
    return <p>ERROR</p>;
  }

  return (
    <Flex direction={"column"} align={"center"} justify={"center"}>
      <AddServer addNewServer={addNewServer} />
      <ErrorShow
        message={stateMessage}
        closed={closed}
        setClosed={setClosed}
        isError={isError}
      />
      <Box justifyContent={"center"}>
        {isListView === "true" ? (
          <>
            <Button rightIcon={<IoGridOutline />} onClick={setViewMode}>
              Grid View
            </Button>
          </>
        ) : (
          <Button rightIcon={<CiViewList />} onClick={setViewMode}>
            List View
          </Button>
        )}
        <Divider mt={"2"} />
      </Box>
      <DisplayServerList isListView={isListView} data={data} />
    </Flex>
  );
};

export default Dashboard;
