import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { isUp, getSslDetails } from "../Utils/serverDetails";
import { Socket } from "socket.io";
import { Server } from "../Models/server.model";

// Register for status checking on URL every 60 seconds.
// Only take action if it's different than stored status.
export function sioUpCheck(socket: Socket) {
  let upInterval: ReturnType<typeof setInterval>;
  socket.on("upCheck", async (data) => {
    // Check database for previous state
    let serv = await Server.findAll({
      where: {
        id: data.id,
      },
      attributes: ["status"],
    });
    let res = serv[0]?.dataValues.status;
    console.log("Setting URL Interval.");
    upInterval = setInterval(async function () {
      let checkUp = await isUp(data.url);
      if (checkUp !== res) {
        await Server.update(
          { status: checkUp },
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
          attributes: ["status"],
        });
        res = serv[0]?.dataValues.status;
        socket.emit("serverUpdate", { status: checkUp });
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
    if(res <= 1) {
      console.log("Setting SSL Interval.")
      sslInterval = setInterval(async function () {
        let checkSsl: any = await getSslDetails(data.url);
        if(checkSsl.daysRemaining != res || String(checkSsl.valid) != resStatus) {
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
          socket.emit("serverUpdate", { sslExpiry: checkSsl.daysRemaining, sslStatus: checkSsl.valid });
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
