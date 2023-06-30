import { LiveServer } from "../Models/liveServer.model";
import { Cron, scheduledJobs } from "croner";
import { isUp, getSslDetails, hudServerData } from "./serverDetails";
import { Server } from "../Models/server.model";


// Create a cron job for a given URL, userid and server id.
// This job monitors the up status of the endpoint.
export const setupUrlCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id },
  });

  let jobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  console.log("JOB ARRAY: ", jobArray)

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-status-${id}`, " to job list.");
    let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
      let checkUp = await isUp(url);
      let currStatus = await LiveServer.findOne({
        where: { serverid: server?.id },
        attributes: ["sslStatus"],
        order: [["time", "DESC"]],
      });

      if (checkUp !== currStatus?.dataValues.status) {
        await LiveServer.create({
          status: checkUp,
          url: url,
          userid: userid,
          serverid: id,
          sslStatus: currStatus?.dataValues.sslStatus,
        });
      }
    });
    return job.isRunning();
  }
  return false;
};

// Create a cron job for a given SSL URL, userid and server id.
// This job monitors the SSL status of the endpoint.
export const setupSslCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id },
  });

  let jobName = `${server?.dataValues.url}-ssl-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-ssl-${id}`, " to job list.");
    // Checking SSL every 5 minutes.
    let job = Cron("* 5 * * * *", { name: jobName }, async () => {
      let checkSsl: any = await getSslDetails(url);

      // First we're going to update liveServer time series data,
      // if there's been changes.
      let currStatus = await LiveServer.findOne({
        where: { serverid: server?.id },
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
        let resp = await LiveServer.create({
          status: currStatus?.dataValues.status,
          url: url,
          userid: userid,
          serverid: id,
          sslStatus: checkSsl.errno ? false : checkSsl.valid.toString(),
        });
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


// Create a cron job for a given optional hud-server URL,
// userid and server id. This job monitors a hud-server endpoint.
export const setupOptionalCron = async (url: string, userid: number, id: number) => {
  let server = await Server.findOne({
    where: { id: id },
  });
  if(server?.dataValues.optionalUrl) {
    let jobName = `${server?.dataValues.optionalUrl}-optional-${server?.dataValues.id}`;
    let jobArray = scheduledJobs.map((elem) => elem.name);

    if (!jobArray.includes(jobName)) {
      console.log("Adding ", `${server?.dataValues.optionalUrl}-optional-${id}`, " to job list.");

      // TODO: Review how often we want to get this data for performance.
      let job = Cron("*/60 * * * * *", { name: jobName }, async () => {

        console.log("SERVER DATAVALS: ", server?.dataValues)

        let optionalServerData = server?.dataValues.optionalUrl ? await hudServerData(server?.dataValues.optionalUrl) : null;
        let currStatus = await LiveServer.findOne({
          where: { serverid: server?.id },
          attributes: ["status", "sslStatus", "diskUsed", "diskSize", "memUsage", "cpuUsage"],
          order: [["time", "DESC"]],
        });

        console.log("OPTIONAL SERVER DATA: ", optionalServerData)

        await LiveServer.create({
          status: currStatus?.status,
          url: url,
          userid: userid,
          serverid: id,
          sslStatus: currStatus?.dataValues.sslStatus,
          diskUsed: optionalServerData?.diskUsed ? optionalServerData?.diskUsed : -1,
          diskSize: optionalServerData?.diskSize ? optionalServerData?.diskSize : -1,
          memUsage: optionalServerData?.memUsage ? optionalServerData?.memUsage : -1,
          cpuUsage: optionalServerData?.cpuUsage ? optionalServerData?.cpuUsage : -1
        });

        await Server.update(
          {
            uptime: optionalServerData?.uptimeInHours ? optionalServerData?.uptimeInHours : -1,
            upgrades: optionalServerData?.upgrades ? optionalServerData?.upgrades : "empty",
          },
          { where: { id: id } }
        );

      });
      return job.isRunning();
    }
  }
  return false;
};

// Util to start all jobs for servers in postgres if
// those servers are not running.
export const startServerJobs = async () => {
  let servArr = await Server.findAll();
  servArr.map(async (server) => {
    let { url, userid, id, optionalUrl } = server;

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
      let checkSsl: any = await getSslDetails(url);
      let optionalData: any = optionalUrl ? await hudServerData(optionalUrl) : null;

      console.log("OPTAIONAL DATA: ", optionalData)

      await LiveServer.create({
        status: checkUp,
        url: url,
        userid: userid,
        serverid: id,
        sslStatus: checkSsl.errno ? false : checkSsl.valid.toString(),
        diskUsed: optionalData?.diskUsed ? optionalData.diskUsed : -1,
        diskSize: optionalData?.diskSize ? optionalData.diskSize : -1,
        memUsage: optionalData?.memUsage ? optionalData.memUsage : -1,
        cpuUsage: optionalData?.cpuUsage ? optionalData.cpuUsage : -1
      });
    }

    setupUrlCron(url, userid, id);
    setupSslCron(url, userid, id);
    setupOptionalCron(url, userid, id);
  });
};
