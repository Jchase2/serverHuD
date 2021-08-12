import axios from "axios";

export const loginFunc = async (loginObj: object) => {
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "/login",
    data: loginObj,
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      return error;
    }
  );
};

export const registerFunc = async (registerObj: object) => {
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "/register",
    data: registerObj,
  }).then(
    (response) => {
      return response.status;
    },
    (error) => {
      return error.request.status;
    }
  );
};

export const postServer = async (newServer: any) => {
  if (newServer.url.substr(0, 7) !== "http://") {
    newServer.url = 'http://' + newServer.url;
  }
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "/servers",
    data: newServer,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error.message);
      return error;
    }
  );
};

export const getServers = async () => {
  return axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + "/servers",
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      return error;
    }
  );
};

export const getIndServer = async (id: string) => {
  return axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + `/servers/${id}`,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      return error;
    }
  );
};

export const deleteServer = async (id: string) => {
  return axios({
    method: "put",
    url: process.env.REACT_APP_BACKEND_URL + `/servers/delete/${id}`,
    headers: { Authorization: `Bearer ${localStorage.getItem("accessToken")}` },
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      return error;
    }
  );
};