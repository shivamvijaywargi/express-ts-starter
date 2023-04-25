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

const router = Router();

/**
 * @ROUTE {{URL}}/api/v1/auth
 */
router.route('/new').post(validateRequestObj(registerUserSchema), registerUser);
router.route('/').post(validateRequestObj(loginUserSchema), loginUser);
router.route('/logout').post(logoutUser);

export default router;
