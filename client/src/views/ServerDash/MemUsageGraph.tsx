import { useColorMode } from "@chakra-ui/react";
import {
  VictoryArea,
  VictoryAxis,
  VictoryChart,
  VictoryLabel,
  VictoryTheme,
} from "victory";
import { IXYData } from "../../types";

interface MemUsageGraphProps {
  serverUsageData: IXYData[]
}

const MemUsageGraph = (props: MemUsageGraphProps) => {
  const { colorMode } = useColorMode();
  const { serverUsageData } = props;
  return (
    <VictoryChart height={200} width={600} theme={VictoryTheme.material}>
      <VictoryLabel text="Memory Usage" x={225} y={30} style={{ fill: colorMode === 'light' ? '' : 'gray' }} />
      <VictoryArea
        style={{
          data: {
            fill: "#003f5c",
            fillOpacity: 0.7,
            stroke: "#003f5c",
            strokeWidth: 3,
          },
        }}
        height={200}
        width={500}
        data={serverUsageData}
        animate={{
          duration: 2000,
          onLoad: { duration: 1000 },
        }}
      />
      <VictoryAxis
        label="Minutes Ago"
        invertAxis={true}
        style={{
          axis: { stroke: "none" },
          axisLabel: {
            padding: 30
          },
          ticks: { stroke: "none" },
          //tickLabels: { fill: "none" },
          grid: { stroke: "transparent" },
        }}
      />
      <VictoryAxis
        dependentAxis
        tickFormat={(tick) => `${tick}%`}
        style={{
          axis: { stroke: "none" },
          ticks: { stroke: "none" },
          grid: { stroke: "transparent" },
        }}
      />
    </VictoryChart>
  );
};

export default MemUsageGraph;
