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