import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { isUp } from "../Utils/serverDetails";
import { Socket } from "socket.io";
import { User } from "../Models/user.model";
import { Server } from "../Models/server.model";

// Register for status checking on URL every 60 seconds.
// Only take action if it's different than stored status.
export function sioUpCheck(socket: Socket) {
  let upInterval: ReturnType<typeof setInterval>;
  socket.on("upCheck", async (data) => {
    console.log("UPCHECK DATA: ", data);
    console.log("Setting Interval");
    // Check database for previous state
    let serv = await Server.findAll({
      where: {
        id: data.id,
      },
      attributes: ["status"],
    });

    let res = serv[0].dataValues.status;
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
        res = serv[0].dataValues.status;

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
  socket.on("sslCheck", (data) => {
    //setInterval(async function () {
    //}, 60000);
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