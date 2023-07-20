import { User } from "../Models/user.model";
import { Server } from "../Models/server.model";
import bcrypt from "bcrypt";
import Joi, { optional } from "joi";
import jwt from "jsonwebtoken";
import { getSslDetails, hudServerData, isUp } from "../Utils/serverDetails";
import {
  setupOptionalCron,
  setupSslCron,
  setupUrlCron,
  updateOptionalCron,
  updateSslCron,
  updateUrlCron,
} from "../Utils/cronUtils";
import { LiveServer } from "../Models/liveServer.model";
import {
  SplitTime,
  getAllCombinedState,
  getMonitoredUpInfo,
  getMonitoredUsageData,
  getOneCombinedState,
} from "../Utils/apiUtils";
import { getUserId, verifyToken } from "../Utils/jwt";

const URL_EMPTY_DEFAULT = "http://";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

export const registerUser = async (ctx: any) => {
  try {
    // Make sure types are correct.
    await userSchema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });

    // Make sure user doesn't already exist.
    const user = await User.findOne({
      where: { email: ctx.request.body.email },
    });
    if (user !== null) {
      ctx.body = "User already exists!";
      return (ctx.status = 409);
    }

    // Check if pw matches, and create user.
    const hash = await bcrypt.hash(ctx.request.body.password, 10);
    User.create({ email: ctx.request.body.email, password: hash });
    ctx.body = "User Created!";
    ctx.status = 201;
  } catch (e: any) {
    console.log("Registration error: ", e);
    (ctx.body = e.details[0].message), (ctx.status = 400);
  }
};

export const loginUser = async (ctx: any) => {
  try {
    await userSchema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    const user = await User.findOne({
      where: { email: ctx.request.body.email },
    });

    if (user === null) {
      ctx.body = "Issue logging in, please try again!";
      return (ctx.status = 403);
    }
    const validatedPass = await bcrypt.compare(
      ctx.request.body.password,
      user.password
    );
    if (!validatedPass) throw new Error("Incorrect username or password!");
    const accessToken = jwt.sign(
      { _id: user.id },
      process.env.SECRET_KEY || "insecureuY47Qf2xo3M9kKjF67hq",
      { expiresIn: "7d" }
    );
    ctx.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      SameSite: "Strict",
    });
    ctx.body = { userId: user.id };
    ctx.status = 200;
  } catch (e) {
    console.log("ERROR THROWN IN LOGIN: ", e);
    ctx.status = 401;
  }
};

export const getVerifyUser = async (ctx: any) => {
  let accessToken = ctx.cookies.get("accessToken");
  if (accessToken) {
    let userId = getUserId(accessToken);
    if (userId === -1) {
      ctx.status = 401;
    } else {
      ctx.body = { userId: userId };
      ctx.status = 200;
    }
  } else {
    ctx.status = 401;
  }
};

export const getUserLogout = async (ctx: any) => {
  let accessToken = ctx.cookies.get("accessToken");
  if (verifyToken(accessToken)) {
    ctx.cookies.set("accessToken");
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
};

export const getUserServers = async (ctx: any) => {
  let res = await getAllCombinedState(ctx.state.user._id);
  if (res) {
    ctx.body = res;
    ctx.status = 200;
  } else {
    ctx.body = "No servers found!";
    ctx.status = 404;
  }
};

export const getIndServer = async (ctx: any) => {
  const server = await getOneCombinedState(ctx.params.id, ctx.state.user._id);
  if (server) {
    ctx.body = server;
    ctx.status = 200;
  } else {
    ctx.body = "Server not found!";
    ctx.status = 404;
  }
};

export const getServerUsage = async (ctx: any) => {
  const data = await getMonitoredUsageData(ctx.params.id, ctx.state.user._id);
  if (data) {
    ctx.body = data;
    ctx.status = 200;
  } else {
    ctx.body = "Error retrieving data.";
    ctx.status = 404;
  }
};

export const deleteServer = async (ctx: any) => {
  try {
    await Server.destroy({
      where: {
        id: ctx.params.id,
        userid: ctx.state.user._id,
      },
    });
    ctx.body = "Server Deleted!";
    ctx.status = 202;
  } catch (err) {
    console.log("ERROR DELETING");
    ctx.status = 404;
  }
};

const serverSchema = Joi.object({
  userid: Joi.number().required(),
  url: Joi.string().uri().required(),
  optionalUrl: Joi.string().uri().allow(""),
  name: Joi.string().required(),
  sslExpiry: Joi.number(),
  uptime: Joi.object().allow({}),
  upgrades: Joi.string().allow(""),
});

const liveServerSchema = Joi.object({
  userid: Joi.number().required(),
  serverid: Joi.number().required(),
  url: Joi.string().uri().required(),
  status: Joi.string().required(),
  sslStatus: Joi.string().required(),
  memUsage: Joi.number(),
  diskUsed: Joi.number(),
  diskSize: Joi.number(),
  cpuUsage: Joi.number(),
});

export const addServer = async (ctx: any) => {
  const { url, optionalUrl, name } = ctx.request.body;

  // Check if URL is empty
  if (!url || url === URL_EMPTY_DEFAULT) {
    ctx.body = "URL cannot be empty.";
    ctx.status = 422;
    return;
  }

  // If hudServer Url is bad, just return error.
  // This is so we short circuit before we get too far
  // and it takes forever to return an error.
  if (optionalUrl) {
    const hudSchema = Joi.string().uri();
    const { error } = hudSchema.validate(optionalUrl);
    if (error) {
      ctx.body = "Optional backend must have a valid address.";
      ctx.status = 422;
      return;
    }
  }

  let sslInfo: any = await getSslDetails(url);
  if (sslInfo.errno) sslInfo.valid = false;

  const hudData = optionalUrl ? await hudServerData(optionalUrl) : null;
  const user = await User.findByPk(ctx.state.user._id);
  const status = await isUp(url);

  try {
    const value = await serverSchema.validateAsync({
      userid: ctx.state.user._id,
      url,
      optionalUrl: optionalUrl,
      name: name,
      sslExpiry: sslInfo.daysRemaining,
      uptime: hudData ? SplitTime(hudData.uptimeInHours) : {},
      upgrades: hudData ? hudData.upgrades : "empty",
    });

    if (!user) throw Error("User not found!");
    let dbResp = await Server.create(value);

    const liveValue = await liveServerSchema.validateAsync({
      userid: ctx.state.user._id,
      serverid: dbResp?.dataValues.id,
      url,
      status: status,
      sslStatus: sslInfo.valid.toString(),
      diskUsed: hudData ? hudData.diskUsed : -1,
      diskSize: hudData ? hudData.diskSize : -1,
      memUsage: hudData ? hudData.memUsage : -1,
      cpuUsage: hudData ? hudData.cpuUsage : -1,
    });

    await LiveServer.create(liveValue);
    await setupUrlCron(url, ctx.state.user._id, dbResp?.dataValues.id);
    await setupSslCron(url, ctx.state.user._id, dbResp?.dataValues.id);
    await setupOptionalCron(url, ctx.state.user._id, dbResp.dataValues.id);

    ctx.body = { Status: "Server added.", id: dbResp.id };
    ctx.status = 201;
  } catch (error: any) {
    console.log("ERROR IS: ", error);
    if ((error as any)?.isJoi) {
      ctx.body = error?.details[0].message;
      ctx.status = 422;
    } else {
      ctx.body = `${error}`;
      ctx.status = 400;
    }
  }
};

export const getTimeseriesUpData = async (ctx: any) => {
  let res = await getMonitoredUpInfo(ctx.params.id, ctx.state.user._id);
  ctx.body = res;
  ctx.status = 200;
};

export const updateServer = async (ctx: any) => {
  const { url, optionalUrl, name } = ctx.request.body;

  // Check if URL is empty
  if (!url || url === URL_EMPTY_DEFAULT) {
    ctx.body = "URL cannot be empty.";
    ctx.status = 422;
    return;
  }

  // If hudServer Url is bad, just return error.
  // This is so we short circuit before we get too far
  // and it takes forever to return an error.
  if (optionalUrl) {
    const hudSchema = Joi.string().uri();
    const { error } = hudSchema.validate(optionalUrl);
    if (error) {
      ctx.body = "Optional backend must have a valid address.";
      ctx.status = 422;
      return;
    }
  }

  let sslInfo: any = await getSslDetails(url);
  if (sslInfo.errno) sslInfo.valid = false;

  const hudData = optionalUrl ? await hudServerData(optionalUrl) : null;

  const user = await User.findByPk(ctx.state.user._id);
  const status = await isUp(url);

  try {
    const value = await serverSchema.validateAsync({
      userid: ctx.state.user._id,
      url,
      optionalUrl: optionalUrl,
      name: name,
      sslExpiry: sslInfo.daysRemaining,
      uptime: hudData ? SplitTime(hudData.uptimeInHours) : {},
      upgrades: hudData ? hudData.upgrades : "empty",
    });

    if (!user) throw Error("User not found!");

    await Server.update(value, {
      where: {
        id: ctx.params.id,
        userid: ctx.state.user._id,
      },
    });

    const liveValue = await liveServerSchema.validateAsync({
      userid: ctx.state.user._id,
      serverid: ctx.params.id,
      url,
      status: status,
      sslStatus: sslInfo.valid.toString(),
      diskUsed: hudData ? hudData.diskUsed : -1,
      diskSize: hudData ? hudData.diskSize : -1,
      memUsage: hudData ? hudData.memUsage : -1,
      cpuUsage: hudData ? hudData.cpuUsage : -1,
    });

    await LiveServer.create(liveValue);

    await updateUrlCron(url, ctx.state.user._id, ctx.params.id);
    await updateSslCron(url, ctx.state.user._id, ctx.params.id);
    await updateOptionalCron(url, ctx.state.user._id, ctx.params.id);

    ctx.body = { Status: "Server Updated.", id: ctx.params.id };
    ctx.status = 201;
  } catch (error: any) {
    console.log("ERROR IS: ", error);
    if ((error as any)?.isJoi) {
      ctx.body = error?.details[0].message;
      ctx.status = 422;
    } else {
      ctx.body = `${error}`;
      ctx.status = 400;
    }
  }
};
