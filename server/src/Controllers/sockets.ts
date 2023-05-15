import io from "../index";
import { verifyToken } from "../Utils/jwt";
import { isUp } from "../Utils/serverDetails";
import { Socket } from "socket.io";

// Register for uptime checking on URL every 60 seconds.
export function sioUrlChecker(socket: Socket) {
  socket.on("registerUpdates", (data) => {
    setInterval(async function () {
      let result = await isUp(data);
      socket.emit("status-update", result);
    }, 60000);
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
