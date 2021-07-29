const Koa = require('koa');
const app = new Koa();
import {sequelize} from './Models/index';


app.use(async (ctx: any) => {
  ctx.body = 'Hello World';
});


(async () => {
  await sequelize.sync({force: true});
  app.listen(3000, () => console.log('Server running.'));
})();
