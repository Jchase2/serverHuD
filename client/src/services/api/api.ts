import { useMutation, useQuery } from "@tanstack/react-query";
import axios, { AxiosError, AxiosResponse } from "axios";
import { getUserId } from "../../shared/utils";
import { queryClient } from "../socket";
import { IAddServer, IData, IUpdateServer } from "../../types";

export function useGetIndServer(id: number) {
  return useQuery({
    queryKey: [`server-${id}`],
    queryFn: async () => {
      const { data }: { data: IData} = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + `/servers/${id}`,
        withCredentials: true,
      });
      return data;
    },
    onError: (error: AxiosError) => error,
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
      const { data }: { data: IData[] } = await axios({
        method: "get",
        url: process.env.REACT_APP_BACKEND_URL + "/servers",
        withCredentials: true,
      });
      return data;
    },
    onError: (error: AxiosError) => error,
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
    onError: (error: AxiosError) => error,
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
    onError: (error: AxiosError) => error,
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
    onError: (error: AxiosError) => error,
  });
}

export function useAddServer() {
  const userId = getUserId();
  return useMutation({
    mutationFn: async (newServer: IAddServer) => {
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
    onError: (error: AxiosError) => error,
  });
}

export function useUpdateServer(id: number) {
  const userId = getUserId();
  const mutation = useMutation({
    mutationFn: async (newData: IUpdateServer) => {
      const data: AxiosResponse<IData> = await axios({
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
    onError: (error: AxiosError) => {
      console.log("ERROR IS: ", JSON.stringify(error));
      return error;
    },
  });

  return mutation;
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
    onError: (error: AxiosError) => error,
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
    onError: (error: AxiosError) => error,
  });
}
