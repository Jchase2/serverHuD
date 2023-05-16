require("dotenv").config();
import Koa from "koa";
import { sequelize } from "./Models/index";
import router from "./Router/routes";
import koaBody from "koa-body";
import logger from "koa-logger";
import cors from "@koa/cors";
import { Server, Socket } from "socket.io";
import http from "http";
import { sioJwtVerify, sioSSLCheck, sioUpCheck } from "./Controllers/sockets";

const app = new Koa();
app.use(logger());
app.use(cors());
app.use(koaBody());
app.use(router.routes());

const server = http.createServer(app.callback());

const io = new Server(server, {
  cors: {
    origin: "localhost:3000",
    methods: ["GET", "POST"],
  },
});

(async () => {
  await sequelize.sync({ force: false });
  server.listen(3001, () => console.log(`Server running on port: ${3001}`));
})();

io.on("connection", function (socket: Socket) {
  sioJwtVerify(socket);
  sioUpCheck(socket);
  sioSSLCheck(socket);
});

export default io;
