import axios from "axios";

export const loginFunc = async (loginObj: object) => {
  let result = await axios({
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
  return result;
};

export const registerFunc = async (registerObj: object) => {
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "/register",
    data: registerObj,
  }).then(
    (response) => {
      return response.status
    },
    (error) => {
      return error.request.status
    }
  );
};

export const postServer = async (newServer: object) => {
  console.log("newServer: ", newServer)
  return axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + "/servers",
    data: newServer,
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  }).then(
    (response) => {
      return response;
    },
    (error) => {
      console.log(error.message)
      return error;
    }
  );
};

export const getServers = async () => {
  return axios({
    method: "get",
    url: process.env.REACT_APP_BACKEND_URL + "/servers",
    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
  }).then(
    (response) => {
      return response
    },
    (error) => {
      return error
    }
  );
};
