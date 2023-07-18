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
        withCredentials: true,
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
        withCredentials: true,
      });
      return data;
    },
    onError: (error: any) => {
      console.log("ERROR RESPONSE: ", error.response);
      return error;
    },
  });
}

export function useGetUpData(id: string) {
  return useQuery({
    queryKey: [`live-server-${id}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/updata/${id}`,
        withCredentials: true,
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

export function useGetServerUsage(id: string) {
  return useQuery({
    queryKey: [`server-usage-${id}`],
    queryFn: async () => {
      const { data } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/usage/${id}`,
        withCredentials: true,
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

export const verifyUser = async () => {
  const { data } = await axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + `/user/me`,
    withCredentials: true,
  });

  return data;
};

export const userLogout = async () => {
  const resp = await axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + `/user/logout`,
    withCredentials: true,
  });
  return resp;
};

export function useDeleteServer(id: string) {
  const userId = getUserId();
  return useMutation({
    mutationFn: async () => {
      let { data } = await axios({
        method: "put",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/delete/${id}`,
        withCredentials: true,
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
    onError: (error: any) => error.response,
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
        withCredentials: true,
      });
      return data;
    },
    // After adding the server, we'll want to invalidate that in the cache
    // so the ui updates.
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`server-list-${userId}`] });
    },
    onError: (error: any) => error.response,
  });
}

export function useUpdateServer(id: string) {
  const userId = getUserId();
  return useMutation({
    mutationFn: async (newData: any) => {
      let { data } = await axios({
        method: "put",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/update/${id}`,
        data: newData,
        withCredentials: true,
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
    onError: (error: any) => error.response,
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
        withCredentials: true,
      });
      return data;
    },
    onError: (error: any) => error.response,
  });
}

export function useLogin() {
  return useMutation({
    mutationFn: async (loginObj: object) => {
      let { data } = await axios({
        method: "post",
        url: process.env.REACT_APP_BACKEND_URL + "/login",
        data: loginObj,
        withCredentials: true,
      });
      return data;
    },
    onError: (error: any) => error.response,
  });
}
