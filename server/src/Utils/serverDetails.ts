import sslChecker from "ssl-checker";
import axios from "axios";
import { ITrackOptions } from "../types";
const isReachable = require("is-reachable");
import { ExtensionServer } from "../Models/extensionServer.model";
import { verifyToken } from "./jwt";


export const isUp = async (hostname: string) => {
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  let res = await isReachable(fixedUrl);
  if (res) return "up";
  else return "down";
};

export const getSslDetails = async (hostname: string) => {
  // Strip the beginning and end off of a url.
  let fixedUrl = hostname.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
  fixedUrl = fixedUrl.replace(/\/[^/]*$/, "");
  try {
    const test = await sslChecker(fixedUrl);
    return test
  } catch (err: any) {
    // Forcing this to return an error message to avoid crashing
    // when a string message is returned. We expect errno nad the
    // current lib (sslChecker) isn't always providing one.
    console.log("GET SSL ERROR IS: ", err)
    return { errno: err.message };
  }
};

export const getHttpStatusCode = async (url: string) => {
  try {
    let resp = await axios({
      method: "get",
      url: url,
    });
    return resp.status;
  } catch (err: any) {
    if(err?.response && err.response.status) {
      return err.response.status
    }
    console.log("Failed to get http status code: ", err);
    return -1;
  }
}

const extensionServerLogin = async (url: string, userid: number) => {

  // Check if we already have a valid JWT or if we need to login again.
  let extensionServerJwt = await ExtensionServer.findOne({
    where: { optionalUrl: url, userid: userid },
    attributes: ["jwt"]
  })

  const expCheck = verifyToken(extensionServerJwt?.dataValues.jwt)

  if(extensionServerJwt?.dataValues.jwt && expCheck !== false) {
    return extensionServerJwt?.dataValues.jwt;
  }

  // Login
  try {
    let resp = await axios.post(`${url}/api/login`, {
      Key: process.env.SECRET_KEY,
    });

    await ExtensionServer.update({
      jwt: resp.data
    }, {
      where: {
        userid: userid,
        optionalUrl: url
      }
    })

    return resp.data;
  } catch (err) {
    console.log("ERROR LOGGING IN: ", err);
    return err
  }
};

export const extensionServerData = async (url: string, userid: number) => {
  if (process.env.EXT_SERVER_SSL === "true") {
    // Make sure we have http or https prepended.
    if (!url.startsWith("https://")) {
      url = url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      url = "https://" + url;
    }
  } else {
    if(url.startsWith('https://')) {
      url = url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      url = "http://" + url;
    }
  }

  let jwt = await extensionServerLogin(url, userid);

  try {
    let resp = await axios({
      method: "get",
      url: `${url}/api/serverinfo`,
      headers: {
        Authorization: jwt,
      },
    });

    return resp.data;
  } catch (err) {
    console.log("EXTENSION SERVER ERROR: ", err);
    return err;
  }
};

export const extensionServerDisk = async (url: string, userid: number) => {

  let jwt = await extensionServerLogin(url, userid);

  try {
    let resp = await axios({
      method: "get",
      url: `${url}/api/serverinfo/disk`,
      headers: {
        Authorization: jwt,
      },
    });
    return resp.data;
  } catch (err) {
    console.log("EXTENSION SERVER ERROR: ", err);
    return err;
  }
};

export const extensionServerResources = async (url: string, userid: number) => {

  let jwt = await extensionServerLogin(url, userid);

  try {
    let resp = await axios({
      method: "get",
      url: `${url}/api/serverinfo/resources`,
      headers: {
        Authorization: jwt,
      },
    });
    return resp.data;
  } catch (err) {
    console.log("EXTENSION SERVER ERROR: ", err);
    return err;
  }
};

export const extensionServerUpgrades = async (url: string, userid: number) => {

  let jwt = await extensionServerLogin(url, userid);

  try {
    let resp = await axios({
      method: "get",
      url: `${url}/api/serverinfo/upgrades`,
      headers: {
        Authorization: jwt,
      },
    });
    return resp.data;
  } catch (err) {
    console.log("EXTENSION SERVER ERROR: ", err);
    return err;
  }
};

export const extensionServerSmart = async (url: string, userid: number) => {

  let jwt = await extensionServerLogin(url, userid);

  try {
    let resp = await axios({
      method: "get",
      url: `${url}/api/serverinfo/smart`,
      headers: {
        Authorization: jwt,
      },
    });
    return resp.data;
  } catch (err) {
    console.log("EXTENSION SERVER ERROR: ", err);
    return err;
  }
};

export const getExtSelectedData = async (
  optionalUrl: string,
  trackOptions: ITrackOptions,
  userid: number
) => {
  try {
    if (
      trackOptions &&
      trackOptions.trackDisk &&
      trackOptions.trackResources &&
      trackOptions.trackUpgrades &&
      trackOptions.trackSmart
    ) {
      const extensionData = optionalUrl ? await extensionServerData(optionalUrl, userid) : null;
      return extensionData;
    }

    let combinedRes = {};

    if (trackOptions && trackOptions.trackDisk) {
      const diskData = optionalUrl ? await extensionServerDisk(optionalUrl, userid) : null;
      combinedRes = { ...combinedRes, ...diskData };
    }

    if (trackOptions && trackOptions.trackResources) {
      const resourcesData = optionalUrl
        ? await extensionServerResources(optionalUrl, userid)
        : null;
      combinedRes = { ...combinedRes, ...resourcesData };
    }

    if (trackOptions && trackOptions.trackUpgrades) {
      const upgradeData = optionalUrl
        ? await extensionServerUpgrades(optionalUrl, userid)
        : null;
      combinedRes = { ...combinedRes, ...upgradeData };
    }

    if (trackOptions && trackOptions.trackSmart) {
      const smartData = optionalUrl ? await extensionServerSmart(optionalUrl, userid) : null;
      combinedRes = { ...combinedRes, ...smartData };
    }

    return combinedRes;
  } catch (err) {
    console.log("ERROR IN getExtSelectedData", err);
    return err
  }
};
