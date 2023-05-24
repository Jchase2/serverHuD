import { useQuery } from "@tanstack/react-query";
import axios from "axios";

export function useGetIndServer(id: string) {
  return useQuery({
    queryKey: [`server-${id}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      }).then(
        (response) => {
          return response;
        },
        (error) => {
          return error;
        }
      );

      return data;
    },
    // Since we're getting updates with sockets,
    // no need to mark cache data as stale and refetch it.
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

export function useGetUpData(id: string) {
  return useQuery({
    queryKey: [`live-server-${id}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/updata/${id}`,
        headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
      }).then(
        (response) => {
          return response;
        },
        (error) => {
          return error;
        }
      );

      return data;
    },
    // Since we're getting updates with sockets,
    // no need to mark cache data as stale and refetch it.
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}
