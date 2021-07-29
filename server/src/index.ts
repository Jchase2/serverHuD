import Koa from 'koa';
import {sequelize} from './Models/index';
import router from './Router/routes';

const app = new Koa();


app.use(router.routes());

(async () => {
  await sequelize.sync({force: true});
  app.listen(3000, () => console.log('Server running.'));
})();
