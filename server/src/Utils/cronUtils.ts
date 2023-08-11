import { LiveServer } from "../Models/liveServer.model";
import { Cron, scheduledJobs } from "croner";
import { isUp, getSslDetails, hudServerData, getHudSelectedData } from "./serverDetails";
import { Server } from "../Models/server.model";
import { IHudServerData, IResolvedValues } from "../types";
import { HudServer } from "../Models/hudServer.model";

// Create a cron job for a given URL, userid and server id.
// This job monitors the up status of the endpoint.
export const setupUrlCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  let jobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  console.log("JOB ARRAY: ", jobArray)

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-status-${id}`, " to job list.");
    let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
      let checkUp = await isUp(url);
      let currStatus = await LiveServer.findOne({
        where: { serverid: server?.id, userid: userid },
        attributes: ["status"],
        order: [["time", "DESC"]],
      });

      if (checkUp !== currStatus?.dataValues.status) {
        console.log("Up status has changed.")
        try {
          let hudServerBe = await HudServer.findOne({
            where: { serverid: id },
            attributes: ["optionalUrl"]
          })
          let optionalServerData = hudServerBe?.dataValues.optionalUrl ? await hudServerData(hudServerBe?.dataValues.optionalUrl) : null;
          await LiveServer.create({
            status: checkUp,
            url: url,
            userid: userid,
            serverid: id,
            sslStatus: currStatus?.dataValues.sslStatus,
            diskUsed: optionalServerData?.diskUsed ? optionalServerData?.diskUsed : -1,
            diskSize: optionalServerData?.diskSize ? optionalServerData?.diskSize : -1,
            memUsage: optionalServerData?.memUsage ? optionalServerData?.memUsage : 0,
            cpuUsage: optionalServerData?.cpuUsage ? optionalServerData?.cpuUsage : 0
          });
        } catch (err) {
          console.log("ERR UPDATING URL IN CRON: ", err)
          return;
        }
      }
    });
    return job.isRunning();
  }
  return false;
};

// Replaces cron job for server url with new url.
export const updateUrlCron = async (newUrl: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  let oldJobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;

  let oldJob;
  for(let obj of scheduledJobs) {
    if(obj.name === oldJobName) {
      oldJob = obj;
    }
  }

  // Get rid of the old job.
  if(oldJob) {
    console.log("Stopping job: ", oldJob?.name);
    oldJob.stop();
  }

  let res = await setupUrlCron(newUrl, userid, id);
  return res;
}

// Create a cron job for a given SSL URL, userid and server id.
// This job monitors the SSL status of the endpoint.
export const setupSslCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  let jobName = `${server?.dataValues.url}-ssl-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-ssl-${id}`, " to job list.");
    // Checking SSL every 5 minutes.
    let job = Cron("* 5 * * * *", { name: jobName }, async () => {
      let checkSsl: IResolvedValues | any = await getSslDetails(url);
      // First we're going to update liveServer time series data,
      // if there's been changes.
      let currStatus = await LiveServer.findOne({
        where: { serverid: server?.id, userid: userid },
        attributes: ["status", "sslStatus"],
        order: [["time", "DESC"]],
      });

      if (
        // if no ssl and we're not storing false
        (checkSsl.errno && currStatus?.dataValues.sslStatus !== "false") ||
        (checkSsl.valid &&
          // or if result of ssl isn't equal to stored ssl status
          checkSsl?.valid?.toString() !== currStatus?.dataValues.sslStatus)
      ) {
        try {
          let resp = await LiveServer.create({
            status: currStatus?.dataValues.status,
            url: url,
            userid: userid,
            serverid: id,
            sslStatus: checkSsl.errno ? false : checkSsl.valid.toString(),
          });
        } catch (err) {
          console.log("ERR UPDATING SSL IN CRON: ", err)
          return;
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
    });
    return job.isRunning();
  }
  return false;
};

// Replaces cron job for ssl with new url.
export const updateSslCron = async (newUrl: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid },
  });

  const oldJobName = `${server?.dataValues.url}-ssl-${server?.dataValues.id}`;

  let oldJob;
  for(let obj of scheduledJobs) {
    if(obj.name === oldJobName) {
      oldJob = obj;
    }
  }

  // Get rid of the old job.
  if(oldJob) {
    console.log("Stopping job: ", oldJob?.name);
    oldJob.stop();
  }

  let res = await setupSslCron(newUrl, userid, id);
  return res;
}

// Create a cron job for a given optional hud-server URL,
// userid and server id. This job monitors a hud-server endpoint.
export const setupOptionalCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id, userid: userid  },
  });

  let hudServerBe = await HudServer.findOne({
    where: { serverid: id }
  })

  if(hudServerBe?.dataValues.optionalUrl) {
    let jobName = `${hudServerBe?.dataValues.optionalUrl}-optional-${hudServerBe?.dataValues.serverid}`;
    let jobArray = scheduledJobs.map((elem) => elem.name);
    if (!jobArray.includes(jobName)) {
      console.log("Adding ", `${hudServerBe?.dataValues.optionalUrl}-optional-${id}`, " to job list.");

      // TODO: Review how often we want to get this data for performance.
      let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
        // TODO: Make sure optional server data isn't throwing an error
        let optionalServerData = (hudServerBe?.dataValues.optionalUrl && hudServerBe?.dataValues.trackOptions) ? await getHudSelectedData(hudServerBe?.dataValues.optionalUrl, hudServerBe?.dataValues.trackOptions) : null;

        let currStatus = await LiveServer.findOne({
          where: { serverid: server?.id },
          attributes: ["status", "sslStatus", "diskUsed", "diskSize", "memUsage", "cpuUsage"],
          order: [["time", "DESC"]],
        });

        await LiveServer.create({
          status: currStatus?.status,
          url: url,
          userid: userid,
          serverid: id,
          sslStatus: currStatus?.dataValues.sslStatus,
          diskUsed: optionalServerData?.diskUsed ? optionalServerData?.diskUsed : -1,
          diskSize: optionalServerData?.diskSize ? optionalServerData?.diskSize : -1,
          memUsage: optionalServerData?.memUsage ? optionalServerData?.memUsage : 0,
          cpuUsage: optionalServerData?.cpuUsage ? optionalServerData?.cpuUsage : 0
        });

        await HudServer.update(
          {
            uptime: optionalServerData?.uptimeInHours ? optionalServerData?.uptimeInHours : 0,
            upgrades: optionalServerData?.upgrades ? optionalServerData?.upgrades : "empty",
          },
          { where: { serverid: id } }
        );

      });
      return job.isRunning();
    }
  }
  return false;
};

// Replaces cron job for optional url with new url.
export const updateOptionalCron = async (newUrl: string, userid: number, id: number) => {

  let hudServer = await HudServer.findOne({
    where: { serverid: id },
  });

  const oldJobName = `${hudServer?.dataValues.optionalUrl}-optional-${id}`;

  let oldJob;
  for(let obj of scheduledJobs) {
    if(obj.name === oldJobName) {
      oldJob = obj;
    }
  }

  // Get rid of the old job.
  if(oldJob) {
    console.log("Stopping job: ", oldJob?.name);
    oldJob.stop();
  }

  let res = await setupOptionalCron(newUrl, userid, id);
  return res;
}

// Util to start all jobs for servers in postgres if
// those servers are not running.
export const startServerJobs = async () => {
  let servArr = await Server.findAll();
  servArr.map(async (server) => {
    let { url, userid, id } = server;

    let hudServerBe = await HudServer.findOne({
      where: {serverid: id }
    });

    let optionalUrl = hudServerBe?.dataValues.optionalUrl;

    // Grab the last status of this server.
    let currStatus = await LiveServer.findOne({
      where: { serverid: id },
      attributes: ["status", "sslStatus"],
      order: [["time", "DESC"]],
    });

    // If currStatus is null, we'll insert immediately.
    // This way we immediately have some data to work with.
    if (currStatus === null) {
      console.log("Creating first entry.");
      let checkUp = await isUp(url);
      let checkSsl: IResolvedValues | any = await getSslDetails(url);
      let optionalData: IHudServerData = optionalUrl ? await getHudSelectedData(hudServerBe?.dataValues.optionalUrl, hudServerBe?.dataValues.trackOptions) : null;

      await LiveServer.create({
        status: checkUp,
        url: url,
        userid: userid,
        serverid: id,
        sslStatus: checkSsl.errno ? false : checkSsl.valid.toString(),
        diskUsed: optionalData?.diskUsed ? optionalData.diskUsed : -1,
        diskSize: optionalData?.diskSize ? optionalData.diskSize : -1,
        memUsage: optionalData?.memUsage ? optionalData.memUsage : 0,
        cpuUsage: optionalData?.cpuUsage ? optionalData.cpuUsage : 0
      });
    }

    setupUrlCron(url, userid, id);
    setupSslCron(url, userid, id);
    setupOptionalCron(url, userid, id);
  });
};
