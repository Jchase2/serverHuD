import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { getUserId } from "../../shared/utils";
import { queryClient } from "../socket";

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
      });
      return data;
    },
    onError: (error: any) => error,
    // Since we're getting updates with sockets,
    // no need to mark cache data as stale and refetch it.
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

export function useGetServers() {
  const userId = getUserId();
  return useQuery({
    queryKey: [`server-list-${userId}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + "/servers",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    onError: (error: any) => {
      console.log("ERROR RESPONSE: ", error.response)
      return error;
    }
  });
}

export function useGetUpData(id: string) {
  return useQuery({
    queryKey: [`live-server-${id}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/updata/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    onError: (error: any) => error.response,
    // Since we're getting updates with sockets,
    // no need to mark cache data as stale and refetch it.
    staleTime: Infinity,
    cacheTime: Infinity,
  });
}

export function useDeleteServer(id: string) {
  const userId = getUserId();
  return useMutation({
    mutationFn: async () => {
      let { data } = await axios({
        method: "put",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/delete/${id}`,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    // After deleting the server, we'll want to invalidate that in the cache
    // so the ui updates.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`server-${id}`] });
      return queryClient.invalidateQueries({
        queryKey: [`server-list-${userId}`],
      });
    },
    onError: (error: any) => error.response
  });
}

export function useAddServer() {
  const userId = getUserId();
  return useMutation({
    mutationFn: async (newServer: any) => {
      let { data } = await axios({
        method: "post",
        url: process.env.REACT_APP_BACKEND_URL + "/servers",
        data: newServer,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return data;
    },
    // After adding the server, we'll want to invalidate that in the cache
    // so the ui updates.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`server-list-${userId}`] });
    },
    onError: (error: any) => error.response
  });
}


// Create a new user.
export function useCreateUser() {
  return useMutation({
    mutationFn: async (registerObj: object) => {
      let { data } = await axios({
        method: "post",
        url: process.env.REACT_APP_BACKEND_URL + "/register",
        data: registerObj,
      });
      return data;
    },
    onError: (error: any) => error.response
  });
}
