import Router from "@koa/router";
import {
  registerUser,
  loginUser,
  getUserServers,
  addServer,
  getIndServer,
  deleteServer,
  getTimeseriesUpData,
  getServerUsage,
  getVerifyUser,
  getUserLogout,
  updateServer,
} from "../Controllers/api";
import jwt from "koa-jwt";

const router = new Router();

// Unsecured Routes
router.post("/register", registerUser).post("/login", loginUser);

// All routes after this line require a JWT token in the auth header!
router.use(
  jwt({
    secret: process.env.SECRET_KEY || "insecureuY47Qf2xo3M9kKjF67hq",
    cookie: "accessToken",
  })
);

router
  .get("/servers", getUserServers)
  .get("/servers/:id", getIndServer)
  .get("/servers/updata/:id/:upInc", getTimeseriesUpData)
  .get("/servers/usage/:id/:inc/:incCount", getServerUsage)
  .get("/user/me", getVerifyUser)
  .get("/user/logout", getUserLogout)
  .put("/servers/delete/:id", deleteServer)
  .put("/servers/update/:id", updateServer)
  .post("/servers", addServer);

export default router;
