import React from "react";
import { cloneDeep, isEqual } from "lodash";
import { QueryClient } from "@tanstack/react-query";
import { socket } from "../App";

export const queryClient = new QueryClient();

export const useReactQuerySubscription = () => {
  socket.connect();

  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("Global Socket Connected WITH ID: ", socket.id);
    });

    socket.on("serverUpdate", (data, callback) => {
      const queryKey = [`server-${data.id}`].filter(Boolean);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        let mergedData = cloneDeep(oldData);
        for (const [key, value] of Object.entries(data)) {
          if (mergedData[key] !== value) {
            mergedData[key] = value;
          }
        }
        return mergedData;
      });
      // Send back that we've got the upate.
      callback(data);
    });

    socket.on("liveServerUpdate", (data) => {
      const queryKey = [`live-server-${data.id}`].filter(Boolean);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return data;
        let mergedData = cloneDeep(oldData);
        for (const [key, value] of Object.entries(data)) {
          if (mergedData[key] !== value) {
            mergedData[key] = value;
          }
        }
        return mergedData;
      });
    });

    socket.on("resourcesUpdate", (data) => {
      const queryKey = [`server-usage-${data.id}`].filter(Boolean);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!isEqual(oldData, data)) return data?.resourceObj;
      });
    });

    return () => {
      console.log("DISCONNECTING ID: ", socket.id);
      socket.disconnect();
      console.log("REMOVING ALL LISTENERS");
      socket.removeAllListeners();
    };
  }, []);
};
