import { User } from "../Models/user.model";
import bcrypt from "bcrypt";
import Joi from "joi";

const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).alphanum().required(),
});

export const registerUser = async (ctx: any, next: Function) => {
  try {
    const value = await schema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    const user = await User.findOne({ where: { email: ctx.request.body.email } });
    if(user !== null){
      ctx.body = "User already exists!"
      return ctx.status = 409;
    }
    const hash = await bcrypt.hash(ctx.request.body.password, 10);
    User.create({ email: ctx.request.body.email, password: hash })
    ctx.body = "User Created!"
    ctx.status = 201;
  } catch (e) {
    ctx.body = `${e}`
  }
};
