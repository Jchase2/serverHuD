import AddServer from "./AddServer";
import { ErrorShow } from "../../components/Error/ErrorShow";
import { useEffect, useState } from "react";
import { useAddServer, useGetServers } from "../../services/api/api";
import {
  Box,
  Container,
  Flex,
  Divider,
  Button,
  HStack,
} from "@chakra-ui/react";
import { CiViewList } from "react-icons/ci";
import { IoGridOutline } from "react-icons/io5";
import { Loading } from "../../components/Loading/Loading";
import { socket } from "../../App";
import { useNavigate } from "react-router-dom";
import DisplayServerList from "./DisplayServerList";
import { useReactQuerySubscription } from "../../services/socket";
import ServerSearch from "./ServerSearch";

const Dashboard = () => {
  const [isListView, setIsListView] = useState(
    localStorage.getItem("isListView")
      ? localStorage.getItem("isListView")
      : "false"
  );
  const [stateMessage, setStateMessage] = useState<string>("");
  const [closed, setClosed] = useState(true);
  const { data, isLoading, isError, error } = useGetServers();
  const [searchData, setSearchData] = useState<any>();
  const addNewServer = useAddServer();
  const navigate = useNavigate();
  useReactQuerySubscription();

  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("isListView", isListView ? isListView : "false");
  }, [isListView]);

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
          <HStack>
            <ServerSearch data={data} setSearchData={setSearchData} />
            <Button rightIcon={<IoGridOutline />} onClick={setViewMode}>
              Grid View
            </Button>
          </HStack>
        ) : (
          <HStack>
            <ServerSearch data={data} setSearchData={setSearchData} />
            <Button rightIcon={<CiViewList />} onClick={setViewMode}>
              List View
            </Button>
          </HStack>
        )}
        <Divider mt={"2"} />
      </Box>
      <DisplayServerList
        isListView={isListView}
        data={searchData ? searchData : data}
      />
    </Flex>
  );
};

export default Dashboard;
