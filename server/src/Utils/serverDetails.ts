import sslChecker from "ssl-checker";
import axios from "axios";
import prependHttp from "prepend-http";
const isReachable = require("is-reachable");

export const isUp = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  console.log("ISUP FIXED: ", fixedUrl);
  let res = await isReachable(fixedUrl);
  if (res) return "up";
  else return "down";
};

export const getSslDetails = async (hostname: string) => {
  // Strip the beginning and end off of a url.
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  fixedUrl = fixedUrl.replace(/\/[^/]*$/, '');
  try {
    return await sslChecker(fixedUrl);
  } catch (err: any) {
    // Forcing this to return an error message to avoid crashing
    // when a string message is returned. We expect errno nad the
    // current lib (sslChecker) isn't always providing one.
    return { errno: err.message };
  }
};

const hudServerLogin = async (url: string) => {
  try {
    let resp = await axios.post(url, {
      Key: process.env.SECRET_KEY,
    });
    return resp.data;
  } catch (err) {
    console.log("ERROR LOGGING IN: ", err);
  }
};

export const hudServerData = async (url: string) => {
  let jwt = await hudServerLogin(
    prependHttp(`${url}/api/login`, { https: false })
  );

  try {
    let resp = await axios({
      method: "get",
      url: prependHttp(`${url}/api/serverinfo`, { https: false }),
      headers: {
        Authorization: jwt,
      },
    });

    return resp.data;
  } catch (err) {
    console.log("HUD SERVER ERROR: ", err);
    return err;
  }
};
