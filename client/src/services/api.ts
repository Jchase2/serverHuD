import axios from "axios";

export const loginFunc = async (loginObj: object) => {
  let result = await axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + '/login',
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
  axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + '/register',
    data: registerObj,
  }).then(
    (response) => {
      console.log(response);
    },
    (error) => {
      console.log(error);
    }
  );
};
