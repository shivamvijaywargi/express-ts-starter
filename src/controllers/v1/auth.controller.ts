import asyncHandler from '@/middlewares/asyncHandler.middleware';
import VerifyResetToken from '@/models/verifyResetToken.model';
import { createUser } from '@/services/auth.service';
import AppErr from '@/utils/AppErr';
import sendEmail from '@/utils/sendEmail';
import sendResp from '@/utils/sendResp';
import { randomBytes } from 'crypto';
import { RequestHandler } from 'express';

export const registerUser: RequestHandler = asyncHandler(
  async (req, res, next) => {
    const newUser = await createUser(req.body, next);

    if (!newUser) {
      return next(
        new AppErr('User could not be registered, please try again.', 500),
      );
    }

    const verificationToken = randomBytes(32).toString('hex');

    const emailVerificationToken = await VerifyResetToken.create({
      _userId: newUser._id,
      token: verificationToken,
    });

    const emailLink = `${process.env.CLIENT_URL}/api/v1/auth/verify/${emailVerificationToken.token}/${newUser._id}`;

    const payload = {
      name: newUser.firstName,
      link: emailLink,
    };

    await sendEmail(
      newUser.email,
      'Account Verification',
      payload,
      '../templates/accountVerification.handlebars',
    );

    res.status(201).json(sendResp('User registered successfully', newUser));
  },
);
