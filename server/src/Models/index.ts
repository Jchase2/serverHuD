import { Sequelize } from 'sequelize-typescript'
import { User } from './user.model';
import { Server } from './server.model';
import { LiveServer } from './liveServer.model';
import { ExtensionServer } from './extensionServer.model';
import { Role } from './role.model';
import { Permission } from './permission.model';
import { RolePermissions } from './rolePerms.model';

export const sequelize = new Sequelize({
  database: process.env.DATABASE,
  dialect: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PW
})

sequelize.addModels([User, Server, LiveServer, ExtensionServer, Role, Permission, RolePermissions]);
