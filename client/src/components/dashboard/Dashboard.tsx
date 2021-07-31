import Server from "../server/Server";
import AddServer from "./AddServer";

const Dashboard = (props: any) => {
  console.log("serverList: ", JSON.stringify(props.serverList));
  return (
    <>
      <AddServer />
      {props.serverList.map((e: any) => (
        <div key={e?.url}>
          <Server serverUrl={e?.url} />
        </div>
      ))}
    </>
  );
};

export default Dashboard;
