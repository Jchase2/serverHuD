import { LiveServer } from "../Models/liveServer.model";
import { Cron, scheduledJobs } from "croner";
import { isUp, getSslDetails } from "./serverDetails";
import { Server } from "../Models/server.model";

export const setupUrlCron = async (
  url: string,
  userid: number,
  id: number
) => {
  let server = await Server.findOne({
    where: { id: id },
  });

  let jobName = `${server?.dataValues.url}-status-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-status-${id}`, " to job list.");
    let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
      let checkUp = await isUp(url);
      let currStatus = await LiveServer.findOne({
        attributes: ["status", "sslStatus"],
        where: {
          serverid: server?.id,
        },
      });
      if (checkUp != currStatus?.dataValues.status) {
        let resp = await LiveServer.create({
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

export const setupSslCron = async (
  url: string,
  userid: number,
  id: number
) => {
  let server = await Server.findOne({
    where: { id: id },
  });

  let jobName = `${server?.dataValues.url}-ssl-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-ssl-${id}`, " to job list.");
    // TODO: Change this from 60 seconds to 5 minutes.
    // No need to check SSL every minute.
    let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
      let checkSsl: any = await getSslDetails(url);

      console.log("CHECK SSL GIVES US: ", checkSsl);

      // First we're going to update liveServer time series data,
      // if there's been changes.
      let currStatus = await LiveServer.findOne({
        attributes: ["sslStatus", "status"],
        where: {
          serverid: server?.id,
        },
      });
      if (checkSsl?.valid?.toString() != currStatus?.dataValues.sslStatus) {
        let resp = await LiveServer.create({
          status: currStatus?.dataValues.status,
          url: url,
          userid: userid,
          serverid: id,
          sslStatus: checkSsl.errno ? false :  checkSsl.valid.toString(),
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
          { where: {id: id}, }
        );
      }
    });
    return job.isRunning();
  }
  return false;
};

// Write util to start all jobs for servers in postgres where
// those servers are not running.
export const startServerJobs = async () => {
  let servArr = await Server.findAll();
  servArr.forEach((server) => {
    let { name, url, userid, id} = server;
    setupUrlCron(url, userid, id);
    setupSslCron(url, userid, id);
  });
};
