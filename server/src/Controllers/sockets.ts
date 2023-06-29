import io from "../index";
import { getUserId, verifyToken } from "../Utils/jwt";
import { Socket } from "socket.io";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { getMonitoredUsageData, getMonitoredUpInfo } from "../Utils/apiUtils";
import { Cron, scheduledJobs } from "croner";

// TODO: Add more checks so this doesn't crash with bad input.

// Register for status checking every 10 seconds..
// Only take action if current UI status is different than last stored status.
// This will check for all updates with different jobs using the same socket.
export function sioUpCheck(socket: Socket) {
  let userid = getUserId(socket.handshake.auth.token);
  console.log("SIO UP CHECK CALLED, SOCKET ID: ", socket.id);
  let jobArray = scheduledJobs.map((elem) => elem.name);
  // fix any
  let localJobArr: any = [];
  (socket as any).jobArr = [];
  if(userid > 0) {
    socket.on("upCheck", async(data) => {
      console.log("UPCHECK RECIEVED");
      let jobName = `sio-${data.url}-${data.id}`;
      if(!jobArray.includes(jobName)){
        localJobArr.push(jobName)
        console.log("Adding ", jobName, " to job list.");
        const job = Cron("*/10 * * * * *", { name: jobName }, async () => {
          console.log("RUNNING IN CRON...")
          urlDbChecker(data, socket);
          sslDbChecker(data, socket);
          urlLiveCheck(data, socket);
          hudServerData(data, socket);
        });
        return job.isRunning();
      }
      return false;
    })
  } else {
    console.log("Invalid User for UpCheck.")
  }

  socket.on("disconnect", () => {
    for(let i = scheduledJobs.length - 1; i > 0; i--) {
      if(localJobArr.includes(scheduledJobs[i].name)) {
        scheduledJobs[i].stop();
      }
    }
    return;
  });
}

const urlLiveCheck = async (data: any, socket: Socket) => {
  let userid = getUserId(socket.handshake.auth.token);
  try {
    let res = await getMonitoredUpInfo(data.id, userid);
    socket.emit("liveServerUpdate", {
      id: data.id,
      percentageUp: res.percentageUp,
      percentageDown: res.percentageDown,
    });
  } catch (err) {
    console.log("LIVE CHECK ERROR: ", err)
  }
};

const hudServerData = async (data: any, socket: Socket) => {
  let userid = getUserId(socket.handshake.auth.token);
  try {
    let servInfo = await Server.findOne({
      where: { id: data.id, userid: userid },
    });

    if(servInfo?.optionalUrl) {
      let res = await getMonitoredUsageData(data.id, userid);
      socket.emit("resourcesUpdate", {
        id: data.id,
        resourceObj: res
      });
    }

  } catch (err) {
    console.log("HUD CHECK ERROR: ", err)
  }
};

// Check status of url endpoint.
const urlDbChecker = async (data: any, socket: Socket) => {
  // Decode userid, make sure user owns this server.
  let userid = getUserId(socket.handshake.auth.token);

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
    socket.emit("serverUpdate", { status: res, id: data.id }, (resp: any) => {
      data.status = resp.status;
    });
  }
};

// Check status of SSL.
const sslDbChecker = async (data: any, socket: Socket) => {
  // Decode userid, make sure user owns this server.
  let userid = getUserId(socket.handshake.auth.token);

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
      (resp: any) => {
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
      (resp: any) => {
        data.sslExpiry = resp.sslExpiry;
      }
    );
  }
};

// Verify JWT before allowing additional calls.
export function sioJwtVerify(socket: Socket) {
  if (!socket?.handshake?.auth?.token) {
    console.log("No auth token, can't verify.");
    return;
  }

  io.use((socket, next) => {
    if (verifyToken(socket.handshake.auth.token)) {
      next();
    } else {
      next(new Error("Invalid jwt!"));
    }
  });
}
