import { User } from "../Models/user.model";
import { Sequelize } from "sequelize-typescript";
import bcrypt from "bcrypt";
import Joi from "joi";
import jwt from "jsonwebtoken";
import {getSslDetails, hudServerData, isUp} from '../Utils/serverDetails';
import shortHash from "shorthash2";

const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

export const registerUser = async (ctx: any) => {
  try {
    const value = await userSchema.validateAsync({
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
    ctx.status = 400;
    ctx.body = `${e}`;
  }
};

export const loginUser = async (ctx: any) => {
  try {
    const value = await userSchema.validateAsync({
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
      {expiresIn: '7d'}
    );
    ctx.body = { accessToken };
    ctx.status = 200;
  } catch (e) {
    ctx.body = `${e}`;
    ctx.status = 401;
  }
};

export const getUserServers = async (ctx: any) => {
  const user = await User.findByPk(ctx.state.user._id);
  if (user?.servers) {
    ctx.body = user?.servers;
    ctx.status = 200;
  } else {
    ctx.body = "No servers found!";
    ctx.status = 404;
  }
};

export const getIndServer = async (ctx: any) => {
  const user = await User.findByPk(ctx.state.user._id);
  if (user?.servers) {
    // Response from findByPk is non-iteratable, this converts
    // it to a regular array of objects :') This is probably
    // pretty inefficient but it's just one small obj so whatever.
    let userServers = JSON.parse(JSON.stringify(user.servers));
    userServers.map((e: any) => {
      if(ctx.params.id === e.id){
        console.log("e: ", e)
        ctx.body = e;
        ctx.status = 200;
      }
    })
  } else {
    ctx.body = "Server not found!";
    ctx.status = 404;
  }
}


export const fetchHudServer = async (ctx: any) => {
  const user = await User.findByPk(ctx.state.user._id);
  if (user?.servers) {
    ctx.body = user?.servers;
    ctx.status = 200;
  } else {
    ctx.body = "No servers found!";
    ctx.status = 404;
  }
};

const serverSchema = Joi.object({
  id: Joi.string(),
  url: Joi.string().uri().required(),
  name: Joi.string().required(),
  status: Joi.string(),
  sslStatus: Joi.string().required(),
  sslExpiry: Joi.number(),
  hudServerUrl: Joi.string().uri(),
  uptime: Joi.string(),
});

export const addServer = async (ctx: any) => {
  let serverId = shortHash(ctx.request.body.url);
  let sslInfo = await getSslDetails(ctx.request.body.url)
  if(sslInfo.errno) sslInfo.valid = false;
  const user = await User.findByPk(ctx.state.user._id);
  const status = await isUp(ctx.request.body.url);
  const value = await serverSchema.validateAsync({
    id: serverId,
    url: ctx.request.body.url,
    name: ctx.request.body.name,
    status: status,
    sslStatus: sslInfo.valid.toString(),
    sslExpiry: sslInfo.daysRemaining,
    hudServerUrl: ctx.request.body.hudServerUrl,
    uptime: ctx.request.body.uptime
  });
  try {
    if (!user) throw Error("User not found!");
    await User.update(
      {
        servers: Sequelize.fn(
          "array_append",
          Sequelize.col("servers"),
          JSON.stringify(value)
        ),
      },
      { where: { id: user.id } }
    );
    ctx.body = "Server added.";
    ctx.status = 201;
  } catch (error) {
    ctx.body = `${error}`;
    ctx.status = 400;
  }
};

