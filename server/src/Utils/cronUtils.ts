import { LiveServer } from "../Models/liveServer.model";
import { Cron, scheduledJobs } from "croner";
import { isUp } from "./serverDetails";
import { Server } from "../Models/server.model";

export const setupUrlCron = async (
  name: string,
  url: string,
  userid: number,
  id: number
) => {
  let server = await Server.findOne({
    where: { id: id },
  });

  let jobName = `${server?.dataValues.url}-${server?.dataValues.id}`;
  let jobArray = scheduledJobs.map((elem) => elem.name);

  if (!jobArray.includes(jobName)) {
    console.log("Adding ", `${url}-${id}`, " to job list.");
    let job = Cron("*/60 * * * * *", { name: name }, async () => {
      let checkUp = await isUp(url);
      let currStatus = await LiveServer.findOne({
        attributes: ["status"],
        where: {
          serverid: server?.id,
        },
      });
      if (checkUp != currStatus?.dataValues.status) {
        let resp = await LiveServer.create({
          status: checkUp,
          url: url,
          time: Date.now(),
          userid: userid,
          serverid: id,
        });
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
    let jobName = `${server?.dataValues.url}-${server?.dataValues.id}`;
    let jobArray = scheduledJobs.map((elem) => elem.name);
    if (!jobArray.includes(jobName)) {
      console.log("Adding ", `${server.url}-${server.id}`, " to job list.");
      let job = Cron("*/60 * * * * *", { name: jobName }, async () => {
        let currStatus = await LiveServer.findOne({
          attributes: ["status"],
          where: {
            serverid: server.id,
          },
        });
        let checkUp = await isUp(server.url);
        if (checkUp != currStatus?.dataValues.status) {
          let resp = await LiveServer.create({
            status: checkUp,
            url: server.url,
            time: Date.now(),
            userid: server.userid,
            serverid: server.id,
          });
        }
      });
      console.log(
        "Created job process " + jobName + " which is running?: ",
        job.isRunning()
      );
    }
  });
};
