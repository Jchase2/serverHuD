import { useColorMode } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { VictoryLabel, VictoryPie } from "victory";
import { ILiveData } from "../../types";

interface IUpGraphProps {
  data: ILiveData
}

const UpGraph = (props: IUpGraphProps) => {
  const [graphicData, setGraphicData] = useState({
    percentageUp: 0,
    percentageDown: 0,
  });
  const { colorMode } = useColorMode();
  const [endAngle, setEndAngle] = useState(0);

  useEffect(() => {
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
      padding={{ right: 110, left: 125, top: 10, bottom: 0 }}
      labels={(datum) => `${datum.datum.y.toFixed(2)}% ${datum.datum.x}`}
      labelComponent={<VictoryLabel style={{ fill: colorMode === 'light' ? '' : 'gray' }}/>}
      style={{
        data: {
          fillOpacity: 0.7,
        },
      }}
    />
  );
};

export default UpGraph;
