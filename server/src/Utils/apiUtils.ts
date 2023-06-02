import dayjs from "dayjs";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";

export const getAllCombinedState = async (userid: any) => {
  const serverList = await Server.findAll({
    where: { userid: userid },
  });

  let combinedData = serverList.map(async (server) => {
    let res = await LiveServer.findOne({
      where: { serverid: server.id, userid: userid },
      attributes: ["status", "sslStatus"],
      order: [["time", "DESC"]],
    });
    Object.assign(server.dataValues, res?.dataValues);
    return server;
  });

  return await Promise.all(combinedData);
};

export const getOneCombinedState = async (serverid: number, userid: number) => {
  const server = await Server.findOne({
    where: { id: serverid, userid: userid },
  });
  let res = await LiveServer.findOne({
    where: { serverid: serverid, userid: userid },
    attributes: ["status", "sslStatus"],
    order: [["time", "DESC"]],
  });
  Object.assign(server?.dataValues, res?.dataValues);
  return server;
};

export const SplitTime = (numberOfHours: number) => {
  var Days = Math.floor(numberOfHours / 24);
  var Remainder = numberOfHours % 24;
  var Hours = Math.floor(Remainder);
  return { Days: Days, Hours: Hours };
};

export const getMonitoredUpInfo = async (id: number, userid: number) => {
  let res = await LiveServer.findAll({
    where: {
      serverid: id,
      userid: userid
    },
    attributes: ["time", "status"],
    raw: true,
  });

  let totalUptime = res.reduce((acc: any, curr: any, ind: number) => {
    if (
      curr.status === "up" &&
      res[ind + 1] &&
      res[ind + 1].status === "down"
    ) {
      let difference = dayjs(res[ind + 1].time).diff(
        dayjs(curr.time),
        "seconds"
      );
      return acc + difference;
    } else if (curr.status === "up" && !res[ind + 1]) {
      let difference = dayjs(Date.now()).diff(dayjs(curr.time), "seconds");
      return acc + difference;
    }
    return acc;
  }, 0);

  let totalDowntime = res.reduce((acc: any, curr: any, ind: number) => {
    if (
      curr.status === "down" &&
      res[ind + 1] &&
      res[ind + 1].status === "up"
    ) {
      let difference = dayjs(res[ind + 1].time).diff(
        dayjs(curr.time),
        "seconds"
      );
      return acc + difference;
    } else if (curr.status === "down" && !res[ind + 1]) {
      let difference = dayjs(Date.now()).diff(dayjs(curr.time), "seconds");
      return acc + difference;
    }
    return acc;
  }, 0);

  let getTotalMonitoringTime = dayjs(Date.now()).diff(
    dayjs(res[0].time),
    "seconds"
  );
  let percentageUp = Number(
    ((totalUptime / getTotalMonitoringTime) * 100).toFixed(2)
  );
  let percentageDown = Number(
    ((totalDowntime / getTotalMonitoringTime) * 100).toFixed(2)
  );

  return {
    uptime: totalUptime,
    downtime: totalDowntime,
    percentageUp: percentageUp,
    percentageDown: percentageDown,
  };
};
