require('dotenv').config();
import Koa from 'koa';
import {sequelize} from './Models/index';
import router from './Router/routes';
import koaBody from 'koa-body';

const app = new Koa();

app.use(koaBody());
app.use(router.routes());

(async () => {
  await sequelize.sync({force: true});
  app.listen(process.env.PORT || 3001, () => console.log('Server running.'));
})();
