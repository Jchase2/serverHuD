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

const extensionServerLogin = async (url: string) => {
  console.log("EXTENSION SERVER LOGIN URL: ", url);

  try {
    let resp = await axios.post(url, {
      Key: process.env.SECRET_KEY,
    });
    return resp.data;
  } catch (err) {
    console.log("ERROR LOGGING IN: ", err);
    return err
  }
};

export const extensionServerData = async (url: string) => {
  if (process.env.EXT_SERVER_SSL === "true") {
    // Make sure we have http or https prepended.
    if (!url.startsWith("https://")) {
      url = url.replace(/^https?\:\/\//i, "").replace(/\/$/, "");
      url = "https://" + url;
    }
  }

  let jwt = await extensionServerLogin(`${url}/api/login`);

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

export const extensionServerDisk = async (url: string) => {
  let jwt = await extensionServerLogin(`${url}/api/login`);

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

export const extensionServerResources = async (url: string) => {
  let jwt = await extensionServerLogin(`${url}/api/login`);

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

export const extensionServerUpgrades = async (url: string) => {
  let jwt = await extensionServerLogin(`${url}/api/login`);

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

export const extensionServerSmart = async (url: string) => {
  let jwt = await extensionServerLogin(`${url}/api/login`);

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
  trackOptions: ITrackOptions
) => {
  try {
    if (
      trackOptions &&
      trackOptions.trackDisk &&
      trackOptions.trackResources &&
      trackOptions.trackUpgrades &&
      trackOptions.trackSmart
    ) {
      const extensionData = optionalUrl ? await extensionServerData(optionalUrl) : null;
      return extensionData;
    }

    let combinedRes = {};

    if (trackOptions && trackOptions.trackDisk) {
      const diskData = optionalUrl ? await extensionServerDisk(optionalUrl) : null;
      combinedRes = { ...combinedRes, ...diskData };
    }

    if (trackOptions && trackOptions.trackResources) {
      const resourcesData = optionalUrl
        ? await extensionServerResources(optionalUrl)
        : null;
      combinedRes = { ...combinedRes, ...resourcesData };
    }

    if (trackOptions && trackOptions.trackUpgrades) {
      const upgradeData = optionalUrl
        ? await extensionServerUpgrades(optionalUrl)
        : null;
      combinedRes = { ...combinedRes, ...upgradeData };
    }

    if (trackOptions && trackOptions.trackSmart) {
      const smartData = optionalUrl ? await extensionServerSmart(optionalUrl) : null;
      combinedRes = { ...combinedRes, ...smartData };
      console.log("SMART DATA IS: ", smartData);
    }

    return combinedRes;
  } catch (err) {
    console.log("ERROR IN getExtSelectedData", err);
    return err
  }
};
