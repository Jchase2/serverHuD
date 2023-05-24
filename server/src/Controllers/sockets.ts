import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { Socket } from "socket.io";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";
import { getMonitoredUpInfo } from "../Utils/apiUtils";

// TODO: Add more checks so this doesn't crash with bad input.

// Register for status checking every 10 seconds..
// Only take action if current UI status is different than last stored status.
// This will check for all updates with different intervals using the same socket.
// This way we mimize the number of open sockets and setIntervals instances.
export function sioUpCheck(socket: Socket) {
  console.log("SIO UP CHECK CALLED")
  let upInterval: ReturnType<typeof setInterval>;
  let intervals: any = {};
  socket.on("upCheck", async (data) => {
    let strId = `${data.url}-${data.id}`;
    // Make sure we haven't already started an interval for this.
    if(!intervals[strId]) {
      intervals[strId] = true;
      console.log("Setting URL Interval.");
      upInterval = setInterval(async function () {
        urlDbChecker(data, socket);
        sslDbChecker(data, socket);
        urlLiveCheck(data, socket);
      }, 10000);
    }
  });

  socket.on("disconnect", () => {
    console.log("Clearing interval.");
    intervals = {};
    clearInterval(upInterval);
  });
}

const urlLiveCheck = async (data: any, socket: Socket) => {
  let res = await getMonitoredUpInfo(data.id);
  socket.emit("liveServerUpdate", {
    id: data.id,
    percentageUp: res.percentageUp,
    percentageDown: res.percentageDown,
  });
};

// Check status of url endpoint.
const urlDbChecker = async (data: any, socket: Socket) => {
  // Check database for previous state
  let serv = await LiveServer.findOne({
    where: { serverid: data.id },
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
  // First we check the LiveServ to see if
  // our ssl is up or down.
  let serv = await LiveServer.findOne({
    where: { serverid: data.id },
    order: [["time", "DESC"]],
  });

  let res = serv?.dataValues.sslStatus;
  if (data.sslStatus !== res && serv !== null) {
    socket.emit("serverUpdate", { sslStatus: res, id: data.id }, (resp: any) => {
      data.sslStatus = resp.sslStatus;
    });
  }

  // Next we check the Server table to see if sslExpiry
  // has changed. TODO: Setup on front end in server info.
  let servExpiry = await Server.findOne({
    where: { id: data.id },
  });

  let expiryRes = servExpiry?.dataValues.sslExpiry;
  if (data.sslExpiry && data.sslExpiry !== expiryRes && servExpiry !== null) {
    socket.emit("serverUpdate", { sslExpiry: expiryRes, id: data.id }, (resp: any) => {
      data.sslExpiry = resp.sslExpiry;
    });
  }
};

// Verify JWT before allowing additional calls.
export function sioJwtVerify(socket: Socket) {

  if(!socket?.handshake?.auth?.token) {
    console.log("No auth token, can't verify.");
    return;
  };

  io.use((socket, next) => {
    if (verifyToken(socket.handshake.auth.token)) {
      next();
    } else {
      next(new Error("Invalid jwt!"));
    }
  });
}
