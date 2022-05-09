require('dotenv').config();
import Koa from 'koa';
import {sequelize} from './Models/index';
import router from './Router/routes';
import koaBody from 'koa-body';
import logger from 'koa-logger';
import cors from '@koa/cors';

const app = new Koa();
app.use(logger());

app.use(cors());
app.use(koaBody());
app.use(router.routes());

(async () => {
  await sequelize.sync({force: false});
  app.listen( 3001, () => console.log(`Server running on port: ${3001}`));
})();
