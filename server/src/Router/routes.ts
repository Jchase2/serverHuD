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
  getUserPerms,
  updateRegistrationSettings
} from "../Controllers/api";
import jwt from "koa-jwt";
import { permissionMiddleware } from "./permsMiddleware";

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
  .get("/user/permissions", getUserPerms)
  .get("/user/logout", getUserLogout)
  .put(
    "/servers/delete/:id",
    permissionMiddleware(["delete_server"]),
    deleteServer
  )
  .put(
    "/servers/update/:id",
    permissionMiddleware(["update_server"]),
    updateServer
  )
  .put(
    "/admin/registration",
    permissionMiddleware(['enable_disable_registration']),
    updateRegistrationSettings
  )
  .post("/servers", permissionMiddleware(["create_server"]), addServer);
export default router;
