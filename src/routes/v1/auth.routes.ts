import { Router } from 'express';

import {
  loginUser,
  logoutUser,
  registerUser,
} from '@/controllers/v1/auth.controller';
import validateRequestObj from '@/middlewares/validateRequestObj';
import {
  loginUserSchema,
  registerUserSchema,
} from '@/validations/auth.validation';
import { loginLimiter, registerLimiter } from '@/configs/rateLimiter';

const router = Router();

/**
 * @ROUTE {{URL}}/api/v1/auth
 */
process.env.NODE_ENV === 'production'
  ? router
      .route('/')
      .post(loginLimiter, validateRequestObj(loginUserSchema), loginUser)
  : router.route('/').post(validateRequestObj(loginUserSchema), loginUser);

process.env.NODE_ENV === 'production'
  ? router
      .route('/new')
      .post(
        registerLimiter,
        validateRequestObj(registerUserSchema),
        registerUser,
      )
  : router
      .route('/new')
      .post(validateRequestObj(registerUserSchema), registerUser);

router.route('/logout').post(logoutUser);

export default router;
