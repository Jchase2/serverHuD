import { User } from "../Models/user.model";
import { Server } from "../Models/server.model";
import koa from "koa";
import bcrypt from "bcrypt";
import Joi, { optional } from "joi";
import jwt from "jsonwebtoken";
import {
  getExtSelectedData,
  getSslDetails,
  extensionServerData,
  isUp,
  getHttpStatusCode,
} from "../Utils/serverDetails";
import { setupGlobalCron, updateGlobalCron } from "../Utils/cronUtils";
import { LiveServer } from "../Models/liveServer.model";
import {
  SplitTime,
  getAllCombinedState,
  getMonitoredUpInfo,
  getMonitoredUsageData,
  getOneCombinedState,
  timeoutChecker,
} from "../Utils/apiUtils";
import { getUserId, verifyToken } from "../Utils/jwt";
import { IResolvedValues } from "../types";
import { ExtensionServer } from "../Models/extensionServer.model";
import axios from "axios";
import { error } from "console";

const URL_EMPTY_DEFAULT = "http://";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

export const registerUser = async (ctx: koa.Context, next: Function) => {
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

export const loginUser = async (ctx: koa.Context, next: Function) => {
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
      sameSite: "strict",
    });
    ctx.body = { userId: user.id };
    ctx.status = 200;
  } catch (e) {
    console.log("401 Unauthorized");
    ctx.status = 401;
  }
};

export const getVerifyUser = async (ctx: koa.Context, next: Function) => {
  let accessToken = ctx.cookies.get("accessToken");
  if (accessToken) {

    let userId = getUserId(accessToken);

    const user = await User.findOne({
      where: { id: userId },
    });

    if (userId === -1 || userId !== user?.id) {
      ctx.status = 401;
    } else {
      ctx.body = { userId: userId };
      ctx.status = 200;
    }
  } else {
    ctx.status = 401;
  }
};

export const getUserLogout = async (ctx: koa.Context, next: Function) => {
  let accessToken = ctx.cookies.get("accessToken");
  if (accessToken && verifyToken(accessToken)) {
    ctx.cookies.set("accessToken");
    ctx.status = 200;
  } else {
    ctx.status = 401;
  }
};

export const getUserServers = async (ctx: koa.Context, next: Function) => {
  let res = await getAllCombinedState(ctx.state.user._id);
  if (res) {
    ctx.body = res;
    ctx.status = 200;
  } else {
    ctx.body = "No servers found!";
    ctx.status = 404;
  }
};

export const getIndServer = async (ctx: koa.Context, next: Function) => {
  const server = await getOneCombinedState(ctx.params.id, ctx.state.user._id);
  if (server) {
    ctx.body = server;
    ctx.status = 200;
  } else {
    ctx.body = "Server not found!";
    ctx.status = 404;
  }
};

export const getServerUsage = async (ctx: koa.Context, next: Function) => {
  const data = await getMonitoredUsageData(
    ctx.params.id,
    ctx.state.user._id,
    ctx.params.inc,
    ctx.params.incCount
  );
  if (data) {
    ctx.body = data;
    ctx.status = 200;
  } else {
    ctx.body = "Error retrieving data.";
    ctx.status = 404;
  }
};

export const deleteServer = async (ctx: koa.Context, next: Function) => {
  try {
    const user = await User.findByPk(ctx.state.user._id);

    if (!user) {
      ctx.body = "User not found!";
      ctx.status = 404;
      return;
    }

    await ExtensionServer.destroy({
      where: {
        serverid: ctx.params.id,
        userid: user.id,
      },
    });

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
  name: Joi.string().required(),
  sslExpiry: Joi.number(),
  interval: Joi.string().required(),
  serverOptions: {
    emailNotifications: Joi.boolean().required(),
    checkHttp: Joi.boolean().required(),
  },
});

const liveServerSchema = Joi.object({
  userid: Joi.number().required(),
  serverid: Joi.number().required(),
  url: Joi.string().uri().required(),
  status: Joi.string().required(),
  sslStatus: Joi.string().required(),
  memUsage: Joi.number(),
  diskData: Joi.array<object>(),
  httpCode: Joi.number(),
  cpuUsage: Joi.number(),
});

const extensionServerSchema = Joi.object({
  serverid: Joi.number().required(),
  userid: Joi.number().required(),
  optionalUrl: Joi.string().uri().allow(""),
  upgrades: Joi.string(),
  smart: Joi.array(),
  uptime: {
    Days: Joi.number(),
    Hours: Joi.number(),
  },
  trackOptions: {
    trackDisk: Joi.boolean().required(),
    trackResources: Joi.boolean().required(),
    trackUpgrades: Joi.boolean().required(),
    trackSmart: Joi.boolean().required(),
  },
});

const extensionServerUpdateSchema = Joi.object({
  serverid: Joi.number().required(),
  userid: Joi.number().required(),
  optionalUrl: Joi.string().uri().allow(""),
  smart: Joi.array(),
  trackOptions: {
    trackDisk: Joi.boolean().required(),
    trackResources: Joi.boolean().required(),
    trackUpgrades: Joi.boolean().required(),
    trackSmart: Joi.boolean().required(),
  },
});

/*
  API:
  url: url for new server to track
  optionalUrl: extensionServerUrl / go server url
  name: title of the server
  // Which server information to display.
  trackOptions: {
    trackDisk - Boolean
    trackResources - Boolean
    trackUpgrades - Boolean
    trackSmart - Boolean
  }
*/
export const addServer = async (ctx: koa.Context, next: Function) => {
  const { url, optionalUrl, name, trackOptions, serverOptions, interval } =
    ctx.request.body;

  // Check if URL is empty
  if (!url || url === URL_EMPTY_DEFAULT) {
    ctx.body = "URL cannot be empty.";
    ctx.status = 422;
    return;
  }

  try {
    // If extensionServer Url is bad, just return error.
    // This is so we short circuit before we get too far
    // and it takes forever to return an error.
    const extensionSchema = Joi.string().uri();
    const error = optionalUrl ? extensionSchema.validate(optionalUrl) : null;
    if (error?.error) {
      ctx.body = "Optional backend must have a valid address.";
      ctx.status = 422;
      return;
    }

    // Send back a timeout error after 60 seconds if we don't get a response.
    // This short circuits in cases where SSL isn't configured on a redirect,
    // for example, which will just hang for a long time.
    const timeout = await timeoutChecker(url)
    if(timeout) {
      throw new Error("timeout")
    }

    let sslInfo: IResolvedValues | any = await getSslDetails(url);
    if (sslInfo.errno) sslInfo.valid = false;

    const extensionData = optionalUrl
      ? await extensionServerData(optionalUrl, ctx.state.user._id)
      : null;

    if (extensionData?.code === "ERR_HTTP_INVALID_HEADER_VALUE") {
      ctx.body =
        "Error with optional backend header. Check the URL or Address.";
      ctx.status = 422;
      return;
    }

    const user = await User.findByPk(ctx.state.user._id);

    const status = await isUp(url);
    const httpStatus = await getHttpStatusCode(url);

    if (!user) {
      ctx.body = "User not found!";
      ctx.status = 404;
      return;
    }

    const value = await serverSchema.validateAsync({
      userid: user.id,
      url,
      name: name,
      sslExpiry: sslInfo.daysRemaining,
      serverOptions: {
        emailNotifications: serverOptions?.emailNotifications,
        checkHttp: serverOptions?.checkHttp,
      },
      interval: interval,
    });

    if (!user) throw Error("User not found!");
    let dbResp = await Server.create(value);

    const liveValue = await liveServerSchema.validateAsync({
      userid: ctx.state.user._id,
      serverid: dbResp?.dataValues.id,
      url,
      status: status,
      sslStatus: sslInfo.valid.toString(),
      diskData: extensionData ? extensionData?.DiskData : [],
      httpCode: httpStatus,
      memUsage: extensionData ? extensionData.memUsage : 0,
      cpuUsage: extensionData ? extensionData.cpuUsage : 0,
    });

    const extensionValue = await extensionServerSchema.validateAsync({
      serverid: dbResp.dataValues.id,
      userid: user.id,
      optionalUrl: optionalUrl,
      upgrades: extensionData ? extensionData.upgrades : "empty",
      smart: extensionData ? extensionData.smart : [""],
      uptime: extensionData ? SplitTime(extensionData.uptimeInHours) : {},
      trackOptions: trackOptions,
    });

    await ExtensionServer.create(extensionValue);
    await LiveServer.create(liveValue);
    await setupGlobalCron(url, ctx.state.user._id, dbResp?.dataValues.id);

    ctx.body = { Status: "Server added.", id: dbResp.id };
    ctx.status = 201;
  } catch (error: any) {
    if (error?.message === 'timeout') {
      console.log("Timeout occured.")
      ctx.body = "Server timed out, check your dns. If this is a redirect, ensure SSL is properly configured."
      ctx.status = 500
    } else if ((error as any)?.isJoi) {
      console.log("JOI ERROR OCCURED: ", error);
      if (error?._original?.serverid) {
        Server.destroy({ where: { id: error?._original?.serverid } });
      }
      ctx.body =
        "Ensure ServerHuD backend is running and the input is correct.";
      ctx.status = 422;
    } else {
      ctx.body = "Unknown server error has occured.";
      ctx.status = 400;
    }
  }
};

export const getTimeseriesUpData = async (ctx: koa.Context, next: Function) => {
  let res = await getMonitoredUpInfo(
    ctx.params.id,
    ctx.state.user._id,
    ctx.params.upInc
  );
  ctx.body = res;
  ctx.status = 200;
};

export const updateServer = async (ctx: koa.Context, next: Function) => {
  const { url, optionalUrl, name, trackOptions, serverOptions, interval } =
    ctx.request.body;

  // Check if URL is empty
  if (!url || url === URL_EMPTY_DEFAULT) {
    ctx.body = "URL cannot be empty.";
    ctx.status = 422;
    return;
  }

  try {
    const extensionData = optionalUrl
      ? await getExtSelectedData(optionalUrl, trackOptions, ctx.state.user._id)
      : null;

    if (extensionData?.code === "ERR_HTTP_INVALID_HEADER_VALUE") {
      ctx.body =
        "Error with optional backend header. Check the URL or Address.";
      ctx.status = 422;
      return;
    }

    let sslInfo: IResolvedValues | any = await getSslDetails(url);
    if (sslInfo.errno) sslInfo.valid = false;

    const user = await User.findByPk(ctx.state.user._id);

    if (!user) {
      ctx.body = "User not found!";
      ctx.status = 404;
      return;
    }

    const status = await isUp(url);
    const httpStatus = await getHttpStatusCode(url);

    const value = await serverSchema.validateAsync({
      userid: user.id,
      url,
      name: name,
      sslExpiry: sslInfo.daysRemaining,
      serverOptions: {
        emailNotifications: serverOptions?.emailNotifications,
        checkHttp: serverOptions?.checkHttp,
      },
      interval: interval,
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
      diskData: extensionData ? extensionData.diskData : [],
      httpCode: httpStatus,
      memUsage: extensionData ? extensionData.memUsage : 0,
      cpuUsage: extensionData ? extensionData.cpuUsage : 0,
    });

    const extensionValue = await extensionServerUpdateSchema.validateAsync({
      serverid: ctx.params.id,
      userid: user.id,
      optionalUrl: optionalUrl,
      trackOptions: trackOptions,
    });

    await ExtensionServer.update(extensionValue, {
      where: {
        serverid: ctx.params.id,
        userid: user.id,
      },
    });

    await LiveServer.create(liveValue);
    await updateGlobalCron(url, ctx.state.user._id, ctx.params.id);

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
