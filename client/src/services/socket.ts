import React from "react";
import { cloneDeep, isEqual, merge } from "lodash";
import { QueryClient, Updater } from "@tanstack/react-query";
import { socket } from "../App";
import { ILiveData, IResourceData } from "../types";

export const queryClient = new QueryClient();

export const useReactQuerySubscription = () => {
  socket.connect();

  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("Global Socket Connected WITH ID: ", socket.id);
    });

    socket.on("serverUpdate", (data: ILiveData, callback) => {

      const queryKey = [`server-${data.id}`].filter(Boolean);
      queryClient.setQueryData<ILiveData>(
        queryKey,
        (oldData: ILiveData | undefined) => {
          let mergedData = cloneDeep(oldData);
          merge(mergedData, data);
          return mergedData;
        }
      );
      // Send back that we've got the upate.
      callback(data);
    });

    socket.on("liveServerUpdate", (data: ILiveData) => {
      const queryKey = [`live-server-${data.id}-${data.upInc}`].filter(Boolean);
      queryClient.setQueryData<ILiveData>(
        queryKey,
        (oldData: ILiveData | undefined) => {
          if (!oldData) return data;
          let mergedData = cloneDeep(oldData);
          merge(mergedData, data);
          return mergedData;
        }
      );
    });

    socket.on("resourcesUpdate", (data) => {
      const queryKey = [`server-usage-${data.id}-${data.inc}-${data.incCount}`].filter(Boolean);
      queryClient.setQueryData(
        queryKey,
        (
          oldData: Updater<IResourceData | undefined, IResourceData | undefined>
        ) => {
          if (!isEqual(oldData, data)) return data?.resourceObj;
        }
      );
    });

    return () => {
      console.log("DISCONNECTING ID: ", socket.id);
      socket.disconnect();
      console.log("REMOVING ALL LISTENERS");
      socket.removeAllListeners();
    };
  }, []);
};
