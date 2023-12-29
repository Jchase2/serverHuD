import { useColorMode } from "@chakra-ui/react";
import { VictoryLabel, VictoryPie } from "victory";
import { ILiveData } from "../../types";

interface IUpGraphProps {
  data: ILiveData
}

const UpGraph = (props: IUpGraphProps) => {

  const { colorMode } = useColorMode();

  const data = [
    {
      x: `Up`,
      y: Number(props?.data?.percentageUp),
    },
    {
      x: `Down`,
      y: Number(props?.data?.percentageDown),
    },
  ];

  return (
    <VictoryPie
      data={data}
      colorScale={["#003f5c", "#ffa600"]}
      animate={{
        duration: 2000,
      }}
      endAngle={360}
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
