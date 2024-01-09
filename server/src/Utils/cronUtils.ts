import { LiveServer } from "../Models/liveServer.model";
import { Cron, scheduledJobs } from "croner";
import {
  isUp,
  getSslDetails,
  extensionServerData,
  getExtSelectedData,
} from "./serverDetails";
import { Server } from "../Models/server.model";
import { IResolvedValues } from "../types";
import { ExtensionServer } from "../Models/extensionServer.model";
import { sendUpdate } from "./nodemailer";

interface ITimeConverter {
  [key: string]: string;
}

const timeConverter: ITimeConverter = {
  "10-seconds": "*/10 * * * * *",
  "30-seconds": "*/30 * * * * *",
  "1-minute": "*/60 * * * * *",
  "5-minutes": "*/5 * * * *",
};

export const setupGlobalCron = async (
  url: string,
  userid: number,
  id: number
) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  let jobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  console.log("JOB ARRAY: ", jobArray);

  if (!jobArray.includes(jobName)) {
    let job = Cron(
      `${timeConverter[server?.dataValues?.interval]}`,
      { name: jobName },
      async () => {
        if (server) {
          const urlData = await buildUrlData(url, userid, id, server);
          const sslData = await buildSslData(url, userid, id, server);
          const extensionData = await buildExtensionData(userid, id);

          await LiveServer.create({
            status: urlData?.status,
            url: urlData.url,
            userid: urlData.userid,
            serverid: urlData.serverid,
            sslStatus: sslData.sslStatus,
            diskData: extensionData?.diskData ? extensionData?.diskData : -1,
            memUsage: extensionData?.memUsage ? extensionData?.memUsage : 0,
            cpuUsage: extensionData?.cpuUsage ? extensionData?.cpuUsage : 0,
          });
        }
      }
    );
    return job.isRunning();
  }
};

export const updateGlobalCron = async (
  newUrl: string,
  userid: number,
  id: number
) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  let oldJobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;

  let oldJob;
  for (let obj of scheduledJobs) {
    if (obj.name === oldJobName) {
      oldJob = obj;
    }
  }

  // Get rid of the old job.
  if (oldJob) {
    console.log("Stopping job: ", oldJob?.name);
    oldJob.stop();
  }

  let res = await setupGlobalCron(newUrl, userid, id);
  return res;
};

export const buildUrlData = async (
  url: string,
  userid: number,
  id: number,
  server: Server
) => {
  let checkUp = await isUp(url);

  let currStatus = await LiveServer.findOne({
    where: { serverid: server?.id, userid: userid },
    attributes: ["status", "url"],
    order: [["time", "DESC"]],
  });

  if (
    server?.dataValues.emailNotifications &&
    checkUp !== currStatus?.dataValues.status
  ) {
    sendUpdate(
      `Status has changed to <b>${checkUp}</b> for domain ${currStatus?.dataValues.url}`
    );
  }

  return {
    status: checkUp,
    url: url,
    userid: userid,
    serverid: id,
  };
};

export const buildSslData = async (
  url: string,
  userid: number,
  id: number,
  server: any
) => {
  let checkSsl: IResolvedValues | any = await getSslDetails(url);
  let currStatus = await LiveServer.findOne({
    where: { serverid: server?.id, userid: userid },
    attributes: ["sslStatus", "url"],
    order: [["time", "DESC"]],
  });
  if (
    // if no ssl and we're not storing false
    (checkSsl.errno && currStatus?.dataValues.sslStatus !== "false") ||
    (checkSsl.valid &&
      // or if result of ssl isn't equal to stored ssl status
      checkSsl?.valid?.toString() !== currStatus?.dataValues.sslStatus)
  ) {
    if (server?.dataValues.emailNotifications) {
      sendUpdate(
        `SSL Status has changed to <b>${
          checkSsl.errno ? "Down" : checkSsl.valid.toString()
        }</b> for domain ${url}`
      );
    }
  }

  // Next, since SSL expiry isn't time series data, we also
  // have to check in the Server table to see if we need to
  // update that.
  let sslExpRes = await Server.findOne({
    where: { id: id },
    attributes: ["sslExpiry"],
  });

  if (checkSsl.daysRemaining !== sslExpRes?.dataValues.sslExpiry) {
    Server.update(
      {
        sslExpiry: checkSsl.daysRemaining,
      },
      { where: { id: id } }
    );
  }

  return { sslStatus: checkSsl.errno ? false : checkSsl.valid.toString() };
};

export const buildExtensionData = async (userid: number, id: number) => {
  let extensionServerBe = await ExtensionServer.findOne({
    where: { serverid: id, userid: userid },
  });

  let optionalServerData =
    extensionServerBe?.dataValues.optionalUrl &&
    extensionServerBe?.dataValues.trackOptions
      ? await getExtSelectedData(
          extensionServerBe?.dataValues.optionalUrl,
          extensionServerBe?.dataValues.trackOptions,
          userid
        )
      : null;

  if (optionalServerData?.errno) {
    console.log(
      "Problem with extension server, error: ",
      optionalServerData.code
    );
    return;
  }

  await ExtensionServer.update(
    {
      uptime: optionalServerData?.uptimeInHours
        ? optionalServerData?.uptimeInHours
        : 0,
      upgrades: optionalServerData?.upgrades
        ? optionalServerData?.upgrades
        : "empty",
      smart: optionalServerData?.smart ? optionalServerData?.smart : [""],
    },
    { where: { serverid: id, userid: userid } }
  );

  return {
    diskData: optionalServerData?.diskData ? optionalServerData?.diskData : -1,
    memUsage: optionalServerData?.memUsage ? optionalServerData?.memUsage : 0,
    cpuUsage: optionalServerData?.cpuUsage ? optionalServerData?.cpuUsage : 0,
  };
};

// Util to start all jobs for servers in postgres if
// those servers are not running.
export const startServerJobs = async () => {
  let servArr = await Server.findAll();
  servArr.map(async (server) => {
    let { url, userid, id } = server;

    // Grab the last status of this server.
    let currStatus = await LiveServer.findOne({
      where: { serverid: id },
      attributes: ["status", "sslStatus"],
      order: [["time", "DESC"]],
    });

    // If currStatus is null, we'll insert immediately.
    // This way we immediately have some data to work with.
    if (currStatus === null) {
      const urlData = await buildUrlData(url, userid, id, server);
      const sslData = await buildSslData(url, userid, id, server);
      const extensionData = await buildExtensionData(userid, id);
      await LiveServer.create({
        status: urlData?.status,
        url: urlData.url,
        userid: urlData.userid,
        serverid: urlData.serverid,
        sslStatus: sslData.sslStatus,
        diskData: extensionData?.diskData ? extensionData?.diskData : -1,
        memUsage: extensionData?.memUsage ? extensionData?.memUsage : 0,
        cpuUsage: extensionData?.cpuUsage ? extensionData?.cpuUsage : 0,
      });
    }

    setupGlobalCron(url, userid, id);
  });
};
