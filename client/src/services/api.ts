import axios from "axios";

export const sendRegistration = () => {};

export const loginFunc = async (loginObj: object) => {
  console.log(process.env.REACT_APP_BACKEND_URL)
  axios({
    method: "post",
    url: process.env.REACT_APP_BACKEND_URL + '/register',
    data: loginObj,
  }).then(
    (response) => {
      console.log(response);
    },
    (error) => {
      console.log(error);
    }
  );
};
