import sslChecker from "ssl-checker";
import axios from "axios";
const sr = require("server-reachability");

export const getSslDetails = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  console.log("FixedURL: ", fixedUrl);
  return await sslChecker(fixedUrl);
};

export const isUp = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  console.log("fixedurl: ", fixedUrl);
  let res = await sr.isReachable(fixedUrl, 80);
  if (res) return "Up";
  else return "Down";
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
    }
  );
};
