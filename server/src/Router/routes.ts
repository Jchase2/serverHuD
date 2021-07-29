import Router from '@koa/router';

const router = new Router();

import {registerUser, loginUser} from '../Controllers/api';

router
  .get('/', (ctx) => {
    ctx.body = "Test"
  })
  .post('/register', registerUser)
  .post('/login', loginUser)

  export default router;