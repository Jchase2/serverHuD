import { Sequelize } from 'sequelize-typescript'
import { User } from './user.model';

export const sequelize = new Sequelize({
  database: 'serverhud',
  dialect: 'postgres',
  username: 'postgres',
  password: 'dbpass',
})

sequelize.addModels([User]);
