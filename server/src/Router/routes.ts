import Router from '@koa/router';
import {registerUser, loginUser, getUserServers} from '../Controllers/api';
import jwt from 'koa-jwt';

const router = new Router();

// Unsecured Routes
router
  .post('/register', registerUser)
  .post('/login', loginUser)

// All routes after this line require a JWT token in the auth header!
router.use(jwt({ secret: process.env.SECRET_KEY || 'insecureuY47Qf2xo3M9kKjF67hq' }));

router
  .get('/', getUserServers)

export default router;