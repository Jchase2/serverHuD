import { cloneDeep } from "lodash";
import React from "react";
import io from "socket.io-client";

// TODO: Replace localhost with .env backend url.
export const socket = io("localhost:3001", {
  auth: {
    token: localStorage.getItem("accessToken"),
  },
  transports: ["websocket"],
});

export const useReactQuerySubscription = (queryClient: any) => {
  React.useEffect(() => {
    socket.on("connect", () => {
      console.log("Global Socket Connected.");
    });

    socket.on("serverUpdate", (data, callback) => {
      console.log("SERVER UPDATE RECIEVED WITH: ", data);
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
      console.log("GOT LIVESERVER UPDATE WITH DATA: ", data)
      const queryKey = [`live-server-${data.id}`].filter(Boolean);
      queryClient.setQueryData(queryKey, (oldData: any) => {
        console.log("OLD DATA IS: ", oldData)
        if(!oldData) return data;
        let mergedData = cloneDeep(oldData);
        for (const [key, value] of Object.entries(data)) {
          if (mergedData[key] !== value) {
            mergedData[key] = value;
          }
        }
        return mergedData;
      });
    });

    return () => {
      console.log("DISCONNECTING.");
      socket.disconnect();
    };
  }, [queryClient]);
};
