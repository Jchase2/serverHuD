import dayjs from "dayjs";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { QueryTypes } from "sequelize";
import { ExtensionServer } from "../Models/extensionServer.model";
import { sequelize } from "../Models";
import { isUp } from "./serverDetails";
import axios from "axios";

export const getAllCombinedState = async (userid: number) => {
  try {
    const serverList = await Server.findAll({
      where: { userid: userid },
    });

    let combinedData = serverList.map(async (server) => {
      const extensionData = await ExtensionServer.findOne({
        where: { serverid: server.id, userid: userid },
        attributes: ["optionalUrl", "upgrades", "extServerUptime", "trackOptions"],
      });

      let res = await LiveServer.findOne({
        where: { serverid: server.id, userid: userid },
        attributes: [
          "status",
          "sslStatus",
          "diskData",
          "memUsage",
          "cpuUsage",
        ],
        order: [["time", "DESC"]],
      });
      Object.assign(server.dataValues, res?.dataValues);
      if (extensionData?.dataValues)
        Object.assign(server.dataValues, extensionData?.dataValues);
      return server;
    });

    return await Promise.all(combinedData);
  } catch (err) {
    console.log("ERROR FROM GET ALL COMBINED STATES: ", err);
  }
};

export const getOneCombinedState = async (serverid: number, userid: number) => {
  try {
    const server = await Server.findOne({
      where: { id: serverid, userid: userid },
    });

    const extensionServerData = await ExtensionServer.findOne({
      where: { serverid: serverid, userid: userid },
      attributes: [
        "optionalUrl",
        "upgrades",
        "smart",
        "extServerUptime",
        "trackOptions",
      ],
    });

    if (!server) {
      return null;
    }

    const extensionServerStatus = await isUp(extensionServerData?.dataValues.optionalUrl)

    let res = await LiveServer.findOne({
      where: { serverid: serverid, userid: userid },
      attributes: [
        "status",
        "sslStatus",
        "diskData",
        "httpCode",
        "memUsage",
        "cpuUsage",
      ],
      order: [["time", "DESC"]],
    });
    // Make sure we're returning -1 if we don't have these values.
    if (res && res.dataValues) {
      res.dataValues.diskData = res.dataValues.diskData
        ? res.dataValues.diskData
        : [];
      res.dataValues.memUsage = res.dataValues.memUsage
        ? res.dataValues.memUsage
        : 0;
      res.dataValues.cpuUsage = res.dataValues.cpuUsage
        ? res.dataValues.cpuUsage
        : 0;
    }

    Object.assign(server?.dataValues, res?.dataValues);
    server.dataValues.trackOptions =
      extensionServerData?.dataValues.trackOptions;
    server.dataValues.optionalUrl = extensionServerData?.dataValues.optionalUrl;
    server.dataValues.upgrades = extensionServerData?.dataValues.upgrades;
    server.dataValues.smart = extensionServerData?.dataValues.smart;
    server.dataValues.extServerUptime = extensionServerData?.dataValues.extServerUptime;
    server.dataValues.extensionServerStatus = extensionServerStatus;

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

  // TODO: Not sure if I want to split stuff like this into
  // a separate utils/tools.ts file or implement this differently.
  const secondsToText = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const remainingSecondsAfterHours = totalSeconds % 3600;
    const minutes = Math.floor(remainingSecondsAfterHours / 60);
    const seconds = Math.round(remainingSecondsAfterHours % 60);

    const timeArray = [];

    if (hours > 0) {
      timeArray.push(`${hours}h`);
    }
    if (minutes > 0) {
      timeArray.push(`${minutes}m`);
    }
    if (seconds > 0 || totalSeconds === 0) {
      timeArray.push(`${seconds}s`);
    }

    return timeArray.join(', ').replace(/,([^,]*)$/, ' and$1');
  }

// Calculates %up and %down from recorded data on a server.
export const getMonitoredUpInfo = async (id: number, userid: number, upInc: string) => {

  const timeIncrementsObj = {
    '1h': '1 hour',
    '1d': '1 day',
    '1w': '1 week',
    '1m': '1 month',
    'all': '100 years',
  }

  let fixedInc: string = timeIncrementsObj[upInc as keyof typeof timeIncrementsObj];

  interface IUpTime {
    extract: number
  }

  const totalTime =  await sequelize.query<IUpTime>(
    `SELECT EXTRACT(EPOCH FROM (MAX(time) - MIN(time))) FROM liveserver  WHERE serverid = :id AND userid = :userid AND time >= CURRENT_TIMESTAMP - INTERVAL :fixedInc;`, {
      replacements: { id, userid, fixedInc },
      raw: true,
      type: QueryTypes.SELECT,
    }
  );

  // Get diskData
  let res = await LiveServer.findAll({
    where: {
      serverid: id,
      userid: userid,
    },
    order: [["time", "ASC"]],
    attributes: ["time", "status", "diskData"],
    limit: 1,
    raw: true,
  });

  const diffArr = await sequelize.query<LiveServer>(
    `SELECT time, status, "diskData"
    FROM (
        SELECT time, status, "diskData",
               LAG(status) OVER (ORDER BY "time") AS prev_status
        FROM liveserver
        WHERE serverid = :id AND userid = :userid
    ) AS subquery
    WHERE status IS NOT NULL
      AND status <> prev_status
      AND time >= CURRENT_TIMESTAMP - INTERVAL :fixedInc`,
    {
      replacements: { id, userid, fixedInc },
      raw: true,
      type: QueryTypes.SELECT,
    });

  // If there's nothing in diffArr, add liveserver stuff
  // so we can return an initial set of data.
  if (!diffArr.length) {
    diffArr.push(res[0]);
  }

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

  const totalUptime = totalTime[0]?.extract - totalDowntime;

  let percentageUp = Number(
    ((totalUptime / totalTime[0]?.extract) * 100).toFixed(2)

  );
  let percentageDown = Number(
    ((totalDowntime / totalTime[0]?.extract) * 100).toFixed(2)
  );

  const extensionData = await ExtensionServer.findOne({
    where: { id, userid: userid },
    attributes: ["optionalUrl"],
  });

  return {
    uptime: secondsToText(totalUptime),
    downtime: secondsToText(totalDowntime),
    percentageUp: percentageUp,
    percentageDown: percentageDown,
    diskData: res[0]?.diskData,
  };
};

// Get past hour of usage data.
export const getMonitoredUsageData = async (id: number, userid: number, inc: string, incCount: number) => {

  try {

    const timeIncrementsObj = {
      '1h': '5 minutes',
      '1d': '1 hour',
      '1w': '1 day',
      '1m': '1 day'
    }

    let fixedInc: string = timeIncrementsObj[inc as keyof typeof timeIncrementsObj];

    const memObj = await sequelize.query<LiveServer>(
      `SELECT time_bucket(:fixedInc, time) AS x, avg("memUsage") AS y
    FROM liveserver WHERE serverid = :id AND userid = :userid
    GROUP BY x
    ORDER BY x DESC LIMIT :incCount;`,
      {
        replacements: { id, userid, fixedInc, incCount },
        raw: true,
        type: QueryTypes.SELECT,
      }
    );

    const cpuObj = await sequelize.query<LiveServer>(
      `SELECT time_bucket(:fixedInc, time) AS x, avg("cpuUsage") AS y
    FROM liveserver WHERE serverid = :id AND userid = :userid
    GROUP BY x
    ORDER BY x DESC LIMIT :incCount;`,
      {
        replacements: { id, userid, fixedInc, incCount },
        raw: true,
        type: QueryTypes.SELECT,
      }
    );

    const combinedArr2 = {
      memObj,
      cpuObj,
    };

    return combinedArr2;
  } catch (err) {
    console.log("MONITORED RESOURCE USAGE ERROR IS: ", err);
  }
};


export const timeoutChecker = async (url: string) => {
  try {
    await axios.get(url, {timeout: 10000});
    return false
  } catch(err: any) {
    if(err.code === "ECONNABORTED") return true
    else return false
  }
}