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
import { IData } from "../../types";
import { ErrorComp } from "../../components/Error/ErrorComp";

const Dashboard = () => {
  const [isListView, setIsListView] = useState(
    localStorage.getItem("isListView")
      ? localStorage.getItem("isListView")
      : "false"
  );
  const [stateMessage, setStateMessage] = useState<string>("");
  const [closed, setClosed] = useState(true);
  const { data, isLoading, isError, error } = useGetServers();
  const [searchData, setSearchData] = useState<IData[]>();
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

  useEffect(() => {
    if (addNewServer.isError) {
      setClosed(false);
      setStateMessage(
        "Error: " + (addNewServer.error.response?.data || "Unknown Error")
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addNewServer]);

  const setViewMode = () => {
    setIsListView(isListView === "false" ? "true" : "false");
  };

  const handleClose = () => {
    addNewServer.reset();
    setClosed(true);
  };

  if (isLoading)
    return (
      <Container centerContent mt={4}>
        <Loading />
      </Container>
    );

  if (isError && error) {
    // If not logged in or token expired,
    // push to login screen.
    if (error.message === "401 Unauthorized" || error.message === "Request failed with status code 401") {
      navigate("/login");
    } else {
      setStateMessage(error?.message);
    }
    return <ErrorComp message="Unknown Error has Occured" />;
  }

  return (
    <Flex direction={"column"} align={"center"} justify={"center"}>
      <AddServer addNewServer={addNewServer} />
      <ErrorShow
        message={stateMessage}
        closed={closed}
        setClosed={handleClose}
        isError={isError || addNewServer?.isError}
        maxW={["100vw", "70vw", "50vw", "30vw", "20vw"]}
      />
      {addNewServer?.isPending ? <Loading /> : null}
      <Box justifyContent={"center"}>
        {isListView === "true" ? (
          <HStack>
            <ServerSearch data={data} setSearchData={setSearchData} />
            <Button p={6} rightIcon={<IoGridOutline />} onClick={setViewMode}>
              Grid View
            </Button>
          </HStack>
        ) : (
          <HStack>
            <ServerSearch data={data} setSearchData={setSearchData} />
            <Button p={6} rightIcon={<CiViewList />} onClick={setViewMode}>
              List View
            </Button>
          </HStack>
        )}
        <Divider mt={"2"} />
      </Box>
      {data ? (
        <DisplayServerList
          isListView={isListView}
          data={searchData ? searchData : data}
        />
      ) : null}
    </Flex>
  );
};

export default Dashboard;
