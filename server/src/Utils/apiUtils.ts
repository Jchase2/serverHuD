import dayjs from "dayjs";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { QueryTypes } from "sequelize";
import { ExtensionServer } from "../Models/extensionServer.model";
import { sequelize } from "../Models";

export const getAllCombinedState = async (userid: number) => {
  try {
    const serverList = await Server.findAll({
      where: { userid: userid },
    });

    let combinedData = serverList.map(async (server) => {
      const extensionData = await ExtensionServer.findOne({
        where: { serverid: server.id, userid: userid },
        attributes: ["optionalUrl", "upgrades", "uptime", "trackOptions"],
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
        "uptime",
        "trackOptions",
      ],
    });

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
    server.dataValues.trackOptions =
      extensionServerData?.dataValues.trackOptions;
    server.dataValues.optionalUrl = extensionServerData?.dataValues.optionalUrl;
    server.dataValues.upgrades = extensionServerData?.dataValues.upgrades;
    server.dataValues.smart = extensionServerData?.dataValues.smart;
    server.dataValues.uptime = extensionServerData?.dataValues.uptime;

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
export const getMonitoredUpInfo = async (id: number, userid: number) => {
  // Get last diskSize and diskUsed
  let res = await LiveServer.findAll({
    where: {
      serverid: id,
      userid: userid,
    },
    order: [["time", "ASC"]],
    attributes: ["time", "status", "diskSize", "diskUsed"],
    limit: 1,
    raw: true,
  });

  const lastEntryTime = await LiveServer.findOne({
    where: {
      serverid: id,
      userid: userid,
    },
    order: [["time", "DESC"]],
    attributes: ["time"],
    limit: 1,
    raw: true
  })

  const latestDiskSize = res[res.length - 1]?.diskSize
    ? res[res.length - 1]?.diskSize
    : -1;
  const latestDiskUsed = res[res.length - 1]?.diskSize
    ? res[res.length - 1]?.diskSize
    : -1;

  // Using raw query here because sequelize doesn't support this
  // sort of operation as far as I know, and making a db call
  // should be better for memory management than filtering in JS.
  const diffArr = await sequelize.query<LiveServer>(
    `SELECT time, status, "diskSize", "diskUsed"
      FROM
        (SELECT time, status, "diskSize", "diskUsed", LAG(status) OVER (ORDER BY "time")
        AS prev_status FROM liveserver WHERE serverid = :id AND userid = :userid)
      AS subquery WHERE status IS NOT NULL AND status <> prev_status;`,
    {
      replacements: { id, userid },
      raw: true,
      type: QueryTypes.SELECT,
    }
  );

  // If there's nothing in diffArr, add liveserver stuff
  // so we can return an initial set of data.
  if (!diffArr.length) {
    diffArr.push(res[0]);
  }

  interface IUpTime {
    extract: number
  }

  const totalTime =  await sequelize.query<IUpTime>(
    `SELECT EXTRACT(EPOCH FROM (MAX(time) - MIN(time))) FROM liveserver  WHERE serverid = :id AND userid = :userid;`, {
      replacements: { id, userid },
      raw: true,
      type: QueryTypes.SELECT,
    }
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

  const totalUptime = totalTime[0]?.extract - totalDowntime;

  let getTotalMonitoringTime = dayjs(lastEntryTime?.time).diff(
    dayjs(res[0]?.time),
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
    console.log("ERROR IS: ", err);
  }
};
