require("dotenv").config();
import Koa from "koa";
import { sequelize } from "./Models/index";
import router from "./Router/routes";
import koaBody from "koa-body";
import logger from "koa-logger";
import cors from "@koa/cors";
import { Server, Socket } from "socket.io";
import http from "http";
import { sioJwtVerify, sioUpCheck } from "./Controllers/sockets";
import { Client } from "pg";
import { startServerJobs } from "./Utils/cronUtils";

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
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT),
    database: process.env.DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PW,
  });

  try {
    await client.connect();
    console.log("Connected.")
    console.log("Attempting to create_hypertable...");
    let hypRes = await client.query(`SELECT create_hypertable('"liveserver"', 'time', if_not_exists => TRUE);`);
    console.log("Hypertable Creation Response: ", hypRes);
    server.listen(3001, () => console.log(`Server running on port: ${3001}`));
    console.log("Starting all server jobs.");
    await startServerJobs();
  } catch (err) {
    console.log("ERR IS: ", err);
  }
})();

io.on("connection", function (socket: Socket) {
  sioJwtVerify(socket);
  sioUpCheck(socket);
});

export default io;
