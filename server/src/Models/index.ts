import { Sequelize } from 'sequelize-typescript'

export const sequelize = new Sequelize({
  database: 'serverhud',
  dialect: 'postgres',
  username: 'postgres',
  password: 'dbpass',
  models: [__dirname + '/models/**/*.model.ts'],
  modelMatch: (filename, member) => {
    return filename.substring(0, filename.indexOf('.model')) === member.toLowerCase();
  },
})