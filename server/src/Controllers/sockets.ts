import io from "../index";
import { getUserId, verifyToken } from "../Utils/jwt";
import { Socket } from "socket.io";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { getMonitoredUsageData, getMonitoredUpInfo } from "../Utils/apiUtils";
import cookie from 'cookie';
import { ExtensionServer } from "../Models/extensionServer.model";

// TODO: Test with bad input.

interface IIntervalObj {
  [proporty: string]: ReturnType<typeof setInterval>
}

interface IUrlLiveData {
  id: number;
  url: string;
  optionalUrl: string;
  status: string;
  sslStatus: string;
  sslExpiry: string | undefined;
}

// Register for status checking every 10 seconds..
// Only take action if current UI status is different than last stored status.
// This will check for all updates with different intervals using the same socket.
export function sioUpCheck(socket: Socket) {

  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  if(!cookies) console.log("No auth cookie provided.")
  let userid = getUserId(cookies?.accessToken);

  console.log("SIO UP CHECK CALLED, SOCKET ID: ", socket.id);
  let intervalArr: string[] = [];
  let intervalObj: IIntervalObj = {};
  if (userid > 0) {
    socket.on("upCheck", async (data) => {
      console.log("UPCHECK RECIEVED WITH ID: ", data.id);
      let jobName = `sio-${data.url}-${data.id}`;
      if (!intervalArr.includes(jobName)) {
        intervalArr.push(jobName);
        console.log("Adding ", jobName, " to interval list.");
        const upInterval = setInterval(async function () {
          console.log("RUNNING IN INTERVAL...");
          urlDbChecker(data, socket);
          sslDbChecker(data, socket);
          urlLiveCheck(data, socket);
          // If enableExtensionServer is true, send resource usage updates.
          if (data.enableExtensionServer) {
            extensionServerData(data, socket);
          }
        }, 10000);
        intervalObj[jobName] = upInterval;
      }
      return false;
    });
  } else {
    console.log("Invalid User for UpCheck.");
  }

  socket.on("disconnect", () => {
    console.log("DISCONNECTING.")
    for (const key in intervalObj) {
      if (intervalObj.hasOwnProperty(key)) {
        console.log("CLEARING INTERVAL: ", key)
        clearInterval(intervalObj[key])
      }
    }
  });
}

const urlLiveCheck = async (data: IUrlLiveData, socket: Socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  let userid = getUserId(cookies?.accessToken);

  try {
    let res = await getMonitoredUpInfo(data.id, userid);
    socket.emit("liveServerUpdate", {
      id: data.id,
      percentageUp: res.percentageUp,
      percentageDown: res.percentageDown,
      diskUsed: res.diskUsed,
      diskSize: res.diskSize
    });
  } catch (err) {
    console.log("LIVE CHECK ERROR: ", err);
  }
};

const extensionServerData = async (data: IUrlLiveData, socket: Socket) => {
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  let userid = getUserId(cookies?.accessToken);
  try {
    let servInfo = await Server.findOne({
      where: { id: data.id, userid: userid },
    });

    // We don't just use data.id here so an arbitrary
    // id can't be used to get another users info.
    let extensionServerInfo = await ExtensionServer.findOne({
      where: { serverid: servInfo?.id, userid: userid }
    })

    if (extensionServerInfo?.optionalUrl) {
      let res = await getMonitoredUsageData(data.id, userid);
      console.log("EMITTING RESOURCE UPDATE ON BACKEND");
      socket.emit("resourcesUpdate", {
        id: data.id,
        resourceObj: res,
      });
    }
  } catch (err) {
    console.log("EXTENSION SERVER CHECK ERROR: ", err);
  }
};

// Check status of url endpoint.
const urlDbChecker = async (data: IUrlLiveData, socket: Socket) => {
  // Decode userid, make sure user owns this server.
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  let userid = getUserId(cookies?.accessToken);

  // Check database for previous state
  let serv = await LiveServer.findOne({
    where: {
      serverid: data.id,
      userid: userid,
    },
    order: [["time", "DESC"]],
  });

  let res = serv?.dataValues.status;

  // If current data.status isn't the same as the DB
  // we will emit. Then we set data.status to resp.status,
  // this way it doesn't re-run.
  if (data.status !== res && serv !== null) {
    socket.emit("serverUpdate", { status: res, id: data.id }, (resp: {id: number, status: string}) => {
      data.status = resp.status;
    });
  }
};

// Check status of SSL.
const sslDbChecker = async (data: IUrlLiveData, socket: Socket) => {
  // Decode userid, make sure user owns this server.
  const cookies = cookie.parse(socket.handshake.headers.cookie || "");
  let userid = getUserId(cookies?.accessToken);

  // Check the LiveServ to see if our ssl is up or down.
  let serv = await LiveServer.findOne({
    where: { serverid: data.id, userid: userid },
    order: [["time", "DESC"]],
  });

  let res = serv?.dataValues.sslStatus;
  if (data.sslStatus !== res && serv !== null) {
    socket.emit(
      "serverUpdate",
      { sslStatus: res, id: data.id },
      (resp: { id: number, sslStatus: string}) => {
        data.sslStatus = resp.sslStatus;
      }
    );
  }

  // Next we check the Server table to see if sslExpiry
  // has changed. TODO: Setup on front end in server info.
  let servExpiry = await Server.findOne({
    where: { id: data.id, userid: userid },
  });

  let expiryRes = servExpiry?.dataValues.sslExpiry;
  if (data.sslExpiry && data.sslExpiry !== expiryRes && servExpiry !== null) {
    socket.emit(
      "serverUpdate",
      { sslExpiry: expiryRes, id: data.id },
      (resp: {sslExpiry: string}) => {
        data.sslExpiry = resp.sslExpiry;
      }
    );
  }
};

// Verify JWT before allowing additional calls.
export function sioJwtVerify(socket: Socket) {

  const cookies = cookie.parse(socket.handshake.headers.cookie || "");

  if (!cookies?.accessToken) {
    console.log("No auth token, can't verify.");
    return;
  }
  io.use((socket, next) => {
    if (verifyToken(cookies?.accessToken)) {
      next();
    } else {
      next(new Error("Invalid jwt!"));
    }
  });
}
