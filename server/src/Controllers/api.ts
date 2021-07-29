import { User } from "../Models/user.model";
import bcrypt from "bcrypt";
import Joi from "joi";

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

export const loginUser = async(ctx: any) => {
  try {
    const value = await userSchema.validateAsync({
      email: ctx.request.body.email,
      password: ctx.request.body.password,
    });
    const user = await User.findOne({ where: { email: ctx.request.body.email } });
    if(user === null){
      ctx.body = "Issue logging in, please try again!"
      return ctx.status = 403;
    }
    const validatedPass = await bcrypt.compare(ctx.request.body.password, user.password);
    if (!validatedPass) throw new Error();
    ctx.body = "Logged in!"
    ctx.status = 200;
  } catch (e) {
    ctx.body = `${e}`
  }
}