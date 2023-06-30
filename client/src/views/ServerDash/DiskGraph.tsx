import { useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { VictoryLabel, VictoryPie } from "victory";

const DiskGraph = (props: any) => {
  const { colorMode } = useColorMode();

  const [graphicData, setGraphicData] = useState({
    diskSize: 0,
    diskUsed: 0,
  });

  const [endAngle, setEndAngle] = useState(0);

  useEffect(() => {
    console.log("GRAPHIC DATA UPDATED: ", props.data);
    setGraphicData(props.data); // Setting the data that we want to display
    setEndAngle(360);
  }, [props.data]);

  const data = [
    {
      x: `Used`,
      y: Number(graphicData.diskUsed),
    },
    {
      x: `Available`,
      y: Number(graphicData.diskSize - graphicData.diskUsed),
    },
  ];

  return (
    <VictoryPie
      data={data}
      colorScale={["#003f5c", "#ffa600"]}
      animate={{
        duration: 2000,
      }}
      endAngle={endAngle}
      padding={{ right: 110, left: 125, top: 0, bottom: 100 }}
      labels={(datum) => `${datum.datum.y.toFixed(1)}gb ${datum.datum.x}`}
      labelComponent={
        <VictoryLabel style={{ fill: colorMode === "light" ? "" : "gray" }} />
      }
      style={{
        data: {
          fillOpacity: 0.7,
        },
      }}
    />
  );
};

export default DiskGraph;
