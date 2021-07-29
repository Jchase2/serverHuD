import Router from '@koa/router';

const router = new Router();

import {registerUser} from '../Controllers/api';

router
  .get('/', (ctx) => {
    ctx.body = "Test"
  })
  .post('/register', registerUser)

  export default router;