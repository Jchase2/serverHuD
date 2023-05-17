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
      let resp = await LiveServer.create({
        up: checkUp,
        url: url,
        time: Date.now(),
        userid: userid,
        serverid: id,
      });
    });
    return job.isRunning();
  }
  return false;
};
