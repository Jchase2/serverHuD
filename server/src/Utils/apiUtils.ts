import dayjs from "dayjs";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { Op, Sequelize } from "sequelize";

export const getAllCombinedState = async (userid: any) => {
  const serverList = await Server.findAll({
    where: { userid: userid },
  });

  let combinedData = serverList.map(async (server) => {
    let res = await LiveServer.findOne({
      where: { serverid: server.id, userid: userid },
      attributes: ["status", "sslStatus", "diskSpace", "memUsage", "cpuUsage"],
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
    attributes: ["status", "sslStatus", "diskSpace", "memUsage", "cpuUsage"],
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

// Calculate the difference between two
// Live server timestamps.
// TODO: Deal with anys
const calcDiff = (time: any, nextTime: any) =>
  dayjs(time.time).diff(dayjs(nextTime.time), "seconds");

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
    attributes: ["time", "status"],
    raw: true,
  });

  // TODO: Again, fix the any's.
  let currStatus: any = null;
  let diffArr: any = [];
  res.forEach((elem) => {
    if (elem.status != currStatus) {
      diffArr.push(elem);
      currStatus = elem.status;
    }
  });

  let totalUptime = diffArr.reduce((acc: any, curr: any, ind: number) => {
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
  }, 0);

  let totalDowntime = diffArr.reduce((acc: any, curr: any, ind: number) => {
    if (
      curr.status === "down" &&
      diffArr[ind + 1] &&
      diffArr[ind + 1].status === "up"
    ) {
      let difference = dayjs(diffArr[ind + 1].time).diff(
        dayjs(curr.time),
        "seconds"
      );
      return acc + difference;
    } else if (curr.status === "down" && !diffArr[ind + 1]) {
      let difference = dayjs(Date.now()).diff(dayjs(curr.time), "seconds");
      return acc + difference;
    }
    return acc;
  }, 0);

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
      attributes: ["time", "diskSpace", "memUsage", "cpuUsage"],
      raw: true,
    });

    return res;
  } catch (err) {
    console.log("ERROR GETTING FIVE MINUTE LIVE DATA: ", err);
  }
};

// Take an array of LiveServer data and average
// cpu usage and mem usage over that interval.
// TODO: Get rid of any's.
const averageFiveMinuteData = (data: any) => {
  const totalVals = data.length;
  const avgMem =
    data.reduce((acc: number, curr: any) => acc + Number(curr?.memUsage), 0) /
    totalVals;
  const avgCpu =
    data.reduce((acc: number, curr: any) => acc + Number(curr?.cpuUsage), 0) /
    totalVals;
  return {
    avgMem: Math.round((avgMem + Number.EPSILON) * 100) / 100,
    avgCpu: Math.round((avgCpu + Number.EPSILON) * 100) / 100,
  };
};

// Build return object for FE graphing from retArr.
const buildData = (combinedArr: any, key: string) => {
  let retArr: any = [];
  combinedArr.forEach((elem: any, index: number) => {
    let newObj = {
      x: (index + 1) * 5,
      y: elem[key],
    };

    if(newObj['y']) {
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
        let avg = averageFiveMinuteData(res);

        console.log("AVG IS: ", avg);
        retArr.push(avg);
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
