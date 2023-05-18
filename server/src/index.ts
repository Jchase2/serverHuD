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

  // Here, we manually check if liveserver is a hypertable.
  // If it's not, we convert it to one.
  const client = new Client({
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT),
    database: process.env.DATABASE,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PW,
  });
  await client.connect((err) => {
    if (err) {
      console.error("connection error", err.stack);
    } else {
      console.log("connected");
    }
  });

  console.log("Attempting to create_hypertable...");

  await client.query(
    `SELECT create_hypertable('"liveserver"', 'time', if_not_exists => TRUE);`,
    (err, res) => {
      if (err) throw err;
      console.log("NO ERROR, Hypertable Ok.");
      client.end();
    }
  );
  server.listen(3001, () => console.log(`Server running on port: ${3001}`));

  console.log("Starting all server jobs.");
  await startServerJobs();
})();

io.on("connection", function (socket: Socket) {
  sioJwtVerify(socket);
  sioUpCheck(socket);
});

export default io;
