import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { isUp, getSslDetails } from "../Utils/serverDetails";
import { Socket } from "socket.io";
import { LiveServer } from "../Models/liveServer.model";
import { Server } from "../Models/server.model";

// Register for status checking from LiveServer every 10 seconds..
// Only take action if current UI status is different than last stored status.
export function sioUpCheck(socket: Socket) {
  let upInterval: ReturnType<typeof setInterval>;
  socket.on("upCheck", async (data) => {
    console.log("Setting URL Interval.");
    console.log("DATA IS: ", data)
    upInterval = setInterval(async function () {
      // Check database for previous state
      let serv = await LiveServer.findOne({
        where: { serverid: data.id },
        order: [["time", "DESC"]],
      });
      let res = serv?.dataValues.up;
      if (data.status !== res) {
        socket.emit("serverUpdate", { status: res });
      }
    }, 10000);
  });

  socket.on("disconnect", () => {
    console.log("Clearing interval.");
    clearInterval(upInterval);
  });
}

// ToDo: Set this up so that if the SSL date
// is past, we're checking every few minutes.
export function sioSSLCheck(socket: Socket) {
  let sslInterval: ReturnType<typeof setInterval>;
  socket.on("sslCheck", async (data) => {
    // Check database for previous state
    let serv = await Server.findAll({
      where: {
        id: data.id,
      },
      attributes: ["sslStatus", "sslExpiry"],
    });
    let res = serv[0]?.dataValues.sslExpiry;
    let resStatus = serv[0]?.dataValues.sslStatus;
    if (res <= 1) {
      console.log("Setting SSL Interval.");
      sslInterval = setInterval(async function () {
        let checkSsl: any = await getSslDetails(data.url);
        if (
          checkSsl.daysRemaining != res ||
          String(checkSsl.valid) != resStatus
        ) {
          await Server.update(
            { sslExpiry: checkSsl.daysRemaining, sslStatus: resStatus },
            {
              where: {
                id: data.id,
              },
            }
          );
          serv = await Server.findAll({
            where: {
              id: data.id,
            },
            attributes: ["sslStatus", "sslExpiry"],
          });
          res = serv[0]?.dataValues.sslExpiry;
          resStatus = serv[0]?.dataValues.sslStatus;
          socket.emit("serverUpdate", {
            sslExpiry: checkSsl.daysRemaining,
            sslStatus: checkSsl.valid,
          });
        }
      }, 300000);
    }
  });

  socket.on("disconnect", () => {
    console.log("Clearing interval.");
    clearInterval(sslInterval);
  });
}

// Verify JWT before allowing additional calls.
export function sioJwtVerify(socket: Socket) {
  io.use((socket, next) => {
    if (verifyToken(socket.handshake.auth.token)) {
      next();
    } else {
      next(new Error("Invalid jwt!"));
    }
  });
}
