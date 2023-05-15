import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { isUp } from "../Utils/serverDetails";
import { Socket } from "socket.io";

// Register for uptime checking on URL every 60 seconds.
export function sioUpCheck(socket: Socket) {
  let upInterval: ReturnType<typeof setInterval>;
  socket.on("upCheck", (data) => {
    upInterval = setInterval(async function () {
      let result = await isUp(data);
      socket.emit("status-update", result);
    }, 60000);
  });

  socket.on("disconnect", () => {
    clearInterval(upInterval);
  })
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
