import Koa from "koa";
import { getUserId } from "../Utils/jwt";
import { User } from "../Models/user.model";
import { checkRolePerms } from "../Utils/roleManagement";

export const permissionMiddleware = (perms: string[]) => {
    return async (ctx: Koa.Context, next: Function) => {
        let accessToken = ctx.cookies.get("accessToken");
        if (accessToken) {
          let userId = getUserId(accessToken);
          const user = await User.findOne({
            where: {
              id: userId,
            },
            attributes: ["roleId"],
          });
          if (await checkRolePerms(perms, user?.dataValues.roleId)) {
            await next();
          } else {
            ctx.status = 403;
            ctx.body = `You do not have permission to access this resource.`;
          }
        }
    }
};
