import { sequelize as db } from "../Models/index";
import bcrypt from "bcrypt";
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(4).alphanum().required(),
});

export const registerUser = async (ctx: any, next: Function) => {
  try {
    const value = await schema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    ctx.body = value;
  } catch (e) {
    ctx.body = `Error Message: ${e}`
  }
};
