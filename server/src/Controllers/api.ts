import { User } from "../Models/user.model";
import { Server } from "../Models/server.model";
import bcrypt from "bcrypt";
import Joi, { optional } from "joi";
import jwt from "jsonwebtoken";
import { getSslDetails, hudServerData, isUp } from "../Utils/serverDetails";
import { setupSslCron, setupUrlCron } from "../Utils/cronUtils";
import { LiveServer } from "../Models/liveServer.model";
import { getAllCombinedState, getOneCombinedState } from "../Utils/apiUtils";

const URL_EMPTY_DEFAULT = "http://";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

export const registerUser = async (ctx: any) => {
  try {
    await userSchema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    const user = await User.findOne({
      where: { email: ctx.request.body.email },
    });
    if (user !== null) {
      ctx.body = "User already exists!";
      return (ctx.status = 409);
    }
    const hash = await bcrypt.hash(ctx.request.body.password, 10);
    User.create({ email: ctx.request.body.email, password: hash });
    ctx.body = "User Created!";
    ctx.status = 201;
  } catch (e) {
    console.log(e);
    ctx.status = 400;
    ctx.body = `${e}`;
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
    ctx.body = { accessToken: accessToken, userId: user.id };
    ctx.status = 200;
  } catch (e) {
    ctx.body = `${e}`;
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
  const server = await getOneCombinedState(ctx.params.id);

  if (server) {
    ctx.body = server;
    ctx.status = 200;
  } else {
    ctx.body = "Server not found!";
    ctx.status = 404;
  }
};

export const deleteServer = async (ctx: any) => {
  Server.destroy({
    where: {
      id: ctx.params.id,
    },
  })
    .then((data) => {
      ctx.body = "Server deleted!";
      ctx.status = 204;
    })
    .catch((error) => {
      console.log("ERROR DELETING");
      ctx.status = 404;
    });
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
  diskSpace: Joi.number(),
});

const SplitTime = (numberOfHours: number) => {
  var Days = Math.floor(numberOfHours / 24);
  var Remainder = numberOfHours % 24;
  var Hours = Math.floor(Remainder);
  return { Days: Days, Hours: Hours };
};

export const addServer = async (ctx: any) => {
  const { url } = ctx.request.body;
  // Check if URL is empty
  if (!url || url === URL_EMPTY_DEFAULT) {
    ctx.body = "URL cannot be empty.";
    ctx.status = 422;
    return;
  }

  let sslInfo: any = await getSslDetails(url);
  if (sslInfo.errno) sslInfo.valid = false;
  const hudData = ctx.request.body.optionalUrl
    ? await hudServerData(ctx.request.body.optionalUrl)
    : null;
  const user = await User.findByPk(ctx.state.user._id);
  const status = await isUp(url);

  try {
    const value = await serverSchema.validateAsync({
      userid: ctx.state.user._id,
      url,
      optionalUrl: ctx.request.body.optionalUrl,
      name: ctx.request.body.name,
      sslExpiry: sslInfo.daysRemaining,
      uptime: hudData ? SplitTime(hudData.uptimeInHours) : {},
      upgrades: hudData ? hudData.upgrades : "",
    });

    if (!user) throw Error("User not found!");
    let dbResp = await Server.create(value);

    const liveValue = await liveServerSchema.validateAsync({
      userid: ctx.state.user._id,
      serverid: dbResp?.dataValues.id,
      url,
      status: status,
      sslStatus: sslInfo.valid.toString(),
      diskSpace: hudData ? hudData.gbFreeOnCurrPartition : -1,
    });

    await LiveServer.create(liveValue);
    await setupUrlCron(url, ctx.state.user._id, dbResp?.dataValues.id);
    await setupSslCron(url, ctx.state.user._id, dbResp?.dataValues.id);

    ctx.body = { Status: "Server added.", id: dbResp.id };
    ctx.status = 201;
  } catch (error) {
    console.log("ERROR IS: ", error);
    if ((error as any)?.isJoi) {
      ctx.body = "Input validation failed";
      ctx.status = 422;
    } else {
      ctx.body = `${error}`;
      ctx.status = 400;
    }
  }
};