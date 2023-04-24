import { Router } from 'express';

import { registerUser } from '@/controllers/v1/auth.controller';
import validateRequestObj from '@/middlewares/validateRequestObj';
import { registerUserSchema } from '@/validations/auth.validation';

const router = Router();

/**
 * @ROUTE {{URL}}/api/v1/auth
 */
router.route('/new').post(validateRequestObj(registerUserSchema), registerUser);

export default router;
