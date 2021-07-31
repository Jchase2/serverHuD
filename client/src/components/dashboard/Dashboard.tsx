import Server from "../server/Server";
import AddServer from "./AddServer";

const Dashboard = (props: any) => {
  console.log("serverList: ", JSON.stringify(props.serverList));
  return (
    <>
      <AddServer />
      {props.serverList.map((e: any) => (
        <Server serverUrl={e?.url} />
      ))}
    </>
  );
};

export default Dashboard;
