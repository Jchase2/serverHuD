import { useEffect, useState } from "react";
import { VictoryPie } from "victory";

const DiskGraph = (props: any) => {
  const [graphicData, setGraphicData] = useState({
    percentageUp: 0,
    percentageDown: 0,
  });

  const [endAngle, setEndAngle] = useState(0);

  useEffect(() => {
    console.log("GRAPHIC DATA UPDATED: ", props.data)
    setGraphicData(props.data); // Setting the data that we want to display
    setEndAngle(360);
  }, [props.data]);

  const data = [
    {
      x: `Up`,
      y: Number(graphicData.percentageUp),
    },
    {
      x: `Down`,
      y: Number(graphicData.percentageDown),
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
      padding={{ right: 100, left: 100, top: 0, bottom: 100 }}
      labels={(datum) => `${datum.datum.y.toFixed(2)}% ${datum.datum.x}`}
      style={{
        data: {
          fillOpacity: 0.7,
        },
      }}
    />
  );
};

export default DiskGraph;
