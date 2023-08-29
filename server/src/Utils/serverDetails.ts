import sslChecker from "ssl-checker";
import axios from "axios";
import { ITrackOptions } from "../types";
const isReachable = require("is-reachable");

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
    return await sslChecker(fixedUrl);
  } catch (err: any) {
    // Forcing this to return an error message to avoid crashing
    // when a string message is returned. We expect errno nad the
    // current lib (sslChecker) isn't always providing one.
    return { errno: err.message };
  }
};

const hudServerLogin = async (url: string) => {
  console.log("HUD SERVER LOGIN URL: ", url);

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

  if (process.env.HUD_SSL === "true") {
    // Make sure we have http or https prepended.
    if (!url.startsWith("https://")) {
      url = url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      url = "https://" + url;
    }
  }

  let jwt = await hudServerLogin(`${url}/api/login`);

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
    console.log("HUD SERVER ERROR: ", err);
    return err;
  }
};

export const hudServerDisk = async (url: string) => {
  let jwt = await hudServerLogin(`${url}/api/login`);

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
    console.log("HUD SERVER ERROR: ", err);
    return err;
  }
};

export const hudServerResources = async (url: string) => {
  let jwt = await hudServerLogin(`${url}/api/login`);

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
    console.log("HUD SERVER ERROR: ", err);
    return err;
  }
};

export const hudServerUpgrades = async (url: string) => {
  let jwt = await hudServerLogin(`${url}/api/login`);

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
    console.log("HUD SERVER ERROR: ", err);
    return err;
  }
};

export const getHudSelectedData = async (
  optionalUrl: string,
  trackOptions: ITrackOptions
) => {
  if (
    trackOptions &&
    trackOptions.trackDisk &&
    trackOptions.trackResources &&
    trackOptions.trackUpgrades
  ) {
    const hudData = optionalUrl ? await hudServerData(optionalUrl) : null;
    return hudData;
  }

  let combinedRes = {};

  if (trackOptions && trackOptions.trackDisk) {
    const diskData = optionalUrl ? await hudServerDisk(optionalUrl) : null;
    combinedRes = { ...combinedRes, ...diskData };
  }

  if (trackOptions && trackOptions.trackResources) {
    const resourcesData = optionalUrl
      ? await hudServerResources(optionalUrl)
      : null;
    combinedRes = { ...combinedRes, ...resourcesData };
  }

  if (trackOptions && trackOptions.trackUpgrades) {
    const upgradeData = optionalUrl
      ? await hudServerResources(optionalUrl)
      : null;
    combinedRes = { ...combinedRes, ...upgradeData };
  }

  return combinedRes;
};
