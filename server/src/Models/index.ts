import { AfterCreate, Sequelize, getHooks } from 'sequelize-typescript'
import { User } from './user.model';
import { Server } from './server.model';
import { LiveServer } from './liveServer.model';
import { HudServer } from './hudServer.model';

export const sequelize = new Sequelize({
  database: process.env.DATABASE,
  dialect: 'postgres',
  username: process.env.DB_USERNAME,
  password: process.env.DB_PW
})

sequelize.addModels([User, Server, LiveServer, HudServer]);
