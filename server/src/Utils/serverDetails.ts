import sslChecker from "ssl-checker";
import axios from "axios";
const sr = require("server-reachability");

export const isUp = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  let res = await sr.isReachable(fixedUrl, 80);
  if (res) return "up";
  else return "down";
};


export const getSslDetails = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  try {
    return await sslChecker(fixedUrl)
  } catch (err) {
    return err;
  }
};

export const hudServerData = async (url: string) => {
  return axios({
    method: "get",
    url: url,
  }).then(
    (response) => {
      return response.data;
    },
    (error) => {
      console.log("hudServerFetch error: ", error);
      return error;
    }
  );
};
