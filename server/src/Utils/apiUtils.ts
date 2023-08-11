import dayjs from "dayjs";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { Op } from "sequelize";
import { HudServer } from "../Models/hudServer.model";

interface ICombinedData {
  avgMem: number;
  avgCpu: number;
}

export const getAllCombinedState = async (userid: number) => {

  try {
    const serverList = await Server.findAll({
      where: { userid: userid },
    });

    let combinedData = serverList.map(async (server) => {
      const hudData = await HudServer.findOne({
        where: { serverid: server.id },
        attributes: [
          "optionalUrl",
          "upgrades",
          "uptime",
          "trackOptions"
        ],
      });

      let res = await LiveServer.findOne({
        where: { serverid: server.id, userid: userid },
        attributes: [
          "status",
          "sslStatus",
          "diskUsed",
          "diskSize",
          "memUsage",
          "cpuUsage",
        ],
        order: [["time", "DESC"]],
      });
      Object.assign(server.dataValues, res?.dataValues);
      if (hudData?.dataValues) Object.assign(server.dataValues, hudData?.dataValues);
      return server;
    });

    return await Promise.all(combinedData);
  } catch (err) {
    console.log("ERROR FROM GET ALL COMBINED STATES: ", err)
  }
};

export const getOneCombinedState = async (serverid: number, userid: number) => {
  try {
    const server = await Server.findOne({
      where: { id: serverid, userid: userid },
    });

    const hudServerData = await HudServer.findOne({
      where: { serverid: serverid },
      attributes: [
        "optionalUrl",
        "upgrades",
        "uptime",
        "trackOptions"
      ]
    })

    if (!server) {
      return null;
    }

    let res = await LiveServer.findOne({
      where: { serverid: serverid, userid: userid },
      attributes: [
        "status",
        "sslStatus",
        "diskUsed",
        "diskSize",
        "memUsage",
        "cpuUsage",
      ],
      order: [["time", "DESC"]],
    });
    // Make sure we're returning -1 if we don't have these values.
    if (res && res.dataValues) {
      res.dataValues.diskSize = res.dataValues.diskSize
        ? res.dataValues.diskSize
        : -1;
      res.dataValues.diskUsed = res.dataValues.diskUsed
        ? res.dataValues.diskUsed
        : -1;
      res.dataValues.memUsage = res.dataValues.memUsage
        ? res.dataValues.memUsage
        : 0;
      res.dataValues.cpuUsage = res.dataValues.cpuUsage
        ? res.dataValues.cpuUsage
        : 0;
    }
    
    Object.assign(server?.dataValues, res?.dataValues);
    server.dataValues.trackOptions = hudServerData?.dataValues.trackOptions;
    server.dataValues.optionalUrl =  hudServerData?.dataValues.optionalUrl;
    server.dataValues.upgrades = hudServerData?.dataValues.upgrades;
    server.dataValues.uptime = hudServerData?.dataValues.uptime

    return server;
  } catch (err) {
    console.log("Combined State Error: ", err);
    return err;
  }
};

export const SplitTime = (numberOfHours: number) => {
  var Days = Math.floor(numberOfHours / 24);
  var Remainder = numberOfHours % 24;
  var Hours = Math.floor(Remainder);
  return { Days: Days, Hours: Hours };
};

// Calculates %up and %down from recorded data on a server.
// TODO: This probably needs refactored a lot.
export const getMonitoredUpInfo = async (id: number, userid: number) => {
  // Get all data, oldest first, where serverid and userid
  // are as specified.
  let res = await LiveServer.findAll({
    where: {
      serverid: id,
      userid: userid,
    },
    order: [["time", "ASC"]],
    attributes: ["time", "status", "diskSize", "diskUsed"],
    raw: true,
  });

  const latestDiskSize = res[res.length - 1]?.diskSize
    ? res[res.length - 1]?.diskSize
    : -1;
  const latestDiskUsed = res[res.length - 1]?.diskSize
    ? res[res.length - 1]?.diskSize
    : -1;

  let currStatus: string | null = null;
  let diffArr: LiveServer[] = [];
  res.forEach((elem) => {
    if (elem.status != currStatus) {
      diffArr.push(elem);
      currStatus = elem.status;
    }
  });

  let totalUptime = diffArr.reduce(
    (acc: number, curr: LiveServer, ind: number) => {
      // If current status i up and the next index is down, calculate the difference
      // and add that to the accumulator.

      if (
        curr.status === "up" &&
        diffArr[ind + 1] &&
        diffArr[ind + 1].status === "down"
      ) {
        let difference = dayjs(diffArr[ind + 1].time).diff(
          dayjs(curr.time),
          "seconds"
        );
        return acc + difference;
      } else if (curr.status === "up" && !diffArr[ind + 1]) {
        let difference = dayjs(Date.now()).diff(dayjs(curr.time), "seconds");
        return acc + difference;
      }
      return acc;
    },
    0
  );

  let totalDowntime = diffArr.reduce(
    (acc: number, curr: LiveServer, ind: number) => {
      if (
        curr.status === "down" &&
        diffArr[ind + 1] &&
        diffArr[ind + 1].status === "up"
      ) {
        let difference = dayjs(diffArr[ind + 1]?.time).diff(
          dayjs(curr.time),
          "seconds"
        );
        return acc + difference;
      } else if (curr.status === "down" && !diffArr[ind + 1]) {
        let difference = dayjs(Date.now()).diff(dayjs(curr.time), "seconds");
        return acc + difference;
      }
      return acc;
    },
    0
  );

  let getTotalMonitoringTime = dayjs(Date.now()).diff(
    dayjs(diffArr[0].time),
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
    diskSize: latestDiskSize,
    diskUsed: latestDiskUsed,
  };
};

// This function retrieves the past 5 minutes of live
// server data given a startTime in js date format,
// a user id, and a server id.
const fiveMinuteLiveData = async (
  startDate: Date,
  id: number,
  userid: number
) => {
  try {
    let beginTime = startDate.getTime();
    let endTime = beginTime - 5 * 60 * 1000;

    let res = await LiveServer.findAll({
      where: {
        serverid: id,
        userid: userid,
        time: {
          [Op.between]: [endTime, beginTime],
        },
      },
      attributes: ["time", "memUsage", "cpuUsage"],
      raw: true,
    });

    return res;
  } catch (err) {
    console.log("ERROR GETTING FIVE MINUTE LIVE DATA: ", err);
  }
};

// Take an array of LiveServer data and average
// cpu usage and mem usage over that interval.
const averageFiveMinuteData = (data: LiveServer[]) => {
  const totalVals = data.length;
  const avgMem =
    data.reduce(
      (acc: number, curr: LiveServer) => acc + Number(curr?.memUsage),
      0
    ) / totalVals;
  const avgCpu =
    data.reduce(
      (acc: number, curr: LiveServer) => acc + Number(curr?.cpuUsage),
      0
    ) / totalVals;
  return {
    avgMem: Math.round((avgMem + Number.EPSILON) * 100) / 100,
    avgCpu: Math.round((avgCpu + Number.EPSILON) * 100) / 100,
  };
};

// Build return object for FE graphing from retArr.
const buildData = (combinedArr: ICombinedData[], key: string) => {
  let retArr: { x: number; y: number }[] = [];
  combinedArr.forEach((elem: ICombinedData, index: number) => {
    let newObj = {
      x: (index + 1) * 5,
      y: elem[key as keyof typeof elem],
    };

    if (newObj["y"]) {
      retArr.push(newObj);
    }
  });
  return retArr;
};

// Get past hour of usage data.
export const getMonitoredUsageData = async (id: number, userid: number) => {
  try {
    let resA = await LiveServer.findOne({
      where: { serverid: id, userid: userid },
      order: [["time", "DESC"]],
    });

    // Get timstamp of last entry for this server.
    const startTimeStamp = resA?.time;

    // If it exists, get past five minutes of data from that point.
    if (startTimeStamp) {
      const jsDateBegin = new Date(startTimeStamp);

      // Get array of times each 5 minutes before the last, up to one hour.
      let timeArr = [jsDateBegin.getTime()];
      for (let i = 1; i < 12; i++) {
        timeArr[i] = new Date(timeArr[i - 1]).getTime() - 5 * 60 * 1000;
      }

      let retArr = [];
      for (const elem of timeArr) {
        let res = await fiveMinuteLiveData(new Date(elem), id, userid);
        if (res) {
          let avg = averageFiveMinuteData(res);
          retArr.push(avg);
        }
      }

      let memObj = buildData(retArr, "avgMem");
      let cpuObj = buildData(retArr, "avgCpu");

      let combinedRetObj = { memObj: memObj, cpuObj: cpuObj };

      return combinedRetObj;
    }
  } catch (err) {
    console.log("ERROR FROM GETMONITORED USAGE DATA IS: ", err);
  }
};
